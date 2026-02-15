/**
 * Format user names for display
 * Converts "User" to "Local Resident"
 * Converts "John Smith" to "John S."
 * Converts "Alice" to "Alice"
 */
export function formatUserName(name: string | null | undefined): string {
  if (!name || name.trim() === '' || name === 'User') {
    return 'Local Resident';
  }
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0]; // Just first name
  }
  
  // First name + last initial
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1][0];
  return `${firstName} ${lastInitial}.`;
}
