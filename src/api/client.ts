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
const PRODUCTION_URL = "https://strikeforce-be-production.up.railway.app";
export const BASE_URL = PRODUCTION_URL;

/**
 * Get authentication token from storage
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/**
 * Build full URL with base path
 */
function buildUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  // Backend routes: /user/* or /api/v1/*
  return `${BASE_URL}/${cleanPath}`;
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
      console.log("[api.client] POST request:", {
        url,
        fullUrl,
        data,
        hasToken: !!token,
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
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      // Read response body once
      const responseText = await response.text();

      if (!response.ok) {
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
