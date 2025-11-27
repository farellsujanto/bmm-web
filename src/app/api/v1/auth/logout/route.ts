import { NextRequest, NextResponse } from 'next/server';
import { validateRequiredHeaders } from '../../../../../utils/security/security.util';

export async function POST(request: NextRequest) {
  try {
    // Extract and validate API key
    const apiKey = request.headers.get('api-key');
    const validation = validateRequiredHeaders(apiKey);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 401 }
      );
    }

    // Create response and clear refresh token cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Berhasil logout'
      },
      { status: 200 }
    );

    // Delete the HttpOnly refresh token cookie
    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/'
    });

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
