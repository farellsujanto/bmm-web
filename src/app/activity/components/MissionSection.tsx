'use client';

import type { Mission, MissionType, RewardType } from '@/generated/prisma/browser';

type MissionWithProgress = Mission & {
  currentProgress: number;
  progressPercentage: number;
  isCompleted: boolean;
  completedAt?: Date;
};

interface MissionSectionProps {
  missions?: MissionWithProgress[];
  isSnippet?: boolean;
}

export default function MissionSection({ missions = [], isSnippet = false }: MissionSectionProps) {
  // Find the closest incomplete mission (oldest by creation date)
  const closestMission = missions.find(m => !m.isCompleted);
  
  // Decide what to display
  const displayMissions = isSnippet && closestMission ? [closestMission] : missions;
  const completedCount = missions.filter(m => m.isCompleted).length;

  // Get icon based on mission type
  const getMissionIcon = (type: MissionType) => {
    switch (type) {
      case 'ORDER_COUNT':
        return '🛒';
      case 'ORDER_VALUE':
        return '💰';
      case 'REFERRAL_COUNT':
        return '👥';
      case 'REFERRAL_EARNINGS':
        return '💸';
      default:
        return '🎯';
    }
  };

  // Get reward description
  const getRewardDescription = (mission: Mission) => {
    const rewardValue = Number(mission.rewardValue);
    
    switch (mission.rewardType) {
      case 'REFERRAL_PERCENTAGE':
        return `+${rewardValue}% komisi referral`;
      case 'GLOBAL_DISCOUNT':
        return `+${rewardValue}% diskon global`;
      case 'BOTH':
        return `+${rewardValue}% komisi referral & diskon global`;
      default:
        return `Reward: ${rewardValue}%`;
    }
  };

  // Get action instruction based on mission type
  const getActionInstruction = (type: MissionType) => {
    switch (type) {
      case 'ORDER_COUNT':
        return 'Lakukan pemesanan untuk meningkatkan progress';
      case 'ORDER_VALUE':
        return 'Tingkatkan nilai total pembelian Anda';
      case 'REFERRAL_COUNT':
        return 'Ajak teman untuk mendaftar dengan kode referral Anda';
      case 'REFERRAL_EARNINGS':
        return 'Dapatkan komisi dari pembelian referral Anda';
      default:
        return 'Selesaikan misi untuk mendapatkan reward';
    }
  };

  // Format number based on mission type
  const formatProgress = (value: number, type: MissionType) => {
    if (type === 'ORDER_VALUE' || type === 'REFERRAL_EARNINGS') {
      return `Rp ${value.toLocaleString('id-ID')}`;
    }
    return value.toString();
  };

  // Get progress label
  const getProgressLabel = (type: MissionType) => {
    switch (type) {
      case 'ORDER_COUNT':
        return 'Pesanan';
      case 'ORDER_VALUE':
        return 'Total Belanja';
      case 'REFERRAL_COUNT':
        return 'Referral';
      case 'REFERRAL_EARNINGS':
        return 'Komisi Referral';
      default:
        return 'Progress';
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-800 hover:border-red-600 transition-all duration-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <svg className="w-8 h-8 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          {isSnippet ? 'Misi Terdekat' : 'Misi'}
        </h2>
        {!isSnippet && missions.length > 0 && (
          <span className="text-red-400 font-semibold">{completedCount}/{missions.length} Tercapai</span>
        )}
      </div>

      {displayMissions.length === 0 ? (
        <div className="text-center py-8 text-gray-300">
          <p>Belum ada misi tersedia</p>
        </div>
      ) : (
        <div className={isSnippet ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
          {displayMissions.map((mission) => (
            <div
              key={mission.id}
              className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${
                mission.isCompleted
                  ? 'bg-gradient-to-br from-red-900/40 to-red-950/40 border-2 border-red-700/50 shadow-lg shadow-red-900/20'
                  : 'bg-gray-900/50 border-2 border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`text-4xl ${mission.isCompleted ? 'grayscale-0' : 'grayscale opacity-50'}`}>
                  {getMissionIcon(mission.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">{mission.title}</h3>
                    {mission.isCompleted && (
                      <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 mb-3">
                    {mission.description}
                  </p>
                  
                  {/* Reward Badge */}
                  <div className="mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-900/30 text-yellow-300 border border-yellow-700/50">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {getRewardDescription(mission)}
                    </span>
                  </div>

                  {mission.isCompleted ? (
                    <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 text-green-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-semibold">
                          Misi selesai • {mission.completedAt ? new Date(mission.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Progress Indicator */}
                      <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400 font-medium">{getProgressLabel(mission.type)}</span>
                          <span className="text-xs text-gray-300 font-bold">{mission.progressPercentage}%</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-white font-semibold">
                            {formatProgress(mission.currentProgress, mission.type)}
                          </span>
                          <span className="text-xs text-gray-400">dari</span>
                          <span className="text-sm text-white font-semibold">
                            {formatProgress(Number(mission.targetValue), mission.type)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-red-600 to-red-500 h-2 rounded-full transition-all duration-500 relative"
                            style={{ width: `${mission.progressPercentage}%` }}
                          >
                            {mission.progressPercentage > 0 && (
                              <div className="absolute right-0 top-0 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Instruction */}
                      <div className="flex items-start space-x-2 text-gray-400">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs leading-relaxed">{getActionInstruction(mission.type)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
