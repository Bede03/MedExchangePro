/**
 * Generate a user-friendly referral reference from the full ID
 * Examples:
 * CMNCBQTTN0003ZKITV85LX5HA -> REF-CMNCBQ
 * XYZABC1234567890DEFGHIJ -> REF-XYZABC
 */
export function generateReferralReference(id: string): string {
  const friendlyPart = id.substring(0, 6).toUpperCase();
  return `REF-${friendlyPart}`;
}

/**
 * Format referral ID for display with optional formatting
 */
export function formatReferralId(id: string): string {
  return id.toUpperCase();
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}
