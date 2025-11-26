'use client';

export default function MilestoneSection() {
  const milestones = [
    { id: 1, title: 'Pelanggan Baru', description: 'Selamat datang di BMM!', achieved: true, icon: '🎉', date: 'Nov 2025' },
    { id: 2, title: 'Pembelian Pertama', description: 'Transaksi pertama berhasil', achieved: true, icon: '🛒', date: 'Nov 2025' },
    { id: 3, title: 'Pelanggan Setia', description: '10 transaksi tercapai', achieved: true, icon: '⭐', date: 'Nov 2025' },
    { id: 4, title: 'Afiliasi Aktif', description: 'Referral pertama berhasil', achieved: true, icon: '🤝', date: 'Des 2025' },
    { id: 5, title: 'Top Buyer', description: '50 transaksi (Progress: 24/50)', achieved: false, icon: '👑', progress: 48 },
    { id: 6, title: 'Master Affiliate', description: '25 referral (Progress: 12/25)', achieved: false, icon: '💎', progress: 48 },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-800 hover:border-red-600 transition-all duration-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <svg className="w-8 h-8 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          Pencapaian
        </h2>
        <span className="text-red-400 font-semibold">4/6 Tercapai</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${
              milestone.achieved
                ? 'bg-gradient-to-br from-red-900/40 to-red-950/40 border-2 border-red-700/50 shadow-lg shadow-red-900/20'
                : 'bg-gray-900/50 border-2 border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`text-4xl ${milestone.achieved ? 'grayscale-0' : 'grayscale opacity-50'}`}>
                {milestone.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">{milestone.title}</h3>
                  {milestone.achieved && (
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-2">{milestone.description}</p>
                {milestone.achieved ? (
                  <span className="text-xs text-red-400 font-semibold">{milestone.date}</span>
                ) : (
                  <div className="mt-3">
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-red-600 to-red-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{milestone.progress}% Complete</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
