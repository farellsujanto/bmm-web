// This file is deprecated and kept for backward compatibility
// Use AuthContext from @/src/contexts/AuthContext instead

export function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'api-key': process.env.NEXT_PUBLIC_API_KEY || '',
  };
  
  // Note: Authorization header is now handled by apiRequest.ts
  // which uses in-memory token automatically
  
  return headers;
}

export function isAuthenticated(): boolean {
  // This is now handled by AuthContext
  // This function is kept for backward compatibility only
  return false;
}

export function logout(): void {
  // This is now handled by AuthContext.logout()
  // This function is kept for backward compatibility only
  console.warn('authHelpers.logout() is deprecated. Use AuthContext.logout() instead');
}
