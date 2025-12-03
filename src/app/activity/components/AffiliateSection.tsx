'use client';

import { useAlert } from '@/src/contexts/AlertContext';

interface AffiliateSectionProps {
  affiliateData?: any;
  userData?: any;
}

export default function AffiliateSection({ affiliateData, userData }: AffiliateSectionProps) {
  const { showAlert } = useAlert();
  const referralCode = affiliateData?.referralCode || userData?.referralCode || 'BMM2025XYZ';
  const referralLink = affiliateData?.referralLink || `https://bmmparts.co.id/ref/${referralCode}`;
  const commissionRate = affiliateData?.commissionRate || userData?.maxReferralPercentage || '2.5';
  const totalReferrals = affiliateData?.totalReferrals || 0;
  const totalEarnings = affiliateData?.totalEarnings ? parseFloat(affiliateData.totalEarnings) : 0;
  const affiliatedOrders = affiliateData?.affiliatedOrders || [];
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    showAlert({ message: 'Link referral berhasil disalin!' });
  };

  return (
    <div className="bg-gradient-to-br from-red-900 via-red-800 to-red-900 rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl border border-red-700 hover:shadow-red-900/50 transition-all duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Program Afiliasi
        </h2>
        <span className="bg-red-950 text-red-300 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
          Aktif
        </span>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-black/40 rounded-2xl p-3 sm:p-4 backdrop-blur-sm">
            <p className="text-red-300 text-xs sm:text-sm mb-1">Total Referral</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">{totalReferrals}</p>
          </div>
          <div className="bg-black/40 rounded-2xl p-3 sm:p-4 backdrop-blur-sm">
            <p className="text-red-300 text-xs sm:text-sm mb-1">Komisi Bulan Ini</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">Rp {(totalEarnings / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-black/40 rounded-2xl p-3 sm:p-4 backdrop-blur-sm">
            <p className="text-red-300 text-xs sm:text-sm mb-1">Total Earnings</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">Rp {(totalEarnings / 1000).toFixed(1)}K</p>
          </div>
        </div>

        <div className="bg-black/40 rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
          <p className="text-red-300 text-xs sm:text-sm mb-3">Link Referral Anda</p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 bg-gray-900 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-red-500 text-sm sm:text-base"
            />
            <button
              onClick={copyToClipboard}
              className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Salin</span>
            </button>
          </div>
        </div>

        <div className="bg-black/40 rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
          <p className="text-red-300 text-xs sm:text-sm mb-3">Kode Referral</p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <span className="text-xl sm:text-2xl md:text-3xl font-mono font-bold text-white tracking-wider break-all">{referralCode}</span>
            <span className="text-red-300 text-xs sm:text-sm whitespace-nowrap">Komisi {commissionRate}% per transaksi</span>
          </div>
        </div>

        {/* Affiliated Orders Section */}
        {affiliatedOrders.length > 0 ? (
          <div className="bg-black/40 rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
            <p className="text-red-300 text-xs sm:text-sm mb-4">Pesanan dari Referral Anda</p>
            <div className="space-y-2 sm:space-y-3">
              {affiliatedOrders.map((order: any, index: number) => (
                <div key={index} className="bg-gray-900/50 rounded-lg p-3 sm:p-4 border border-gray-800">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0">
                    <div>
                      <p className="text-white font-semibold text-sm sm:text-base">{order.userName || 'Customer'}</p>
                      <p className="text-gray-300 text-xs">Order #{order.id}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-white font-semibold text-sm sm:text-base">Rp {parseFloat(order.total).toLocaleString('id-ID')}</p>
                      <p className="text-green-400 text-xs">Komisi: Rp {parseFloat(order.commission).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-black/40 rounded-2xl p-4 sm:p-6 backdrop-blur-sm text-center">
            <p className="text-gray-300 text-sm">Belum ada pesanan dari referral Anda</p>
            <p className="text-red-300 text-xs mt-2">Bagikan link referral Anda untuk mulai mendapatkan komisi!</p>
          </div>
        )}
      </div>
    </div>
  );
}
