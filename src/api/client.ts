/**
 * Base HTTP client with standard CRUD operations
 * Handles request/response formatting, error handling, and authentication
 */
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export const api = {
  /**
   * GET request
   * @param url - API endpoint
   * @param config - Optional fetch configuration
   */
  get: async <T>(url: string, config?: RequestInit): Promise<T> => {
    try {
      const response = await fetch(url, {
        ...config,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...config?.headers,
        },
      });
      if (!response.ok) {
        throw new Error(`GET ${url} failed: ${response.statusText}`);
      }
      return response.json() as Promise<T>;
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
      const response = await fetch(url, {
        ...config,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...config?.headers,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`POST ${url} failed: ${response.statusText}`);
      }
      return response.json() as Promise<T>;
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
      const response = await fetch(url, {
        ...config,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...config?.headers,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`PUT ${url} failed: ${response.statusText}`);
      }
      return response.json() as Promise<T>;
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
      const response = await fetch(url, {
        ...config,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...config?.headers,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`PATCH ${url} failed: ${response.statusText}`);
      }
      return response.json() as Promise<T>;
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
      const response = await fetch(url, {
        ...config,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...config?.headers,
        },
      });
      if (!response.ok) {
        throw new Error(`DELETE ${url} failed: ${response.statusText}`);
      }
      return response.json() as Promise<T>;
    } catch (error) {
      console.error(`API DELETE error for ${url}:`, error);
      throw error;
    }
  },
};




