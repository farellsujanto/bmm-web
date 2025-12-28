import { NextRequest, NextResponse } from 'next/server';
import { validateRequiredHeaders, generateOtp, createOtpExpiry } from '../../../../../utils/security/security.util';
import { sendWhatsAppOtp } from '../../../../../utils/messaging/whatsapputil';
import prisma from '@/src/utils/database/prismaOrm.util';
import { formatPhoneNumber, maskPhoneNumber } from '@/src/utils/formatter/stringFormatter.util';
import { generateBrowserFingerprint, checkBrowserLimit, incrementBrowserLimit } from '../../../../../utils/rateLimit/browserRateLimit.util';

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

    // Check browser-based rate limit (4 requests per day)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');
    const browserFingerprint = generateBrowserFingerprint(ip, userAgent);
    
    const browserLimit = checkBrowserLimit(browserFingerprint, 4);
    console.log('Browser limit status:', browserLimit);
    if (!browserLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Batas permintaan harian tercapai. Silakan coba lagi besok',
          remaining: 0,
          resetDate: browserLimit.resetDate
        },
        { status: 429 }
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

    // Check if phone number is blocked
    const existingOtp = await prisma.phoneOtp.findUnique({
      where: { phoneNumber: validatedPhoneNumber }
    });

    if (existingOtp?.blockedUntil) {
      const now = new Date();
      if (existingOtp.blockedUntil > now) {
        const remainingHours = Math.ceil((existingOtp.blockedUntil.getTime() - now.getTime()) / (1000 * 60 * 60));
        return NextResponse.json(
          { 
            success: false, 
            message: `Terlalu banyak percobaan gagal. Silakan coba lagi dalam ${remainingHours} jam`,
            blockedUntil: existingOtp.blockedUntil.toISOString()
          },
          { status: 429 }
        );
      }
    }

    // Check if existing OTP hasn't been used yet and is still valid
    if (existingOtp && existingOtp.otp !== 'XXXXXX') {
      const now = new Date();
      const lastRequestTime = existingOtp.updatedAt;
      const timeSinceLastRequest = (now.getTime() - lastRequestTime.getTime()) / 1000; // in seconds
      
      if (timeSinceLastRequest < 55) {
        const remainingSeconds = Math.ceil(55 - timeSinceLastRequest);
        return NextResponse.json(
          { 
            success: false, 
            message: `Mohon tunggu ${remainingSeconds + 5} detik sebelum mengirim ulang OTP`,
            remainingSeconds
          },
          { status: 429 }
        );
      }
    }

    // Check resend limit (maximum 2 resends = 3 total requests)
    if (existingOtp && existingOtp.resendCount >= 2) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Batas pengiriman ulang OTP telah tercapai. Silakan coba lagi nanti'
        },
        { status: 429 }
      );
    }

    // Generate OTP
    const otp = generateOtp();
    
    // Set expiry to 60 seconds
    const expiresAt = createOtpExpiry(1); // 1 minute

    // Store or update OTP in database
    // Reset resend count if previous OTP was used (XXXXXX), otherwise increment
    const resendCount = existingOtp && existingOtp.otp !== 'XXXXXX' ? existingOtp.resendCount + 1 : 0;
    await prisma.phoneOtp.upsert({
      where: { phoneNumber: validatedPhoneNumber },
      update: {
        otp,
        expiresAt,
        resendCount,
        // Reset wrong attempts and blocked status when new OTP is requested
        wrongAttempts: 0,
        blockedUntil: null,
        updatedAt: new Date()
      },
      create: {
        phoneNumber: validatedPhoneNumber,
        otp,
        expiresAt,
        wrongAttempts: 0,
        resendCount: 0
      }
    });

    // Send OTP via WhatsApp
    try {
      if (process.env.NODE_ENV !== 'development') {
        await sendWhatsAppOtp(otp, validatedPhoneNumber);
      }
    } catch (error) {
      console.error('Failed to send WhatsApp OTP:', error);
      // Continue anyway - OTP is stored in DB
    }

    // Increment browser request count after successful OTP send
    incrementBrowserLimit(browserFingerprint);

    return NextResponse.json(
      {
        success: true,
        message: 'Kode OTP telah dikirim ke nomor WhatsApp Anda',
        data: {
          expiresAt: expiresAt.toISOString(),
          maskedPhone: maskPhoneNumber(validatedPhoneNumber),
          resendCount: resendCount,
          maxResends: 2,
          dailyRequestsRemaining: browserLimit.remaining - 1
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
