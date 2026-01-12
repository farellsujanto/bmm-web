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

    // Update products individually and track failures
    const failures: { id: number; name: string; error: string }[] = [];
    let successCount = 0;

    for (const product of products) {
      if (product.price === null) continue;

      try {
        const currentPrice = product.price;
        const increase = currentPrice * (percentageValue / 100);
        const newPrice = Math.round(currentPrice + increase); // Round to nearest integer

        await prisma.product.update({
          where: { id: product.id },
          data: { price: newPrice }
        });

        successCount++;
      } catch (error: any) {
        failures.push({
          id: product.id,
          name: product.name,
          error: error.message || 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${successCount} of ${products.length} products by ${percentageValue}%`,
      updatedCount: successCount,
      totalProducts: products.length,
      failures: failures.length > 0 ? failures : undefined
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
