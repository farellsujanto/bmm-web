import { NextRequest, NextResponse } from 'next/server';
import { validateRequiredHeaders, isOtpExpired, createFullJwt } from '@/src/utils/security/security.util';
import prisma from '@/src/utils/database/prismaOrm.util';
import { formatPhoneNumber } from '@/src/utils/formatter/stringFormatter.util';

export async function POST(request: NextRequest) {
  try {
    // Extract headers
    const apiKey = request.headers.get('api-key');
    const deviceId = request.headers.get('x-device-id');

    // Validate required headers
    const validation = validateRequiredHeaders(apiKey, deviceId);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { phoneNumber, otp } = body;

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { success: false, message: 'Nomor telepon dan OTP wajib diisi' },
        { status: 400 }
      );
    }

    // Validate and format phone number using utility
    let validatedPhoneNumber: string;
    try {
      validatedPhoneNumber = formatPhoneNumber(phoneNumber);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: error instanceof Error ? error.message : 'Nomor telepon tidak valid' },
        { status: 400 }
      );
    }

    // Retrieve OTP from database
    const phoneOtpRecord = await prisma.phoneOtp.findUnique({
      where: { phoneNumber: validatedPhoneNumber }
    });

    if (!phoneOtpRecord) {
      return NextResponse.json(
        { success: false, message: 'Kode OTP tidak ditemukan. Silakan minta kode baru.' },
        { status: 404 }
      );
    }

    // Check if OTP has expired
    if (isOtpExpired(phoneOtpRecord.expiresAt)) {
      return NextResponse.json(
        { success: false, message: 'Kode OTP telah kedaluwarsa. Silakan minta kode baru.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (phoneOtpRecord.otp !== otp) {
      return NextResponse.json(
        { success: false, message: 'Kode OTP tidak valid' },
        { status: 400 }
      );
    }

    // OTP is valid - find or create user
    let user = await prisma.user.findUnique({
      where: { phoneNumber: validatedPhoneNumber }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          phoneNumber: validatedPhoneNumber,
          role: 'CUSTOMER'
        }
      });
    }

    // Delete used OTP
    await prisma.phoneOtp.delete({
      where: { phoneNumber: validatedPhoneNumber }
    });

    // Generate JWT token
    const token = createFullJwt(
      { id: user.id, role: user.role },
      deviceId!,
      process.env.EXTRA_SALT || '',
      true, // OTP cleared
      false // PIN not used
    );

    return NextResponse.json(
      {
        success: true,
        message: user.name ? 'Berhasil masuk' : 'Akun baru berhasil dibuat',
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            phoneNumber: user.phoneNumber,
            role: user.role,
            isNewUser: !user.name
          }
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Sign in error:', error);
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
