import { randomBytes } from 'crypto';

/**
 * Generate a unique referral code
 * Format: BMM-XXXXX (e.g., BMM-A7K9Q)
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters
  const length = 6;
  let code = 'BMM';
  
  const bytes = randomBytes(length);
  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }
  
  return code;
}

/**
 * Validate referral code format
 */
export function isValidReferralCode(code: string): boolean {
  return /^BMM[A-Z0-9]{6}$/.test(code);
}

/**
 * Calculate referral commission
 */
export function calculateReferralCommission(
  orderTotal: number,
  referralPercentage: number
): number {
  return (orderTotal * referralPercentage) / 100;
}

/**
 * Calculate user discount
 */
export function calculateUserDiscount(
  orderTotal: number,
  discountPercentage: number
): number {
  return (orderTotal * discountPercentage) / 100;
}

/**
 * Check if mission is achieved based on current progress
 */
export function checkMissionAchievement(
  currentProgress: number,
  targetValue: number
): boolean {
  return currentProgress >= targetValue;
}

/**
 * Calculate mission progress percentage
 */
export function calculateMissionProgress(
  currentProgress: number,
  targetValue: number
): number {
  if (targetValue === 0) return 0;
  return Math.min((currentProgress / targetValue) * 100, 100);
}
