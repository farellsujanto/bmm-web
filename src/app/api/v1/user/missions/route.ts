import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';

/**
 * Get user missions with progress
 */
async function getMissionsHandler(request: NextRequest, user: JwtData) {
  try {
    // Fetch all missions
    const missions = await prisma.mission.findMany({
      where: { enabled: true },
      orderBy: { createdAt: 'asc' }
    });

    // Fetch user mission progress
    const userMissions = await prisma.userMission.findMany({
      where: { userId: user.id }
    });

    // Create a map for quick lookup
    const userMissionMap = new Map(
      userMissions.map(um => [um.missionId, um])
    );

    // Transform data for frontend
    const formattedMissions = missions.map(mission => {
      const userMission = userMissionMap.get(mission.id);
      const currentProgress = userMission?.currentProgress || 0;
      const isCompleted = userMission?.achieved || false;
      const targetValue = Number(mission.targetValue);
      const progressPercentage = targetValue > 0 
        ? Math.min((Number(currentProgress) / targetValue) * 100, 100)
        : 0;

      return {
        id: mission.id,
        title: mission.title,
        description: mission.description,
        type: mission.type,
        targetValue: targetValue,
        rewardType: mission.rewardType,
        rewardValue: mission.rewardValue.toString(),
        icon: mission.icon,
        currentProgress: Number(currentProgress),
        progressPercentage: Math.round(progressPercentage),
        isCompleted,
        completedAt: userMission?.achievedAt,
        createdAt: mission.createdAt
      };
    });

    // Sort: incomplete first (oldest first), then completed (newest first)
    formattedMissions.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1; // Incomplete missions first
      }
      if (!a.isCompleted) {
        // For incomplete, oldest mission first (based on creation date)
        return a.createdAt.getTime() - b.createdAt.getTime();
      }
      // For completed, newest completion first
      return (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0);
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Missions retrieved successfully',
        data: formattedMissions
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get missions error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve missions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getMissionsHandler);
