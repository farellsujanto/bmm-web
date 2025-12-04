import { MissionType, RewardType } from '@/generated/prisma/browser';

/**
 * Update missions progress for a user after an order is fully paid
 * @param tx - Prisma transaction client
 * @param userId - User ID
 * @param orderTotal - Total order amount
 */
export async function updateUserMissions(
  tx: any,
  userId: number,
  orderTotal: number
) {
  // Get user's current statistics
  const userStats = await tx.userStatistics.findUnique({
    where: { userId }
  });

  if (!userStats) {
    console.error(`User statistics not found for user ${userId}`);
    return;
  }

  // Get all active missions
  const missions = await tx.mission.findMany({
    where: {
      isActive: true,
      enabled: true
    },
    orderBy: {
      sortOrder: 'asc'
    }
  });

  // Process each mission in parallel
  await Promise.all(missions.map(async (mission: any) => {
    // Get or create user mission progress
    let userMission = await tx.userMission.findUnique({
      where: {
        userId_missionId: {
          userId,
          missionId: mission.id
        }
      }
    });

    if (!userMission) {
      userMission = await tx.userMission.create({
        data: {
          userId,
          missionId: mission.id,
          currentProgress: 0,
          achieved: false
        }
      });
    }

    // Skip if already achieved
    if (userMission.achieved) {
      return;
    }

    // Calculate progress increment or absolute value based on mission type
    let incrementValue = 0;
    let absoluteValue: number | null = null;

    switch (mission.type) {
      case MissionType.ORDER_COUNT:
        // Increment by 1 for each order
        incrementValue = 1;
        break;

      case MissionType.ORDER_VALUE:
        // Increment by order total
        incrementValue = orderTotal;
        break;

      case MissionType.REFERRAL_COUNT:
        // This is updated separately when referred users place orders
        // Use current total referrals (absolute value)
        absoluteValue = userStats.totalReferrals;
        break;

      case MissionType.REFERRAL_EARNINGS:
        // This is updated separately when commission is earned
        // Use current total earnings (absolute value)
        absoluteValue = Number(userStats.totalReferralEarnings);
        break;
    }

    // Calculate new progress
    const newProgress = absoluteValue !== null 
      ? absoluteValue 
      : Number(userMission.currentProgress) + incrementValue;

    // Check if mission is achieved
    const targetValue = Number(mission.targetValue);
    const achieved = newProgress >= targetValue;

    // Update user mission using increment where applicable
    if (absoluteValue !== null) {
      // Use absolute value for referral-based missions
      await tx.userMission.update({
        where: {
          userId_missionId: {
            userId,
            missionId: mission.id
          }
        },
        data: {
          currentProgress: newProgress,
          achieved,
          achievedAt: achieved && !userMission.achieved ? new Date() : userMission.achievedAt,
          updatedAt: new Date()
        }
      });
    } else {
      // Use increment for order-based missions
      await tx.userMission.update({
        where: {
          userId_missionId: {
            userId,
            missionId: mission.id
          }
        },
        data: {
          currentProgress: { increment: incrementValue },
          achieved,
          achievedAt: achieved && !userMission.achieved ? new Date() : userMission.achievedAt,
          updatedAt: new Date()
        }
      });
    }

    // If mission just achieved, apply rewards
    if (achieved && !userMission.achieved) {
      await applyMissionReward(tx, userId, mission);
    }
  }));
}

/**
 * Apply mission reward to user
 * @param tx - Prisma transaction client
 * @param userId - User ID
 * @param mission - Mission that was achieved
 */
async function applyMissionReward(
  tx: any,
  userId: number,
  mission: any
) {
  const user = await tx.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    console.error(`User not found: ${userId}`);
    return;
  }

  const rewardValue = Number(mission.rewardValue);

  // Apply reward based on reward type
  switch (mission.rewardType) {
    case RewardType.REFERRAL_PERCENTAGE:
      // Increase referral percentage
      const newReferralPercentage = Number(user.maxReferralPercentage) + rewardValue;
      await tx.user.update({
        where: { id: userId },
        data: {
          maxReferralPercentage: newReferralPercentage,
          updatedAt: new Date()
        }
      });
      console.log(`User ${userId} referral percentage increased to ${newReferralPercentage}%`);
      break;

    case RewardType.GLOBAL_DISCOUNT:
      // Increase global discount percentage
      const newDiscountPercentage = Number(user.globalDiscountPercentage) + rewardValue;
      await tx.user.update({
        where: { id: userId },
        data: {
          globalDiscountPercentage: newDiscountPercentage,
          updatedAt: new Date()
        }
      });
      console.log(`User ${userId} global discount increased to ${newDiscountPercentage}%`);
      break;

    case RewardType.BOTH:
      // Increase both referral and discount percentages
      const newReferralPct = Number(user.maxReferralPercentage) + rewardValue;
      const newDiscountPct = Number(user.globalDiscountPercentage) + rewardValue;
      await tx.user.update({
        where: { id: userId },
        data: {
          maxReferralPercentage: newReferralPct,
          globalDiscountPercentage: newDiscountPct,
          updatedAt: new Date()
        }
      });
      console.log(`User ${userId} referral and discount both increased by ${rewardValue}%`);
      break;
  }
}

/**
 * Update referrer's missions when a referred user places an order
 * @param tx - Prisma transaction client
 * @param referrerId - Referrer user ID
 * @param commissionEarned - Commission amount earned from this order
 */
export async function updateReferrerMissions(
  tx: any,
  referrerId: number,
  commissionEarned: number
) {
  // Get referrer's statistics
  const referrerStats = await tx.userStatistics.findUnique({
    where: { userId: referrerId }
  });

  if (!referrerStats) {
    console.error(`Referrer statistics not found for user ${referrerId}`);
    return;
  }

  // Get all active missions
  const missions = await tx.mission.findMany({
    where: {
      isActive: true,
      enabled: true,
      type: {
        in: [MissionType.REFERRAL_COUNT, MissionType.REFERRAL_EARNINGS]
      }
    }
  });

  // Process referral-related missions in parallel
  await Promise.all(missions.map(async (mission: any) => {
    let userMission = await tx.userMission.findUnique({
      where: {
        userId_missionId: {
          userId: referrerId,
          missionId: mission.id
        }
      }
    });

    if (!userMission) {
      userMission = await tx.userMission.create({
        data: {
          userId: referrerId,
          missionId: mission.id,
          currentProgress: 0,
          achieved: false
        }
      });
    }

    // Skip if already achieved
    if (userMission.achieved) {
      return;
    }

    // Calculate new progress based on mission type
    let newProgress = Number(userMission.currentProgress);
    
    if (mission.type === MissionType.REFERRAL_COUNT) {
      // REFERRAL_COUNT tracks unique referred users (totalReferrals)
      // This is updated when new users sign up, not when they place orders
      newProgress = referrerStats.totalReferrals;
    } else if (mission.type === MissionType.REFERRAL_EARNINGS) {
      // REFERRAL_EARNINGS tracks total commission earned
      newProgress = Number(referrerStats.totalReferralEarnings) + commissionEarned;
    }

    // Check if mission is achieved
    const targetValue = Number(mission.targetValue);
    const achieved = newProgress >= targetValue;

    // Update user mission
    await tx.userMission.update({
      where: {
        userId_missionId: {
          userId: referrerId,
          missionId: mission.id
        }
      },
      data: {
        currentProgress: newProgress,
        achieved,
        achievedAt: achieved && !userMission.achieved ? new Date() : userMission.achievedAt,
        updatedAt: new Date()
      }
    });

    // If mission just achieved, apply rewards
    if (achieved && !userMission.achieved) {
      await applyMissionReward(tx, referrerId, mission);
    }
  }));
}

/**
 * Update user statistics after order is fully paid
 * @param tx - Prisma transaction client
 * @param userId - User ID
 * @param orderTotal - Total order amount
 */
export async function updateUserStatistics(
  tx: any,
  userId: number,
  orderTotal: number
) {
  // Get or create user statistics
  let userStats = await tx.userStatistics.findUnique({
    where: { userId }
  });

  if (!userStats) {
    userStats = await tx.userStatistics.create({
      data: {
        userId,
        totalOrders: 1,
        totalSpent: orderTotal,
        totalReferrals: 0,
        totalReferralOrders: 0,
        totalReferralEarnings: 0,
        availableBalance: 0,
        totalWithdrawn: 0
      }
    });
  }

  // Update statistics
  await tx.userStatistics.update({
    where: { userId },
    data: {
      totalOrders: userStats.totalOrders + 1,
      totalSpent: Number(userStats.totalSpent) + orderTotal,
      updatedAt: new Date()
    }
  });
}

/**
 * Update referrer statistics and pay commission
 * @param tx - Prisma transaction client
 * @param referrerId - Referrer user ID
 * @param commissionAmount - Commission amount to pay
 */
export async function updateReferrerStatistics(
  tx: any,
  referrerId: number,
  commissionAmount: number
) {
  // Validate commission amount
  const validCommissionAmount = Number(commissionAmount) || 0;
  
  if (validCommissionAmount <= 0) {
    console.warn(`Invalid commission amount for referrer ${referrerId}: ${commissionAmount}`);
    return;
  }

  // Get or create referrer statistics
  let referrerStats = await tx.userStatistics.findUnique({
    where: { userId: referrerId }
  });

  if (!referrerStats) {
    referrerStats = await tx.userStatistics.create({
      data: {
        userId: referrerId,
        totalOrders: 0,
        totalSpent: 0,
        totalReferrals: 0,
        totalReferralOrders: 0,
        totalReferralEarnings: 0,
        availableBalance: 0,
        totalWithdrawn: 0
      }
    });
  }

  // Safely parse existing values
  const currentEarnings = Number(referrerStats.totalReferralEarnings) || 0;
  const currentBalance = Number(referrerStats.availableBalance) || 0;

  // Calculate new values
  const newEarnings = currentEarnings + validCommissionAmount;
  const newBalance = currentBalance + validCommissionAmount;

  console.log(`Updating referrer ${referrerId} statistics:`, {
    commissionAmount: validCommissionAmount,
    currentEarnings,
    newEarnings,
    currentBalance,
    newBalance
  });

  // Update referrer's statistics and credit their balance
  // Also increment totalReferralOrders (count of completed orders from referred users)
  await tx.userStatistics.update({
    where: { userId: referrerId },
    data: {
      totalReferralEarnings: newEarnings,
      availableBalance: newBalance,
      totalReferralOrders: { increment: 1 },
      updatedAt: new Date()
    }
  });
}
