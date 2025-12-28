import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';

interface RequestProduct {
  name: string;
  description?: string;
  quantity: number;
}

async function createProductRequestHandler(request: NextRequest, user: JwtData) {
  try {
    const body = await request.json();
    const { products } = body as { products: RequestProduct[] };

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Products array is required' },
        { status: 400 }
      );
    }

    // Validate that at least one product has a name
    const validProducts = products.filter(p => p.name && p.name.trim() !== '');
    if (validProducts.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one product name is required' },
        { status: 400 }
      );
    }

    // Create product request in database
    const productRequest = await prisma.productRequest.create({
      data: {
        userId: user.id,
        products: {
          create: validProducts.map(p => ({
            name: p.name.trim(),
            description: p.description?.trim() || null,
            quantity: p.quantity || 1,
          })),
        },
      },
      include: {
        products: true,
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Product request submitted successfully',
        data: productRequest
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Failed to process product request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit product request', error: error.message },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(createProductRequestHandler);
