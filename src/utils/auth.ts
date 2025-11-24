import forge from 'node-forge';
import { apiRequest } from './api/apiRequest';

// Utility functions for client-side authentication
export const AUTH_CONFIG = {
  API_KEY: process.env.NEXT_PUBLIC_API_KEY || 'your-api-key-here',
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '',
};

// SHA256 hash function for browser
const sha256 = async (message: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const generateDeviceId = async (): Promise<string> => {
  const timestamp = Date.now().toString();
  const randomStr = Math.random().toString();
  const userAgent = navigator.userAgent;
  const screenInfo = `${screen.width}x${screen.height}`;

  // Combine multiple factors for uniqueness
  const rawId = `web_${timestamp}_${randomStr}_${userAgent}_${screenInfo}`;

  // Hash the combined string for consistent length and privacy
  const hashedId = await sha256(rawId);
  return hashedId;
};

// Enhanced device ID management - ensures device ID exists and is saved
export const ensureDeviceId = async (): Promise<string> => {
  let deviceId = localStorage.getItem('deviceId');
  
  if (!deviceId) {
    deviceId = await generateDeviceId();
    localStorage.setItem('deviceId', deviceId);
  }
  
  return deviceId;
};

// Mock RSA encryption (replace with actual implementation)
export interface RSAEncryptedData {
  encryptedData: string;
  iv: string;
  key: string;
}

// Get RSA public key from server
const getRSAPublicKey = async (): Promise<string> => {
  try {
    const response = await fetch('/api/v1/auth/generate-key?type=login', {
      method: 'GET',
      headers: {
        'x-api-key': AUTH_CONFIG.API_KEY
      }
    });

    const result = await response.json();
    if (result.success) {
      return result.data.publicKey;
    } else {
      throw new Error(result.message || 'Failed to get public key');
    }
  } catch (error) {
    console.error('Failed to get RSA public key:', error);
    throw error;
  }
};

// Browser-compatible RSA encryption using Web Crypto API
export const encryptPinWithRSA = async (pin: string): Promise<RSAEncryptedData> => {
  try {
    // Get public key from server
    const publicKeyPem = await getRSAPublicKey();
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

    // Generate random AES key and IV
    const aesKey = forge.random.getBytesSync(32); // 256-bit key
    const iv = forge.random.getBytesSync(16); // 128-bit IV

    // Encrypt PIN with AES
    const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
    cipher.start({ iv: iv });
    cipher.update(forge.util.createBuffer(pin));
    cipher.finish();

    const encryptedData = cipher.output.getBytes();

    // Encrypt AES key with RSA
    const encryptedAESKey = publicKey.encrypt(aesKey, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      mgf1: forge.mgf.mgf1.create(forge.md.sha256.create())
    });

    return {
      encryptedData: forge.util.encode64(encryptedData),
      iv: forge.util.encode64(iv),
      key: forge.util.encode64(encryptedAESKey)
    };
  } catch (error) {
    console.error('PIN encryption failed:', error);
    throw new Error('Failed to encrypt PIN');
  }
};

export const getAuthHeaders = async () => {
  await ensureDeviceId(); // Ensure device ID exists
  const deviceId = localStorage.getItem('deviceId');
  const authToken = localStorage.getItem('authToken');

  return {
    'Content-Type': 'application/json',
    'X-Device-Id': deviceId || '',
    'Api-Key': AUTH_CONFIG.API_KEY,
    'Access-Device-Type': 'web',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
  };
};

// Auth API wrapper functions using apiRequest
export const authApi = {
  checkPhone: async (phoneNumber: string) => {
    await ensureDeviceId(); // Ensure device ID exists and is saved

    return apiRequest.post('/v1/auth/check', { phoneNumber }, {
      headers: await getAuthHeaders()
    });
  },

  register: async (data: {
    phoneNumber: string;
    fullName: string;
    organizationName: string;
    organizationFields?: string;
  }) => {
    await ensureDeviceId(); // Ensure device ID exists and is saved
    
    return apiRequest.post<any>('/v1/user/register', data, {
      headers: await getAuthHeaders()
    });
  },

  sendOtp: async (phoneNumber: string) => {
    await ensureDeviceId(); // Ensure device ID exists and is saved
    
    return apiRequest.post('/v1/user/otp', { phoneNumber }, {
      headers: await getAuthHeaders()
    });
  },

  verifyOtp: async (phoneNumber: string, otp: string) => {
    await ensureDeviceId(); // Ensure device ID exists and is saved
    
    return apiRequest.put('/v1/user/otp', { phoneNumber, otp }, {
      headers: await getAuthHeaders()
    });
  },

  login: async (encryptedPin: RSAEncryptedData) => {
    await ensureDeviceId(); // Ensure device ID exists and is saved
    
    return apiRequest.post('/v1/user/login', { encryptedPin }, {
      headers: await getAuthHeaders()
    });
  }
};
