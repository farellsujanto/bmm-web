'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProfileSection from './components/ProfileSection';
import AffiliateSection from './components/AffiliateSection';
import MissionSection from './components/MissionSection';
import OrderSection from './components/OrderSection';
import { useAuth } from '@/src/contexts/AuthContext';
import { apiRequest } from '@/src/utils/api/apiRequest';
import { SecondaryButton } from '@/src/components/ui';

export default function ActivityPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [affiliateData, setAffiliateData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role === 'ADMIN') {
        // Redirect admins to admin dashboard
        router.push('/admin');
      } else {
        fetchUserData();
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  const fetchOrders = async () => {
    try {
      const ordersData = await apiRequest.get('/v1/user/orders');
      if (ordersData.success) {
        setOrders(ordersData.data as any);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [profileData, missionsData, affiliateResData] = await Promise.all([
        apiRequest.get('/v1/user/profile'),
        apiRequest.get('/v1/user/missions'),
        apiRequest.get('/v1/user/affiliate')
      ]);

      if (profileData.success) {
        setUserData(profileData.data);
      }

      if (missionsData.success) {
        setMissions(missionsData.data as any[]);
      }

      if (affiliateResData.success) {
        setAffiliateData(affiliateResData.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-red-900 pt-24 pb-16">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-red-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                Pusat <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">Aktifitas</span>
              </h1>
              <p className="text-xl text-gray-300">Kelola aktivitas dan pantau performa Anda</p>
            </div>
            <SecondaryButton
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Keluar</span>
            </SecondaryButton>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2 bg-gray-900/50 p-2 rounded-2xl backdrop-blur-sm border border-gray-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/50'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'orders'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/50'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Pesanan
            </button>
            <button
              onClick={() => setActiveTab('affiliate')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'affiliate'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/50'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Afiliasi
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'achievements'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/50'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Misi
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-red-900 to-red-950 rounded-2xl p-6 border border-red-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-red-300 text-sm">Total Belanja</p>
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-white">
                  Rp {userData?.statistics?.totalSpent ? (parseFloat(userData.statistics.totalSpent) / 1000).toFixed(1) : '0'}K
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-900 to-blue-950 rounded-2xl p-6 border border-blue-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-blue-300 text-sm">Total Pesanan</p>
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-white">{userData?.statistics?.totalOrders || 0}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-900 to-green-950 rounded-2xl p-6 border border-green-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-green-300 text-sm">Total Referral</p>
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-white">{userData?.statistics?.totalReferrals || 0}</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-900 to-purple-950 rounded-2xl p-6 border border-purple-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-purple-300 text-sm">Komisi Earned</p>
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-white">
                  Rp {userData?.statistics?.totalReferralEarnings ? (parseFloat(userData.statistics.totalReferralEarnings) / 1000).toFixed(1) : '0'}K
                </p>
              </div>
            </div>

            {/* Mission and Benefits Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <MissionSection missions={missions} isSnippet={true} />
              <div className="bg-gradient-to-br from-red-900 via-red-800 to-red-900 rounded-3xl p-8 shadow-2xl border border-red-700">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <svg className="w-8 h-8 mr-3 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Keuntungan Anda
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-black/40 rounded-2xl p-6 backdrop-blur-sm">
                    <p className="text-red-300 text-sm mb-2">Komisi Referral</p>
                    <p className="text-4xl font-bold text-white mb-2">
                      {userData?.maxReferralPercentage || '0'}%
                    </p>
                    <p className="text-red-200 text-xs">Dapatkan {userData?.maxReferralPercentage || '0'}% dari setiap pembelian referral Anda</p>
                  </div>
                  <div className="bg-black/40 rounded-2xl p-6 backdrop-blur-sm">
                    <p className="text-red-300 text-sm mb-2">Diskon Global</p>
                    <p className="text-4xl font-bold text-white mb-2">
                      {userData?.globalDiscountPercentage || '0'}%
                    </p>
                    <p className="text-red-200 text-xs">Hemat {userData?.globalDiscountPercentage || '0'}% untuk semua pembelian Anda</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Section */}
            <ProfileSection userData={userData} />
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-8">
            <OrderSection orders={orders} isSnippet={false} />
          </div>
        )}

        {activeTab === 'affiliate' && (
          <div className="space-y-8">
            <AffiliateSection affiliateData={affiliateData} userData={userData} />
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-8">
            <MissionSection missions={missions} isSnippet={false} />
          </div>
        )}
          </>
        )}
      </div>

      {/* Quick Actions FAB */}
      <Link
        href="/shop"
        className="fixed bottom-8 right-8 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-6 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-50 group"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Belanja Sekarang
        </span>
      </Link>
    </div>
  );
}
