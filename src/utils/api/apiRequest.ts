type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions extends RequestInit {
  method?: RequestMethod;
  data?: any;
  params?: Record<string, string>;
  skipAuthRefresh?: boolean; // Flag to prevent infinite loops
}

interface ApiError extends Error {
  status?: number;
  data?: any;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Store for in-memory access token (will be synced with AuthContext)
let inMemoryAccessToken: string | null = null;

export function setInMemoryToken(token: string | null) {
  inMemoryAccessToken = token;
}

export function getInMemoryToken(): string | null {
  return inMemoryAccessToken;
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.NEXT_PUBLIC_API_KEY ?? '',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.success && data.data?.accessToken) {
      setInMemoryToken(data.data.accessToken);
      return data.data.accessToken;
    }

    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}

async function processApiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    data,
    params,
    headers = {},
    skipAuthRefresh = false,
    ...customConfig
  } = options;

  // Construct URL with query parameters
  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.keys(params).forEach(key => 
      url.searchParams.append(key, params[key])
    );
  }

  // Prepare headers
  const isFormData = data instanceof FormData;
  const defaultHeaders: HeadersInit = {
    ...(!isFormData && { 'Content-Type': 'application/json' }), // Don't set Content-Type for FormData
    'Api-Key': process.env.NEXT_PUBLIC_API_KEY ?? '',
    // Add in-memory access token if exists
    ...(inMemoryAccessToken && {
      Authorization: `Bearer ${inMemoryAccessToken}`
    }),
    ...headers,
  };

  const config: RequestInit = {
    method,
    headers: defaultHeaders,
    credentials: 'include', // Important: include cookies for refresh token
    ...customConfig,
  };

  // Add body for non-GET requests
  if (data) {
    config.body = isFormData ? data : JSON.stringify(data);
  }

  try {
    const response = await fetch(url.toString(), config);
    
    // First try to get the response data
    let responseData: ApiResponse<T>;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = {
        success: false,
        message: 'Invalid JSON response',
        data: null as T
      };
    }

    // Handle 401 - try to refresh token and retry
    if (response.status === 401 && !skipAuthRefresh) {
      const newToken = await refreshAccessToken();
      
      if (newToken) {
        // Retry the original request with new token
        return processApiRequest<T>(endpoint, { 
          ...options, 
          skipAuthRefresh: true // Prevent infinite loop
        });
      } else {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Session expired. Please login again.');
      }
    }

    if (!response.ok) {
      const error: ApiError = new Error(responseData?.message || 'Something went wrong');
      error.status = response.status;
      error.data = responseData;
      throw error;
    }

    return responseData;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
}

async function postFormData<T>(url: string, formData: FormData): Promise<ApiResponse<T>> {
  const response = await fetch(`/api${url}`, {
    method: 'POST',
    headers: {
      ...(inMemoryAccessToken && {
        Authorization: `Bearer ${inMemoryAccessToken}`
      }),
      'Api-Key': process.env.NEXT_PUBLIC_API_KEY ?? ''
    },
    credentials: 'include',
    body: formData
  });

  if (response.status === 401) {
    // Try to refresh and retry
    const newToken = await refreshAccessToken();
    if (newToken) {
      const retryResponse = await fetch(`/api${url}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${newToken}`,
          'Api-Key': process.env.NEXT_PUBLIC_API_KEY ?? ''
        },
        credentials: 'include',
        body: formData
      });
      return await retryResponse.json();
    } else {
      window.location.href = '/login';
    }
  }

  return await response.json();
}

// Convenience methods
export const apiRequest = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    processApiRequest<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T>(endpoint: string, data?: any, options?: RequestOptions) => 
    processApiRequest<T>(endpoint, { ...options, method: 'POST', data }),
  
  put: <T>(endpoint: string, data?: any, options?: RequestOptions) => 
    processApiRequest<T>(endpoint, { ...options, method: 'PUT', data }),
  
  patch: <T>(endpoint: string, data?: any, options?: RequestOptions) => 
    processApiRequest<T>(endpoint, { ...options, method: 'PATCH', data }),
  
  delete: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    return processApiRequest<T>(endpoint, { method: 'PATCH', data: { enabled: false } });
  },
  
  postFormData,
  
  // Export token management functions
  setToken: setInMemoryToken,
  getToken: getInMemoryToken,
};