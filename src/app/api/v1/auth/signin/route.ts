import { NextRequest, NextResponse } from 'next/server';
import { validateRequiredHeaders, isOtpExpired, createAccessToken, createRefreshToken } from '@/src/utils/security/security.util';
import prisma from '@/src/utils/database/prismaOrm.util';
import { formatPhoneNumber } from '@/src/utils/formatter/stringFormatter.util';
import { generateReferralCode } from '@/src/utils/referral/referralUtil';
import { updateReferrerMissions } from '@/src/utils/mission/missionUpdate.util';

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
    const { phoneNumber, otp, referralCode } = body;

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
    console.log('Verifying OTP for phone number:', validatedPhoneNumber);
    const phoneOtpRecord = await prisma.phoneOtp.findUnique({
      where: { phoneNumber: validatedPhoneNumber }
    });

    if (!phoneOtpRecord) {
      return NextResponse.json(
        { success: false, message: 'Kode OTP tidak ditemukan. Silakan minta kode baru.' },
        { status: 404 }
      );
    }

    // Check if blocked
    if (phoneOtpRecord.blockedUntil && phoneOtpRecord.blockedUntil > new Date()) {
      const remainingHours = Math.ceil((phoneOtpRecord.blockedUntil.getTime() - new Date().getTime()) / (1000 * 60 * 60));
      return NextResponse.json(
        { 
          success: false, 
          message: `Terlalu banyak percobaan gagal. Silakan coba lagi dalam ${remainingHours} jam` 
        },
        { status: 429 }
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
      // Increment wrong attempts
      const newWrongAttempts = phoneOtpRecord.wrongAttempts + 1;
      const remainingAttempts = 3 - newWrongAttempts;
      
      // Block for 24 hours after 3 wrong attempts
      if (newWrongAttempts >= 3) {
        const blockedUntil = new Date();
        blockedUntil.setHours(blockedUntil.getHours() + 24);
        
        await prisma.phoneOtp.update({
          where: { phoneNumber: validatedPhoneNumber },
          data: {
            wrongAttempts: newWrongAttempts,
            blockedUntil: blockedUntil
          }
        });
        
        return NextResponse.json(
          { 
            success: false, 
            message: 'Terlalu banyak percobaan gagal. Akun Anda diblokir selama 24 jam.'
          },
          { status: 429 }
        );
      }
      
      // Update wrong attempts
      await prisma.phoneOtp.update({
        where: { phoneNumber: validatedPhoneNumber },
        data: {
          wrongAttempts: newWrongAttempts
        }
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Kode OTP tidak valid.` 
        },
        { status: 400 }
      );
    }

    // OTP is valid - find or create user
    let user = await prisma.user.findFirst({
      where: { phoneNumber: validatedPhoneNumber }
    });

    let isNewUser = false;
    if (!user) {
      // Generate unique referral code
      let newReferralCode = generateReferralCode();
      let isUnique = false;
      
      // Ensure referral code is unique
      while (!isUnique) {
        const existing = await prisma.user.findFirst({
          where: { referralCode: newReferralCode }
        });
        if (!existing) {
          isUnique = true;
        } else {
          newReferralCode = generateReferralCode();
        }
      }

      // Find referrer if referral code provided
      let referrerId: number | undefined = undefined;
      if (referralCode) {
        const referrer = await prisma.user.findFirst({
          where: { referralCode: referralCode }
        });
        if (referrer) {
          referrerId = referrer.id;
          console.log('Referrer found:', referrer.id);
        } else {
          console.log('Referral code provided but no matching user found:', referralCode);
        }
      }

      // Create new user with referral code and default values
      user = await prisma.user.create({
        data: {
          phoneNumber: validatedPhoneNumber,
          role: 'CUSTOMER',
          referralCode: newReferralCode,
          referrerId: referrerId,
          // Default values
          maxReferralPercentage: 3,
          globalDiscountPercentage: 0,
          statistics: {
            create: {
              totalOrders: 0,
              totalSpent: 0,
              totalReferrals: 0,
              totalReferralOrders: 0,
              totalReferralEarnings: 0
            }
          }
        }
      });
      
      isNewUser = true;

      // Update referrer's statistics and missions if applicable
      if (referrerId) {
        await prisma.$transaction(async (tx) => {
          // Update referrer's statistics
          await tx.userStatistics.update({
            where: { userId: referrerId },
            data: {
              totalReferrals: {
                increment: 1
              }
            }
          });
          
          // Update referrer's REFERRAL_COUNT missions (pass 0 for commission since this is just a signup)
          await updateReferrerMissions(tx, referrerId, 0);
        });
        console.log('Updated referrer statistics and missions for user:', referrerId);
      }
    }

    // Delete used OTP
    console.log('Deleting used OTP for phone number:', validatedPhoneNumber);
    await prisma.phoneOtp.delete({
      where: { phoneNumber: validatedPhoneNumber }
    });
    console.log('Deleted used OTP for phone number:', validatedPhoneNumber);

    // Generate access token (15 minutes) and refresh token (7 days)
    const accessToken = createAccessToken({
      id: user.id,
      role: user.role
    });
    console.log('Access token created for user:', user.id);
    
    const refreshToken = createRefreshToken({
      id: user.id,
      role: user.role
    });
    console.log('Refresh token created for user:', user.id);

    // Create response with access token
    const response = NextResponse.json(
      {
        success: true,
        message: isNewUser ? 'Akun baru berhasil dibuat' : 'Berhasil masuk',
        data: {
          accessToken,
          user: {
            id: user.id,
            name: user.name,
            phoneNumber: user.phoneNumber,
            role: user.role,
            referralCode: user.referralCode,
            maxReferralPercentage: user.maxReferralPercentage.toNumber(),
            globalDiscountPercentage: user.globalDiscountPercentage.toNumber(),
            isNewUser: isNewUser
          }
        }
      },
      { status: 200 }
    );
    console.log('Response created for user:', user.id);

    // Set refresh token as HttpOnly cookie
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: '/'
    });
    console.log('Refresh token set as HttpOnly cookie for user:', user.id);

    return response;
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
