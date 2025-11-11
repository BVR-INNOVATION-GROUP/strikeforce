/**
 * Validate credentials by checking against user data
 * Passwords are now stored in mockUsers.json instead of hardcoded here
 * @param email - User email address
 * @param password - User password
 * @returns Promise<boolean> - True if credentials are valid
 */
export async function validateCredentials(
  email: string,
  password: string
): Promise<boolean> {
  try {
    // Load user data from mock file
    const usersData = await import("@/src/data/mockUsers.json");
    const users = usersData.default;

    // Find user by email
    const user = users.find((u: { email: string; password?: string }) => 
      u.email.toLowerCase() === email.toLowerCase()
    );

    // Check if user exists and password matches
    if (!user || !user.password) {
      return false;
    }

    return user.password === password;
  } catch (error) {
    console.error("Error validating credentials:", error);
    return false;
  }
}

