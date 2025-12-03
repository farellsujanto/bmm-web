import crypto from 'crypto';

interface BrowserLimit {
  count: number;
  resetDate: string; // YYYY-MM-DD format
}

// In-memory store for browser request limits
const browserLimits = new Map<string, BrowserLimit>();

// Clean up old entries every hour
setInterval(() => {
  const today = new Date().toISOString().split('T')[0];
  for (const [fingerprint, limit] of browserLimits.entries()) {
    if (limit.resetDate !== today) {
      browserLimits.delete(fingerprint);
    }
  }
}, 60 * 60 * 1000); // 1 hour

export function generateBrowserFingerprint(ip: string | null, userAgent: string | null): string {
  const combined = `${ip || 'unknown'}_${userAgent || 'unknown'}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
}

export function checkBrowserLimit(fingerprint: string, maxRequests: number = 4): {
  allowed: boolean;
  remaining: number;
  resetDate: string;
} {
  const today = new Date().toISOString().split('T')[0];
  
  let limit = browserLimits.get(fingerprint);
  
  // Reset if it's a new day
  if (!limit || limit.resetDate !== today) {
    limit = { count: 0, resetDate: today };
    browserLimits.set(fingerprint, limit);
  }
  
  const remaining = Math.max(0, maxRequests - limit.count);
  const allowed = limit.count < maxRequests;
  
  return {
    allowed,
    remaining,
    resetDate: today
  };
}

export function incrementBrowserLimit(fingerprint: string): void {
  const today = new Date().toISOString().split('T')[0];
  
  let limit = browserLimits.get(fingerprint);
  
  if (!limit || limit.resetDate !== today) {
    limit = { count: 0, resetDate: today };
  }
  
  limit.count++;
  browserLimits.set(fingerprint, limit);
}

export function getBrowserLimitInfo(fingerprint: string): BrowserLimit | null {
  return browserLimits.get(fingerprint) || null;
}
