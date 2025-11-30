import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';

/**
 * Example protected route - Get user profile
 * This route requires authentication
 */
async function getProfileHandler(request: NextRequest, user: JwtData) {
  try {
    // User is already authenticated by the middleware
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        governmentId: true,
        address: true,
        role: true,
        referralCode: true,
        maxReferralPercentage: true,
        globalDiscountPercentage: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
            taxId: true,
            address: true,
            phoneNumber: true
          }
        },
        statistics: {
          select: {
            totalOrders: true,
            totalSpent: true,
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

    return NextResponse.json(
      {
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          ...userData,
          maxReferralPercentage: userData.maxReferralPercentage.toString(),
          globalDiscountPercentage: userData.globalDiscountPercentage.toString(),
          statistics: userData.statistics ? {
            ...userData.statistics,
            totalSpent: userData.statistics.totalSpent.toString(),
            totalReferralEarnings: userData.statistics.totalReferralEarnings.toString()
          } : null
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Wrap the handler with requireAuth middleware
// This will automatically validate the JWT token and extract user data
export const GET = requireAuth(getProfileHandler);

/**
 * Example protected route with role check - Update user profile
 * This route requires authentication and checks for specific roles
 */
async function updateProfileHandler(request: NextRequest, user: JwtData) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name: name.trim() },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        role: true,
        updatedAt: true
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Wrap with requireAuth - only CUSTOMER and ADMIN roles can update their profile
export const PUT = requireAuth(updateProfileHandler, ['CUSTOMER', 'ADMIN']);
