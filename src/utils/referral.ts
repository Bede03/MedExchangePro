/**
 * Generate a user-friendly referral reference from the referral number
 * Examples:
 * 1 -> REF-0001
 * 42 -> REF-0042
 */
export function generateReferralReference(numberOrId: string | number): string {
  // If it's a number or numeric string, format as REF-XXXX
  if (typeof numberOrId === 'number' || !isNaN(Number(numberOrId))) {
    const num = Number(numberOrId);
    return `REF-${String(num).padStart(4, '0')}`;
  }
  // Fallback for old ID format
  const friendlyPart = String(numberOrId).substring(0, 6).toUpperCase();
  return `REF-${friendlyPart}`;
}

/**
 * Format referral ID for display
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
