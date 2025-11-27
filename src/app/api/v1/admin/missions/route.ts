import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';

async function getMissionsHandler(request: NextRequest, user: JwtData) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const missions = await prisma.mission.findMany({
      where: { enabled: true },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json(
      { success: true, message: 'Missions retrieved', data: missions },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve missions', error: error.message },
      { status: 500 }
    );
  }
}

async function createMissionHandler(request: NextRequest, user: JwtData) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const {
      title,
      description,
      icon,
      type,
      targetValue,
      rewardType,
      rewardValue,
      sortOrder,
      isActive
    } = body;

    if (!title || !description || !icon || !type || !targetValue || !rewardType || !rewardValue) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const mission = await prisma.mission.create({
      data: {
        title,
        description,
        icon,
        type,
        targetValue,
        rewardType,
        rewardValue,
        sortOrder: sortOrder || 0,
        isActive: isActive !== false
      }
    });

    return NextResponse.json(
      { success: true, message: 'Mission created', data: mission },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to create mission', error: error.message },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getMissionsHandler);
export const POST = requireAuth(createMissionHandler);
