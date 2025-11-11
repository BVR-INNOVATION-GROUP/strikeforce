/**
 * Configuration utilities for data access
 * Handles switching between mock data and real API
 */

/**
 * Determines whether to use mock data or real API
 * Checks environment variables: DEBUG or NEXT_PUBLIC_USE_MOCK (true = use mock data)
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

