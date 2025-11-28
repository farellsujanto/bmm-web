'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { useEffect } from 'react';
import Link from 'next/link';
import { DangerButton } from '@/src/components/ui';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Products', href: '/admin/products', icon: '📦' },
  { name: 'Categories', href: '/admin/categories', icon: '🏷️' },
  { name: 'Brands', href: '/admin/brands', icon: '🏢' },
  { name: 'Missions', href: '/admin/missions', icon: '🎯' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  const handleLogout = async () => {
    console.log('Logging out user:', user);
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <div className="bg-black text-white">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold">
              BMM Admin
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              {user.name || user.phoneNumber}
            </span>
            <DangerButton onClick={handleLogout}>
              Logout
            </DangerButton>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-red-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
