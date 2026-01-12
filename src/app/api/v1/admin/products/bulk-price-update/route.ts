import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';

async function bulkPriceUpdateHandler(request: NextRequest, user: JwtData) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { percentage } = body;

    if (!percentage || isNaN(percentage)) {
      return NextResponse.json(
        { success: false, message: 'Invalid percentage value' },
        { status: 400 }
      );
    }

    const percentageValue = parseFloat(percentage);
    
    if (percentageValue < -100 || percentageValue > 1000) {
      return NextResponse.json(
        { success: false, message: 'Percentage must be between -100 and 1000' },
        { status: 400 }
      );
    }

    // Get all products with prices
    const products = await prisma.product.findMany({
      where: { 
        enabled: true,
        price: { not: null }
      },
      select: {
        id: true,
        price: true,
        name: true
      }
    });

    if (products.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No products with prices found' },
        { status: 404 }
      );
    }

    // Calculate new prices and update in a transaction
    const updatePromises = products
      .filter(product => product.price !== null)
      .map(product => {
        const currentPrice = product.price!;
        const increase = currentPrice * (percentageValue / 100);
        const newPrice = Math.round(currentPrice + increase); // Round to nearest integer

        return prisma.product.update({
          where: { id: product.id },
          data: { price: newPrice }
        });
      });

    await prisma.$transaction(updatePromises);

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${products.length} product prices by ${percentageValue}%`,
      updatedCount: products.length
    });
  } catch (error: any) {
    console.error('Bulk price update error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update product prices' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(bulkPriceUpdateHandler);
