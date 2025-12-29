import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';

// PATCH - Update contact message
async function updateContactMessageHandler(
  request: NextRequest,
  user: JwtData,
  { params }: { params: Promise<{ id: string }> }
) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const contactMessageId = parseInt(id);

    if (isNaN(contactMessageId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid contact message ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, adminNotes } = body;

    const updatedContactMessage = await prisma.contactMessage.update({
      where: { id: contactMessageId },
      data: {
        status,
        adminNotes: adminNotes || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: updatedContactMessage, message: 'Contact message updated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Failed to update contact message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update contact message', error: error.message },
      { status: 500 }
    );
  }
}

export const PATCH = requireAuth(updateContactMessageHandler);
