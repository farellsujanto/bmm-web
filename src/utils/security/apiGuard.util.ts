import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt, validateApiKey, validateJwtDeviceId } from './security.util';
import { JwtData } from './models/jwt.model';

export interface AuthenticatedRequest extends NextRequest {
  user?: JwtData;
}

export interface ApiGuardResult {
  success: boolean;
  user?: JwtData;
  error?: string;
  status?: number;
}

/**
 * Validates API key and device ID from request headers
 */
export function validateBasicHeaders(request: NextRequest): ApiGuardResult {
  const apiKey = request.headers.get('api-key');
  const deviceId = request.headers.get('x-device-id');

  if (!apiKey) {
    return {
      success: false,
      error: 'API key is required',
      status: 401
    };
  }

  if (!validateApiKey(apiKey)) {
    return {
      success: false,
      error: 'Invalid API key',
      status: 401
    };
  }

  if (!deviceId) {
    return {
      success: false,
      error: 'Device ID is required',
      status: 401
    };
  }

  return { success: true };
}

/**
 * Validates JWT token from Authorization header
 */
export function validateAuthToken(request: NextRequest): ApiGuardResult {
  // First validate basic headers
  const basicValidation = validateBasicHeaders(request);
  if (!basicValidation.success) {
    return basicValidation;
  }

  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      success: false,
      error: 'Authorization token is required',
      status: 401
    };
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const user = verifyJwt(token);
    
    if (!user) {
      return {
        success: false,
        error: 'Invalid or expired token',
        status: 401
      };
    }

    // Validate device ID matches token
    // const deviceId = request.headers.get('x-device-id');
    // const extraPrivateSalt = process.env.EXTRA_SALT || '';
    
    // if (deviceId && !validateJwtDeviceId(token, deviceId, extraPrivateSalt)) {
    //   return {
    //     success: false,
    //     error: 'Device ID mismatch',
    //     status: 401
    //   };
    // }

    return {
      success: true,
      user
    };
  } catch (error) {
    return {
      success: false,
      error: 'Token verification failed',
      status: 401
    };
  }
}

/**
 * Validates user role against required roles
 */
export function validateRole(user: JwtData, allowedRoles: string[]): ApiGuardResult {
  if (!allowedRoles.includes(user.role)) {
    return {
      success: false,
      error: 'Insufficient permissions',
      status: 403
    };
  }

  return { success: true, user };
}

/**
 * Middleware wrapper for protected routes
 * Validates auth token and optionally checks user role
 */
export function requireAuth(
  handler: (request: NextRequest, user: JwtData) => Promise<NextResponse>,
  allowedRoles?: string[]
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Validate auth token
    const authResult = validateAuthToken(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    // Check role if specified
    if (allowedRoles && allowedRoles.length > 0) {
      const roleResult = validateRole(authResult.user, allowedRoles);
      
      if (!roleResult.success) {
        return NextResponse.json(
          { success: false, message: roleResult.error },
          { status: roleResult.status || 403 }
        );
      }
    }

    // Call the handler with authenticated user
    return handler(request, authResult.user);
  };
}

/**
 * Middleware for routes that only need API key validation (no auth token)
 */
export function requireApiKey(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const validation = validateBasicHeaders(request);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: validation.status || 401 }
      );
    }

    return handler(request);
  };
}

/**
 * Extract user from request (for use in handlers that already validated auth)
 */
export function getUserFromRequest(request: NextRequest): JwtData | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    return verifyJwt(token);
  } catch {
    return null;
  }
}
