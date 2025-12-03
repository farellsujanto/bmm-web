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

    // Get current user with discount info and company
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { 
        referrerId: true, 
        referrer: true, 
        phoneNumber: true, 
        globalDiscountPercentage: true,
        name: true,
        governmentId: true,
        address: true,
        companyId: true,
        company: true
      }
    });

    const userGlobalDiscountPercent = currentUser?.globalDiscountPercentage?.toNumber() || 0;

    // Recalculate order totals on backend to ensure accuracy
    let calculatedSubtotal = new Prisma.Decimal(0);
    const calculatedItems = items.map(item => {
      const product = products.find(p => p.id === item.id)!;
      
      // Use product price from database (not from frontend)
      const productPrice = product.price ? Number(product.price) : 0;
      const productDiscount = product.discount ? product.discount.toNumber() : 0;
      
      // Calculate price after product discount
      const priceAfterDiscount = productPrice * (1 - productDiscount / 100);
      const itemSubtotal = priceAfterDiscount * item.quantity;
      
      calculatedSubtotal = calculatedSubtotal.add(itemSubtotal);
      
      return {
        productId: item.id,
        name: product.name,
        sku: product.sku,
        price: productPrice,
        discount: productDiscount,
        priceAfterDiscount,
        quantity: item.quantity,
        subtotal: itemSubtotal
      };
    });

    // Calculate global discount on the subtotal
    const calculatedGlobalDiscount = calculatedSubtotal.toNumber() * (userGlobalDiscountPercent / 100);
    const calculatedTotal = calculatedSubtotal.toNumber() - calculatedGlobalDiscount;

    // Calculate affiliate commission
    let referralCommission = new Prisma.Decimal(0);
    let referrerId: number | undefined = undefined;

    if (currentUser?.referrerId && currentUser.referrer) {
      referrerId = currentUser.referrerId;
      const maxReferralPercent = currentUser.referrer.maxReferralPercentage.toNumber();
      
      // Calculate commission based on price after global discount
      calculatedItems.forEach(calcItem => {
        const product = products.find(p => p.id === calcItem.productId)!;
        const affiliatePercent = product.affiliatePercent 
          ? Math.min(product.affiliatePercent.toNumber(), maxReferralPercent)
          : maxReferralPercent;
        
        // Apply global discount to item subtotal before calculating commission
        const itemSubtotalAfterDiscount = calcItem.subtotal * (1 - userGlobalDiscountPercent / 100);
        const commission = (itemSubtotalAfterDiscount * affiliatePercent) / 100;
        referralCommission = referralCommission.add(commission);
      });
    }

    // Handle company - find existing or create new
    let companyId: number | undefined = undefined;
    if (company?.name && company?.taxId) {
      // Check if company with this taxId already exists
      const existingCompany = await prisma.company.findFirst({
        where: { taxId: company.taxId }
      });

      if (existingCompany) {
        companyId = existingCompany.id;
      } else {
        // Create new company if taxId doesn't exist
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
    }

    // Update user info - only update companyId if company info was provided
    const userUpdateData: any = {
      name: customer.name,
      governmentId: customer.governmentId,
      address: customer.address,
    };
    
    if (company?.name && company?.taxId) {
      userUpdateData.companyId = companyId;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: userUpdateData
    });

    // Get user's phone number for order number generation
    const userPhone = currentUser?.phoneNumber || '';
    const last4Digits = userPhone.slice(-4);
    
    // Generate unique order number: last4digits-yyyy-mm-dd-random6chars
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // yyyy-mm-dd
    const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderNumber = `${last4Digits}-${dateStr}-${randomChars}`;
    
    // Create the order with products
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        referrerId: referrerId,
        status: 'PENDING_PAYMENT',
        subtotal: calculatedSubtotal,
        discount: new Prisma.Decimal(calculatedGlobalDiscount),
        discountPercentage: new Prisma.Decimal(userGlobalDiscountPercent),
        affiliateCommission: referralCommission,
        total: new Prisma.Decimal(calculatedTotal),
        amountPaid: new Prisma.Decimal(0),
        remainingBalance: new Prisma.Decimal(calculatedTotal),
        orderProducts: {
          create: calculatedItems.map(calcItem => {
            const product = products.find(p => p.id === calcItem.productId)!;
            const affiliatePercent = product.affiliatePercent 
              ? Math.min(product.affiliatePercent.toNumber(), currentUser?.referrer?.maxReferralPercentage.toNumber() || 0)
              : (currentUser?.referrer?.maxReferralPercentage.toNumber() || 0);
            
            return {
              productId: calcItem.productId,
              name: calcItem.name,
              sku: calcItem.sku,
              price: calcItem.price,
              discount: new Prisma.Decimal(calcItem.discount),
              affiliatePercent: new Prisma.Decimal(affiliatePercent),
              downpaymentPercentage: product.downpaymentPercentage,
              quantity: calcItem.quantity,
              subtotal: new Prisma.Decimal(calcItem.subtotal),
            };
          })
        },
        ...(company?.name && company?.taxId ? {
          companyOrder: {
            create: {
              name: company.name,
              taxId: company.taxId,
              address: company.address,
              phoneNumber: company.phoneNumber,
            }
          }
        } : {})
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
        },
        companyOrder: true
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
