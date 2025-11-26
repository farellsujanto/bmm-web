const DEVICE_ID_KEY = 'deviceId';

export function getDeviceId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(DEVICE_ID_KEY);
}

export function setDeviceId(deviceId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEVICE_ID_KEY, deviceId);
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function ensureDeviceId(): string {
  let deviceId = getDeviceId();
  
  if (!deviceId) {
    deviceId = generateUUID();
    setDeviceId(deviceId);
  }
  
  return deviceId;
}

export async function getAuthHeaders(): Promise<HeadersInit> {
  const deviceId = ensureDeviceId();
  const authToken = localStorage.getItem('authToken');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-device-id': deviceId,
    'api-key': process.env.NEXT_PUBLIC_API_KEY || '',
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('authToken');
  return !!token;
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
}
