import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';

/**
 * Get user affiliate/referral data
 */
async function getAffiliateHandler(request: NextRequest, user: JwtData) {
  try {
    // Get user data with referral info
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        referralCode: true,
        maxReferralPercentage: true,
        statistics: {
          select: {
            totalReferrals: true,
            totalReferralEarnings: true
          }
        }
      }
    });

    if (!userData) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // TODO: Get referred users and their orders when Order model is implemented
    // For now, just return the basic stats
    const referralLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://bmmparts.co.id.com'}/ref/${userData.referralCode}`;

    return NextResponse.json(
      {
        success: true,
        message: 'Affiliate data retrieved successfully',
        data: {
          referralCode: userData.referralCode,
          referralLink: referralLink,
          commissionRate: userData.maxReferralPercentage.toString(),
          totalReferrals: userData.statistics?.totalReferrals || 0,
          totalEarnings: userData.statistics?.totalReferralEarnings.toString() || '0',
          affiliatedOrders: [] // TODO: Implement when Order model exists
        }
      },
      { status: 200 }
    );

    /* TODO: When Order model is implemented, fetch affiliated orders
    const referredUsers = await prisma.user.findMany({
      where: { referredBy: user.referralCode }
    });

    const referredUserIds = referredUsers.map(u => u.id);

    const affiliatedOrders = await prisma.order.findMany({
      where: {
        userId: { in: referredUserIds },
        enabled: true
      },
      include: {
        user: {
          select: {
            name: true,
            phoneNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    */
  } catch (error: any) {
    console.error('Get affiliate data error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve affiliate data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getAffiliateHandler);
