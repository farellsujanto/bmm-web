'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '@/src/utils/api/apiRequest';
import { Loader } from '@/src/components/ui';

interface DashboardStats {
  totalOrders: number;
  totalProductRequests: number;
  totalProducts: number;
  totalCategories: number;
  totalBrands: number;
  totalMissions: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalProductRequests: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
    totalMissions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [orders, productRequests, products, categories, brands, missions] = await Promise.all([
        apiRequest.get('/v1/admin/orders/count'),
        apiRequest.get('/v1/admin/product-requests/count'),
        apiRequest.get('/v1/admin/products/count'),
        apiRequest.get('/v1/admin/categories/count'),
        apiRequest.get('/v1/admin/brands/count'),
        apiRequest.get('/v1/admin/missions/count'),
      ]);

      setStats({
        totalOrders: (orders.data as number) || 0,
        totalProductRequests: (productRequests.data as number) || 0,
        totalProducts: (products.data as number) || 0,
        totalCategories: (categories.data as number) || 0,
        totalBrands: (brands.data as number) || 0,
        totalMissions: (missions.data as number) || 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: '🛒', color: 'bg-cyan-500' },
    { label: 'Product Requests', value: stats.totalProductRequests, icon: '📝', color: 'bg-amber-500' },
    { label: 'Total Products', value: stats.totalProducts, icon: '📦', color: 'bg-blue-500' },
    { label: 'Categories', value: stats.totalCategories, icon: '🏷️', color: 'bg-green-500' },
    { label: 'Brands', value: stats.totalBrands, icon: '🏢', color: 'bg-purple-500' },
    { label: 'Missions', value: stats.totalMissions, icon: '🎯', color: 'bg-orange-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} w-16 h-16 rounded-full flex items-center justify-center text-3xl`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/admin/orders"
            className="px-6 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-center"
          >
            View Orders
          </a>
          <a
            href="/admin/product-requests"
            className="px-6 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-center"
          >
            View Product Requests
          </a>
          <a
            href="/admin/products"
            className="px-6 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-center"
          >
            Add Product
          </a>
          <a
            href="/admin/categories"
            className="px-6 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-center"
          >
            Add Category
          </a>
          <a
            href="/admin/brands"
            className="px-6 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-center"
          >
            Add Brand
          </a>
          <a
            href="/admin/missions"
            className="px-6 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-center"
          >
            Add Mission
          </a>
        </div>
      </div>
    </div>
  );
}
