import { NextRequest } from 'next/server';

export function extractDataFromHeaders(request: NextRequest) {
    const apiKey = request.headers.get('Api-Key') || request.headers.get('X-Api-Key');
    const appVersion = request.headers.get('App-Version');
    const authToken = request.headers.get('Authorization')?.split(' ')[1] ?? '';
    const deviceType = request.headers.get('Access-Device-Type') as 'mobile' | 'web' | null;
    
    return {
        apiKey,
        appVersion,
        authToken,
        deviceType,
    };
}
