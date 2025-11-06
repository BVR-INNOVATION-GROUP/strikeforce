/**
 * Predefined user credentials for testing
 * Format: email -> password
 */
export const predefinedCredentials: Record<string, string> = {
  // Partner
  "john@techcorp.com": "password123",
  
  // Students
  "alice@university.edu": "password123",
  "bob@university.edu": "password123",
  "charlie@university.edu": "password123",
  "diana@university.edu": "password123",
  "eve@university.edu": "password123",
  "fiona@university.edu": "password123",
  "george@university.edu": "password123",
  "helen@university.edu": "password123",
  
  // Supervisor
  "prof.jones@university.edu": "password123",
  
  // University Admin
  "admin@university.edu": "password123",
  
  // Super Admin
  "admin@strikeforce.com": "password123",
  "kigongovincent625@gmail.com": "EOSjqq5&1&qD",
};

/**
 * Check if credentials are valid
 */
export function validateCredentials(email: string, password: string): boolean {
  const expectedPassword = predefinedCredentials[email];
  return expectedPassword === password;
}

