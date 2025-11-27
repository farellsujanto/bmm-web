import { NextRequest, NextResponse } from 'next/server';
import { validateRequiredHeaders, generateOtp, createOtpExpiry } from '../../../../../utils/security/security.util';
import { sendWhatsAppOtp } from '../../../../../utils/messaging/whatsapputil';
import prisma from '@/src/utils/database/prismaOrm.util';
import { formatPhoneNumber, maskPhoneNumber } from '@/src/utils/formatter/stringFormatter.util';

export async function POST(request: NextRequest) {
  try {
    // Extract headers
    const apiKey = request.headers.get('api-key');

    // Validate required headers
    const validation = validateRequiredHeaders(apiKey);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'Nomor telepon wajib diisi' },
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

    // Generate OTP
    const otp = generateOtp();
    
    // Set expiry to 60 seconds
    const expiresAt = createOtpExpiry(1); // 1 minute

    // Store or update OTP in database
    await prisma.phoneOtp.upsert({
      where: { phoneNumber: validatedPhoneNumber },
      update: {
        otp,
        expiresAt,
        updatedAt: new Date()
      },
      create: {
        phoneNumber: validatedPhoneNumber,
        otp,
        expiresAt
      }
    });

    // Send OTP via WhatsApp
    try {
      await sendWhatsAppOtp(otp, validatedPhoneNumber);
    } catch (error) {
      console.error('Failed to send WhatsApp OTP:', error);
      // Continue anyway - OTP is stored in DB
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Kode OTP telah dikirim ke nomor WhatsApp Anda',
        data: {
          expiresAt: expiresAt.toISOString(),
          maskedPhone: maskPhoneNumber(validatedPhoneNumber)
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Request OTP error:', error);
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
