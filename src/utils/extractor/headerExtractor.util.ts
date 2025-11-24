import { NextRequest } from 'next/server';

export function extractDataFromHeaders(request: NextRequest) {
    const apiKey = request.headers.get('Api-Key') || request.headers.get('X-Api-Key');
    const deviceId = request.headers.get('X-Device-Id');
    const appVersion = request.headers.get('App-Version');
    const authToken = request.headers.get('Authorization')?.split(' ')[1] ?? '';
    const deviceType = request.headers.get('Access-Device-Type') as 'mobile' | 'web' | null;
    
    return {
        apiKey,
        deviceId,
        appVersion,
        authToken,
        deviceType,
    };
}


// 202e1100ed8fbaa140188fd7e4d75ae92ad362f94750d141eebde02a3353e979