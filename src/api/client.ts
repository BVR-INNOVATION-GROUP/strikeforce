/**
 * Base HTTP client with standard CRUD operations
 * Handles request/response formatting, error handling, and authentication
 */
export interface ApiResponse<T> {
  data: T;
  msg?: string;
  error?: string;
}

/**
 * Extract data from backend response format {msg, data}
 */
function extractData<T>(response: ApiResponse<T> | T): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiResponse<T>).data;
  }
  return response as T;
}

const DEV_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const PRODUCTION_URL = "https://strikeforce-apiv1.bvrdesign.africa";
export const BASE_URL = PRODUCTION_URL;

/**
 * Get authentication token from storage
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/**
 * Handle session expiry - automatically logout user on 401 responses
 */
async function handleSessionExpiry(): Promise<void> {
  // Only run on client side
  if (typeof window === "undefined") return;

  try {
    // Dynamically import to avoid circular dependencies
    const { useAuthStore } = await import("@/src/store/useAuthStore");
    const authStore = useAuthStore.getState();

    // Check if user is authenticated before logging out
    if (authStore.isAuthenticated || authStore.user) {
      console.warn("Session expired. Logging out user...");

      // Call logout function
      authStore.logout();

      // Redirect to login page after a short delay to ensure cleanup completes
      setTimeout(() => {
        // Only redirect if we're not already on the login page
        if (window.location.pathname !== "/auth/login") {
          window.location.href = "/auth/login";
        }
      }, 200);
    }
  } catch (error) {
    console.error("Error handling session expiry:", error);
    // Fallback: clear token and redirect
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/auth/login") {
        window.location.href = "/auth/login";
      }
    }
  }
}

/**
 * Build full URL with base path
 * Ensures the URL is always absolute (starts with http:// or https://)
 * This prevents Next.js from intercepting the call as a Next.js API route
 */
function buildUrl(path: string): string {
  // If path is already an absolute URL, return it as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // Ensure BASE_URL is set and is absolute
  if (
    !BASE_URL ||
    (!BASE_URL.startsWith("http://") && !BASE_URL.startsWith("https://"))
  ) {
    console.error(
      "[api.client] BASE_URL is not set or is not absolute:",
      BASE_URL
    );
    throw new Error(
      "API base URL is not configured correctly. Please set NEXT_PUBLIC_API_URL environment variable."
    );
  }

  // Construct absolute URL
  const absoluteUrl = `${BASE_URL}/${cleanPath}`;

  // Validate the constructed URL is absolute
  if (
    !absoluteUrl.startsWith("http://") &&
    !absoluteUrl.startsWith("https://")
  ) {
    console.error("[api.client] Constructed URL is not absolute:", absoluteUrl);
    throw new Error("Failed to construct absolute URL for API call");
  }

  return absoluteUrl;
}

export const api = {
  /**
   * GET request
   * @param url - API endpoint
   * @param config - Optional fetch configuration
   */
  get: async <T>(url: string, config?: RequestInit): Promise<T> => {
    try {
      const token = getAuthToken();
      const fullUrl = buildUrl(url);
      const response = await fetch(fullUrl, {
        ...config,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...config?.headers,
        },
      });

      if (!response.ok) {
        // Handle session expiry (401 Unauthorized)
        if (response.status === 401) {
          await handleSessionExpiry();
        }

        const errorText = await response.text();
        let errorMessage = `GET ${url} failed: ${response.statusText}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage =
            errorData.error ||
            errorData.message ||
            errorData.msg ||
            errorMessage;
        } catch {
          if (errorText) {
            // Try to extract meaningful error from HTML or plain text
            const trimmed = errorText.trim();
            if (trimmed.length > 0 && trimmed.length < 500) {
              errorMessage = trimmed;
            } else if (trimmed.length > 0) {
              errorMessage = trimmed.substring(0, 200);
            }
          }
        }

        // Create error with more context
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).statusText = response.statusText;
        throw error;
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const jsonResponse = await response.json();
        return extractData<T>(jsonResponse);
      }
      return response.text() as unknown as T;
    } catch (error) {
      console.error(`API GET error for ${url}:`, error);
      throw error;
    }
  },

  /**
   * POST request
   * @param url - API endpoint
   * @param data - Request body data
   * @param config - Optional fetch configuration
   */
  post: async <T>(
    url: string,
    data?: unknown,
    config?: RequestInit
  ): Promise<T> => {
    try {
      const token = getAuthToken();
      const fullUrl = buildUrl(url);

      // Validate URL is absolute before making the request
      if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
        console.error("[api.client] ERROR: URL is not absolute:", {
          originalUrl: url,
          builtUrl: fullUrl,
          baseUrl: BASE_URL,
        });
        throw new Error(
          `Invalid API URL: ${fullUrl}. URL must be absolute (start with http:// or https://)`
        );
      }

      console.log("[api.client] POST request:", {
        originalUrl: url,
        fullUrl,
        isAbsolute:
          fullUrl.startsWith("http://") || fullUrl.startsWith("https://"),
        baseUrl: BASE_URL,
        data: data ? JSON.stringify(data).substring(0, 200) + "..." : data,
        hasToken: !!token,
        timestamp: new Date().toISOString(),
      });

      const response = await fetch(fullUrl, {
        ...config,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...config?.headers,
        },
        body: JSON.stringify(data),
      });
      console.log("[api.client] POST response:", {
        status: response.status,
        statusText: response.statusText,
        url: fullUrl,
        ok: response.ok,
        timestamp: new Date().toISOString(),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      // Read response body once
      const responseText = await response.text();

      if (!response.ok) {
        // Handle session expiry (401 Unauthorized)
        if (response.status === 401) {
          await handleSessionExpiry();
        }

        // Try to extract error message from response body
        let errorMessage = `POST ${url} failed: ${response.statusText}`;
        if (isJson && responseText) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage =
              errorData.error ||
              errorData.message ||
              errorData.msg ||
              errorMessage;
          } catch {
            // If parsing fails, check if it's HTML (error page)
            if (
              responseText.trim().startsWith("<!DOCTYPE") ||
              responseText.trim().startsWith("<html")
            ) {
              errorMessage = `Server returned an error page. Check server logs for details.`;
            } else {
              errorMessage = responseText.substring(0, 200) || errorMessage;
            }
          }
        } else if (responseText) {
          // Not JSON, but has content
          if (
            responseText.trim().startsWith("<!DOCTYPE") ||
            responseText.trim().startsWith("<html")
          ) {
            errorMessage = `Server returned an error page. Check server logs for details.`;
          } else {
            errorMessage = responseText.substring(0, 200) || errorMessage;
          }
        }
        // Create error with more context
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).statusText = response.statusText;
        throw error;
      }

      if (!isJson) {
        throw new Error(
          `Expected JSON response from ${url}, got ${contentType}. Response: ${responseText.substring(
            0,
            100
          )}`
        );
      }

      const jsonResponse = JSON.parse(responseText);
      return extractData<T>(jsonResponse);
    } catch (error) {
      console.error(`API POST error for ${url}:`, error);
      throw error;
    }
  },

  /**
   * PUT request
   * @param url - API endpoint
   * @param data - Request body data
   * @param config - Optional fetch configuration
   */
  put: async <T>(
    url: string,
    data?: unknown,
    config?: RequestInit
  ): Promise<T> => {
    try {
      const token = getAuthToken();
      const fullUrl = buildUrl(url);
      console.log("[api.client] PUT request:", {
        url,
        fullUrl,
        data,
        hasToken: !!token,
      });
      const response = await fetch(fullUrl, {
        ...config,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...config?.headers,
        },
        body: JSON.stringify(data),
      });
      console.log("[api.client] PUT response:", {
        status: response.status,
        statusText: response.statusText,
        url: fullUrl,
      });

      if (!response.ok) {
        // Handle session expiry (401 Unauthorized)
        if (response.status === 401) {
          await handleSessionExpiry();
        }

        const errorText = await response.text();
        let errorMessage = `PUT ${url} failed: ${response.statusText}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          if (errorText) errorMessage = errorText.substring(0, 200);
        }
        // Create error with more context
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).statusText = response.statusText;
        throw error;
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const jsonResponse = await response.json();
        return extractData<T>(jsonResponse);
      }
      return response.text() as unknown as T;
    } catch (error) {
      console.error(`API PUT error for ${url}:`, error);
      throw error;
    }
  },

  /**
   * PATCH request
   * @param url - API endpoint
   * @param data - Request body data
   * @param config - Optional fetch configuration
   */
  patch: async <T>(
    url: string,
    data?: unknown,
    config?: RequestInit
  ): Promise<T> => {
    try {
      const token = getAuthToken();
      const fullUrl = buildUrl(url);
      const response = await fetch(fullUrl, {
        ...config,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...config?.headers,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Handle session expiry (401 Unauthorized)
        if (response.status === 401) {
          await handleSessionExpiry();
        }

        const errorText = await response.text();
        let errorMessage = `PATCH ${url} failed: ${response.statusText}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          if (errorText) errorMessage = errorText.substring(0, 200);
        }
        // Create error with more context
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).statusText = response.statusText;
        throw error;
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const jsonResponse = await response.json();
        return extractData<T>(jsonResponse);
      }
      return response.text() as unknown as T;
    } catch (error) {
      console.error(`API PATCH error for ${url}:`, error);
      throw error;
    }
  },

  /**
   * DELETE request
   * @param url - API endpoint
   * @param config - Optional fetch configuration
   */
  delete: async <T>(url: string, config?: RequestInit): Promise<T> => {
    try {
      const token = getAuthToken();
      const fullUrl = buildUrl(url);
      const response = await fetch(fullUrl, {
        ...config,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...config?.headers,
        },
      });

      if (!response.ok) {
        // Handle session expiry (401 Unauthorized)
        if (response.status === 401) {
          await handleSessionExpiry();
        }

        const errorText = await response.text();
        let errorMessage = `DELETE ${url} failed: ${response.statusText}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          if (errorText) errorMessage = errorText.substring(0, 200);
        }
        // Create error with more context
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).statusText = response.statusText;
        throw error;
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const jsonResponse = await response.json();
        return extractData<T>(jsonResponse);
      }
      return response.text() as unknown as T;
    } catch (error) {
      console.error(`API DELETE error for ${url}:`, error);
      throw error;
    }
  },
};
