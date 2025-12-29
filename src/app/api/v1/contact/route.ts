import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/utils/database/prismaOrm.util';
import { verifyJwt } from '@/src/utils/security/security.util';

// POST - Submit contact message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user is authenticated (optional)
    const authHeader = request.headers.get('authorization');
    let userId: number | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const jwtData = verifyJwt(token);
        userId = jwtData?.id;
      } catch {
        // Not authenticated, continue as guest
      }
    }

    // Create contact message
    const contactMessage = await prisma.contactMessage.create({
      data: {
        userId,
        name,
        email,
        phone: phone || null,
        subject,
        message,
        status: 'NEW',
      },
    });

    return NextResponse.json(
      { success: true, data: contactMessage, message: 'Contact message submitted successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Failed to submit contact message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit contact message', error: error.message },
      { status: 500 }
    );
  }
}
