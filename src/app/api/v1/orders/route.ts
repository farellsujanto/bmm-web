import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';
import { Prisma } from '@/generated/prisma/client';

interface CreateOrderRequest {
  customer: {
    name: string;
    governmentId?: string;
    address: string;
  };
  company?: {
    name: string;
    taxId: string;
    address?: string;
    phoneNumber?: string;
  } | null;
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    discount?: number;
    affiliatePercent?: number;
    isPreOrder?: boolean;
  }>;
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  finalPrice: number;
}

/**
 * Create a new order
 */
async function createOrderHandler(request: NextRequest, user: JwtData) {
  try {
    const body: CreateOrderRequest = await request.json();
    const { customer, company, items, subtotal, discountPercentage, discountAmount, finalPrice } = body;

    // Validate required fields
    if (!customer?.name?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Customer name is required' },
        { status: 400 }
      );
    }

    if (!customer?.address?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Customer address is required' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    // Verify all products exist and are active
    const productIds = items.map(item => item.id);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        enabled: true,
        isActive: true
      }
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { success: false, message: 'Some products are not available' },
        { status: 400 }
      );
    }

    // Calculate affiliate commission
    let referralCommission = new Prisma.Decimal(0);
    let referrerId: number | undefined = undefined;

    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { referrerId: true, referrer: true, phoneNumber: true, globalDiscountPercentage: true }
    });

    if (currentUser?.referrerId && currentUser.referrer) {
      referrerId = currentUser.referrerId;
      const maxReferralPercent = currentUser.referrer.maxReferralPercentage.toNumber();
      
      // Calculate commission based on affiliate percentage or max referral percentage
      items.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
          const itemTotal = item.price * item.quantity;
          const affiliatePercent = product.affiliatePercent 
            ? Math.min(product.affiliatePercent.toNumber(), maxReferralPercent)
            : maxReferralPercent;
          const commission = (itemTotal * affiliatePercent) / 100;
          referralCommission = referralCommission.add(commission);
        }
      });
    }

    // Create company if provided
    let companyId: number | undefined = undefined;
    if (company?.name && company?.taxId) {
      const newCompany = await prisma.company.create({
        data: {
          name: company.name,
          taxId: company.taxId,
          address: company.address,
          phoneNumber: company.phoneNumber,
        }
      });
      companyId = newCompany.id;
    }

    // Update user info if changed
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: customer.name,
        governmentId: customer.governmentId,
        address: customer.address,
        companyId: companyId
      }
    });

    // Get user's phone number for order number generation
    const userPhone = currentUser?.phoneNumber || '';
    const last4Digits = userPhone.slice(-4);
    
    // Generate unique order number: last4digits-yyyy-mm-dd-random6chars
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // yyyy-mm-dd
    const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderNumber = `${last4Digits}-${dateStr}-${randomChars}`;
    
    // Get user's global discount percentage
    const userGlobalDiscount = currentUser?.globalDiscountPercentage?.toNumber() || 0;
    
    // Create the order with products
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        referrerId: referrerId,
        status: 'PENDING_PAYMENT',
        subtotal: new Prisma.Decimal(subtotal),
        discount: new Prisma.Decimal(discountAmount),
        discountPercentage: new Prisma.Decimal(userGlobalDiscount),
        affiliateCommission: referralCommission,
        total: new Prisma.Decimal(finalPrice),
        amountPaid: new Prisma.Decimal(0),
        remainingBalance: new Prisma.Decimal(finalPrice),
        orderProducts: {
          create: items.map(item => {
            const product = products.find(p => p.id === item.id)!;
            const affiliatePercent = product.affiliatePercent 
              ? Math.min(product.affiliatePercent.toNumber(), currentUser?.referrer?.maxReferralPercentage.toNumber() || 0)
              : (currentUser?.referrer?.maxReferralPercentage.toNumber() || 0);
            
            const itemSubtotal = item.price * item.quantity;
            
            return {
              productId: item.id,
              name: item.name,
              sku: product.sku,
              price: item.price,
              discount: item.discount ? new Prisma.Decimal(item.discount) : new Prisma.Decimal(0),
              affiliatePercent: new Prisma.Decimal(affiliatePercent),
              downpaymentPercentage: product.downpaymentPercentage,
              quantity: item.quantity,
              subtotal: new Prisma.Decimal(itemSubtotal),
            };
          })
        }
      },
      include: {
        orderProducts: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { sortOrder: 'asc' },
                  take: 1
                }
              }
            }
          }
        },
        user: {
          select: {
            name: true,
            phoneNumber: true,
            address: true,
          }
        }
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        data: order
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create order',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(createOrderHandler);
