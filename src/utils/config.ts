/**
 * Configuration utilities for data access
 * 
 * @deprecated This file is deprecated. All repositories now connect directly to the backend API.
 * This function is kept only for backward compatibility with Next.js API routes that may still use it.
 * All frontend code should use repositories which call the backend directly.
 */

/**
 * Determines whether to use mock data or real API
 * 
 * @deprecated All repositories now connect directly to backend. This is only used by legacy Next.js API routes.
 * @returns true if DEBUG=true or NEXT_PUBLIC_USE_MOCK=true, false otherwise
 */
export function getUseMockData(): boolean {
  // Check NEXT_PUBLIC_USE_MOCK (available on both client and server)
  // Also check DEBUG (server-side only)
  // In Next.js, client-side code can only access NEXT_PUBLIC_* variables
  const useMock = 
    process.env.NEXT_PUBLIC_USE_MOCK === 'true' ||
    process.env.NEXT_PUBLIC_DEBUG === 'true' ||
    process.env.DEBUG === 'true';
  
  return useMock;
}

/**
 * Gets the authentication token from localStorage
 * @returns The JWT token or null if not found
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('authToken');
}

