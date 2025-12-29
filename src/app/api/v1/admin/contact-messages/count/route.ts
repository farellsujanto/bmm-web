import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';

// GET - Get count of contact messages
async function getContactMessagesCountHandler(request: NextRequest, user: JwtData) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const count = await prisma.contactMessage.count();

    return NextResponse.json(
      { success: true, data: count },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Failed to count contact messages:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to count contact messages', error: error.message },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getContactMessagesCountHandler);
