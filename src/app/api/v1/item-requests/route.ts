import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/utils/database/prismaOrm.util';

interface RequestProduct {
  name: string;
  description?: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
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

    // For now, just log the request
    // TODO: Store in database or send notification
    console.log('Product request received:', validProducts);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Product request submitted successfully',
        data: { requestedProducts: validProducts }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Failed to process product request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit product request', error: error.message },
      { status: 500 }
    );
  }
}
