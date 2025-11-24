import { NextRequest } from 'next/server';
import { verifyJwt, validateApiKey, createActiveDeviceId, verifyActiveDeviceId, createDidForJwt } from './security.util';
import { extractDataFromHeaders } from '../extractor/headerExtractor.util';
import { JwtData } from './models/jwt.model';
import prisma from '../database/prismaOrm.util';

// Define UserRole enum to match Prisma schema
export type UserRole = 'OWNER' | 'NONE' | 'NEW_USER';

export interface ApiGuardResult {
    isValid: boolean;
    error?: string;
    errorCode?: string;
    user?: {
        id: number;
        role: UserRole;
        phoneNumber: string;
        fullName: string;
        organizationId?: number;
        extraPrivateSalt: string;
    };
    jwtData?: JwtData;
    deviceId?: string;
}

export interface ApiGuardOptions {
    requireOtpCleared?: boolean; // xsx must be >= 1
    requirePinCleared?: boolean; // xsx must be 2
    allowedRoles?: UserRole[];
    skipDeviceValidation?: boolean;
    skipUserValidation?: boolean; // Skip user existence check
}

export async function validateApiGuard(
    request: NextRequest,
    options: ApiGuardOptions = {}
): Promise<ApiGuardResult> {
    try {
        // Extract headers
        const { apiKey, deviceId, authToken, deviceType } = extractDataFromHeaders(request);

        // Validate API key
        if (!apiKey) {
            return {
                isValid: false,
                error: 'API key is required',
                errorCode: 'MISSING_API_KEY'
            };
        }

        if (!validateApiKey(apiKey)) {
            return {
                isValid: false,
                error: 'Invalid API key',
                errorCode: 'INVALID_API_KEY'
            };
        }

        // Validate device ID (unless skipped)
        if (!options.skipDeviceValidation && !deviceId) {
            return {
                isValid: false,
                error: 'Device ID is required',
                errorCode: 'MISSING_DEVICE_ID'
            };
        }

        // Validate JWT token
        if (!authToken) {
            return {
                isValid: false,
                error: 'Authorization token is required',
                errorCode: 'MISSING_AUTH_TOKEN'
            };
        }

        const jwtData = verifyJwt(authToken);
        if (!jwtData) {
            return {
                isValid: false,
                error: 'Invalid or expired token',
                errorCode: 'INVALID_TOKEN'
            };
        }

        if (options.skipUserValidation) {
            return {
                isValid: true,
                jwtData,
                deviceId: deviceId || undefined
            };
        }
        // Get user from database
        const user = await prisma.user.findFirst({
            where: {
                id: jwtData.id,
                enabled: true,
                deleted_at: null,
            },
            include: {
                organization: true
            }
        });

        if (!user) {
            return {
                isValid: false,
                error: 'User not found or disabled',
                errorCode: 'USER_NOT_FOUND'
            };
        }
        

        // Validate device ID in JWT (did) - unless device validation is skipped
        if (!options.skipDeviceValidation && deviceId) {
            const expectedDeviceId = createActiveDeviceId(deviceId, user.extra_private_salt);
            const hashedActiveDeviceId = deviceType === 'web' ? user.active_device_id_web : user.active_device_id_mobile;
            const expectedDidFromJwt = createDidForJwt(hashedActiveDeviceId ?? '', jwtData.xsx);

            if (expectedDeviceId !== hashedActiveDeviceId || expectedDidFromJwt !== jwtData.did) {
                return {
                    isValid: false,
                    error: 'Device ID mismatch',
                    errorCode: 'DEVICE_ID_MISMATCH'
                };
            }

            // Check if device is registered as active device
            const isValidMobileDevice = user.active_device_id_mobile && 
                verifyActiveDeviceId(deviceId, user.extra_private_salt, user.active_device_id_mobile);
            const isValidWebDevice = user.active_device_id_web && 
                verifyActiveDeviceId(deviceId, user.extra_private_salt, user.active_device_id_web);

            if (!isValidMobileDevice && !isValidWebDevice) {
                return {
                    isValid: false,
                    error: 'Device not registered',
                    errorCode: 'DEVICE_NOT_REGISTERED'
                };
            }
        }

        // Validate role
        if (!jwtData.role || jwtData.role !== user.role) {
            return {
                isValid: false,
                error: 'Role mismatch',
                errorCode: 'ROLE_MISMATCH'
            };
        }

        // Check allowed roles
        if (options.allowedRoles && !options.allowedRoles.includes(user.role)) {
            return {
                isValid: false,
                error: 'Insufficient permissions',
                errorCode: 'INSUFFICIENT_PERMISSIONS'
            };
        }

        // Validate authentication status (xsx)
        if (options.requirePinCleared && jwtData.xsx !== 2) {
            return {
                isValid: false,
                error: 'PIN verification required',
                errorCode: 'PIN_REQUIRED'
            };
        }

        if (options.requireOtpCleared && jwtData.xsx < 1) {
            return {
                isValid: false,
                error: 'OTP verification required',
                errorCode: 'OTP_REQUIRED'
            };
        }

        // All validations passed
        return {
            isValid: true,
            user: {
                id: user.id,
                role: user.role,
                phoneNumber: user.phone_number,
                fullName: user.full_name,
                organizationId: user.organization_id || undefined,
                extraPrivateSalt: user.extra_private_salt
            },
            jwtData,
            deviceId: deviceId || undefined
        };

    } catch (error) {
        console.error('API Guard validation error:', error);
        return {
            isValid: false,
            error: 'Internal server error during validation',
            errorCode: 'INTERNAL_ERROR'
        };
    }
}

// Convenience functions for common guard scenarios
export async function validateBasicAuth(request: NextRequest): Promise<ApiGuardResult> {
    return validateApiGuard(request, {});
}

export async function validateOtpClearedAuth(request: NextRequest): Promise<ApiGuardResult> {
    return validateApiGuard(request, {
        requireOtpCleared: true
    });
}

export async function validatePinClearedAuth(request: NextRequest): Promise<ApiGuardResult> {
    return validateApiGuard(request, {
        requirePinCleared: true
    });
}

export async function validateOwnerAuth(request: NextRequest): Promise<ApiGuardResult> {
    return validateApiGuard(request, {
        requirePinCleared: true,
        allowedRoles: ['OWNER'],
    });
}

// Helper function to create standardized error responses
export function createGuardErrorResponse(guardResult: ApiGuardResult, statusCode: number = 401) {
    return new Response(
        JSON.stringify({
            success: false,
            message: guardResult.error,
            errorCode: guardResult.errorCode
        }),
        {
            status: statusCode,
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
}

// Middleware wrapper for API routes
export function withApiGuard(
    handler: (request: NextRequest, guardResult: ApiGuardResult) => Promise<Response>,
    options: ApiGuardOptions = {}
) {
    return async (request: NextRequest) => {
        const guardResult = await validateApiGuard(request, options);
        
        if (!guardResult.isValid) {
            return createGuardErrorResponse(guardResult);
        }
        
        return handler(request, guardResult);
    };
}
