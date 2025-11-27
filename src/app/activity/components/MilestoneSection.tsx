'use client';

interface Mission {
  id: number;
  title: string;
  description: string;
  type: string;
  targetValue: number;
  rewardType: string;
  rewardValue: string;
  icon: string;
  currentProgress: number;
  progressPercentage: number;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
}

interface MissionSectionProps {
  missions?: Mission[];
  isSnippet?: boolean;
}

export default function MissionSection({ missions = [], isSnippet = false }: MissionSectionProps) {
  // Find the closest incomplete mission (oldest by creation date)
  const closestMission = missions.find(m => !m.isCompleted);
  
  // Decide what to display
  const displayMissions = isSnippet && closestMission ? [closestMission] : missions;
  const completedCount = missions.filter(m => m.isCompleted).length;

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
                  {mission.icon}
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
                  <p className="text-sm text-gray-300 mb-2">
                    {mission.description} ({mission.currentProgress}/{mission.targetValue})
                  </p>
                  {mission.isCompleted ? (
                    <span className="text-xs text-red-400 font-semibold">
                      Selesai {mission.completedAt ? new Date(mission.completedAt).toLocaleDateString('id-ID') : ''}
                    </span>
                  ) : (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Progress</span>
                        <span className="text-xs text-gray-300 font-semibold">{mission.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-red-600 to-red-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${mission.progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
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
