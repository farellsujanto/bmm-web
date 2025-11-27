import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt, createAccessToken } from '../../../../../utils/security/security.util';
import { validateRequiredHeaders } from '../../../../../utils/security/security.util';
import prisma from '../../../../../utils/database/prismaOrm.util';

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

    // Get refresh token from HttpOnly cookie
    const refreshToken = request.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Refresh token tidak ditemukan' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const userData = verifyJwt(refreshToken);

    if (!userData) {
      // Token invalid or expired - clear the cookie
      const response = NextResponse.json(
        { success: false, message: 'Refresh token tidak valid atau telah kedaluwarsa' },
        { status: 401 }
      );
      
      response.cookies.delete('refresh_token');
      
      return response;
    }

    // Generate new access token
    const accessToken = createAccessToken({
      id: userData.id,
      role: userData.role
    });

    // Fetch full user data from database
    const user = await prisma.user.findUnique({
      where: { id: userData.id },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        role: true,
        referralCode: true,
        maxReferralPercentage: true,
        globalDiscountPercentage: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Access token berhasil diperbaharui',
        data: {
          accessToken,
          user: {
            ...user,
            maxReferralPercentage: user.maxReferralPercentage.toString(),
            globalDiscountPercentage: user.globalDiscountPercentage.toString(),
          }
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Refresh token error:', error);
    
    const response = NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
    
    // Clear cookie on error
    response.cookies.delete('refresh_token');
    
    return response;
  }
}
