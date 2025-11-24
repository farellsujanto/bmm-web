type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions extends RequestInit {
  method?: RequestMethod;
  data?: any;
  params?: Record<string, string>;
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

async function processApiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    data,
    params,
    headers = {},
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
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Api-Key': process.env.NEXT_PUBLIC_API_KEY ?? '',
    // Add auth token if exists (check both token storage keys)
    ...(localStorage.getItem('authToken') && {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`
    }),
    ...headers,
  };

  const config: RequestInit = {
    method,
    headers: defaultHeaders,
    ...customConfig,
  };

  // Add body for non-GET requests
  if (data) {
    config.body = JSON.stringify(data);
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

    if (!response.ok) {
      const error: ApiError = new Error(responseData?.message || 'Something went wrong');
      error.status = response.status;
      error.data = responseData;
      
      // Redirect to access page on 401
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('phoneNumber');
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 1 second
        window.location.href = '/auth';
      }
      // 082123123777
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
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'Api-Key': process.env.NEXT_PUBLIC_API_KEY ?? ''
    },
    body: formData
  });

  if (response.status === 401) {
    window.location.href = '/auth';
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
  
  postFormData
};