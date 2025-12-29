import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';

// GET - List all contact messages
async function getContactMessagesHandler(request: NextRequest, user: JwtData) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const contactMessages = await prisma.contactMessage.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      { success: true, data: contactMessages },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Failed to fetch contact messages:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch contact messages', error: error.message },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getContactMessagesHandler);
