/**
 * Format Indonesian Rupiah with K (ribu), JT (juta), M (milyar) suffix
 * @param amount - Amount in Rupiah
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string (e.g., "1.5K", "2.3JT", "1.2M")
 */
export function formatRupiah(amount: number, decimals: number = 1): string {
  if (amount === 0) return '0';
  
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  // Milyar (Billions) - M
  if (absAmount >= 1_000_000_000) {
    return `${sign}${(absAmount / 1_000_000_000).toFixed(decimals)}M`;
  }
  
  // Juta (Millions) - JT
  if (absAmount >= 1_000_000) {
    return `${sign}${(absAmount / 1_000_000).toFixed(decimals)}JT`;
  }
  
  // Ribu (Thousands) - K
  if (absAmount >= 1_000) {
    return `${sign}${(absAmount / 1_000).toFixed(decimals)}K`;
  }
  
  // Less than 1000
  return `${sign}${absAmount.toFixed(0)}`;
}

/**
 * Format full Rupiah with locale
 * @param amount - Amount in Rupiah
 * @returns Formatted string (e.g., "Rp 1.500.000")
 */
export function formatFullRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}
