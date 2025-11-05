/**
 * Avatar utility functions for handling image fallbacks
 */

/**
 * Get user initials from name
 * Business rule: Use first letter of first name and first letter of last name
 * If only one name provided, use first letter only
 * @param name - User's full name
 * @returns Initials string (e.g., "JD" for "John Doe")
 */
export function getInitials(name?: string): string {
  if (!name || !name.trim()) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name[0].toUpperCase();
}

/**
 * Get avatar URL with fallback
 * Returns empty string if avatar is not provided or invalid
 * @param avatar - Avatar URL string
 * @returns Valid avatar URL or empty string
 */
export function getAvatarUrl(avatar?: string): string {
  if (!avatar || avatar.trim() === "") return "";
  return avatar.trim();
}

/**
 * Check if avatar URL is valid
 * @param avatar - Avatar URL string
 * @returns True if avatar is a non-empty string
 */
export function hasAvatar(avatar?: string): boolean {
  return Boolean(avatar && avatar.trim() !== "");
}


