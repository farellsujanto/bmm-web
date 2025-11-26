'use client';

export default function AffiliateSection() {
  const referralCode = 'BMM2025XYZ';
  const referralLink = `https://bmmtbd.com/ref/${referralCode}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Link referral berhasil disalin!');
  };

  return (
    <div className="bg-gradient-to-br from-red-900 via-red-800 to-red-900 rounded-3xl p-8 shadow-2xl border border-red-700 hover:shadow-red-900/50 transition-all duration-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <svg className="w-8 h-8 mr-3 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Program Afiliasi
        </h2>
        <span className="bg-red-950 text-red-300 px-4 py-2 rounded-full text-sm font-semibold">
          Aktif
        </span>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-black/40 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-red-300 text-sm mb-1">Total Referral</p>
            <p className="text-3xl font-bold text-white">12</p>
          </div>
          <div className="bg-black/40 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-red-300 text-sm mb-1">Komisi Bulan Ini</p>
            <p className="text-3xl font-bold text-white">Rp 1.2M</p>
          </div>
          <div className="bg-black/40 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-red-300 text-sm mb-1">Total Earnings</p>
            <p className="text-3xl font-bold text-white">Rp 8.5M</p>
          </div>
        </div>

        <div className="bg-black/40 rounded-2xl p-6 backdrop-blur-sm">
          <p className="text-red-300 text-sm mb-3">Link Referral Anda</p>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-red-500"
            />
            <button
              onClick={copyToClipboard}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Salin</span>
            </button>
          </div>
        </div>

        <div className="bg-black/40 rounded-2xl p-6 backdrop-blur-sm">
          <p className="text-red-300 text-sm mb-3">Kode Referral</p>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-mono font-bold text-white tracking-wider">{referralCode}</span>
            <span className="text-red-300 text-sm">Komisi 10% per transaksi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
