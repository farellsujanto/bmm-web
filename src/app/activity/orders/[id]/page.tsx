'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/src/contexts/AuthContext';
import { apiRequest } from '@/src/utils/api/apiRequest';
import { PrimaryButton, SecondaryButton } from '@/src/components/ui';

interface OrderProduct {
  id: number;
  productId: number;
  name: string;
  sku: string;
  price: number;
  discount: number;
  affiliatePercent: number;
  quantity: number;
  subtotal: number;
  product: {
    id: number;
    name: string;
    slug: string;
    images: Array<{
      url: string;
      alt?: string;
    }>;
    brand: {
      name: string;
    };
  };
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  subtotal: number;
  discount: number;
  discountPercentage: number;
  total: number;
  affiliateCommission: number;
  shippingAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  orderProducts: OrderProduct[];
  user: {
    name?: string;
    phoneNumber: string;
    address?: string;
    governmentId?: string;
    company?: {
      name: string;
      taxId?: string;
      address?: string;
      phoneNumber?: string;
    };
  };
  paymentLogs: Array<{
    id: number;
    method: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && params.id) {
      fetchOrderDetails();
    }
  }, [isAuthenticated, params.id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      // params.id contains the order number from the URL
      const response = await apiRequest.get(`/v1/orders/${params.id}`);
      
      if (response.success) {
        setOrder(response.data as Order);
      } else {
        alert(response.message || 'Gagal memuat detail pesanan');
        router.push('/activity');
      }
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      alert(error.message || 'Terjadi kesalahan saat memuat detail pesanan');
      router.push('/activity');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusConfig = {
      PENDING_PAYMENT: { 
        bg: 'bg-yellow-900/50', 
        text: 'text-yellow-400', 
        label: 'Menunggu Pembayaran', 
        border: 'border-yellow-700',
        icon: '⏳'
      },
      PROCESSING: { 
        bg: 'bg-blue-900/50', 
        text: 'text-blue-400', 
        label: 'Diproses', 
        border: 'border-blue-700',
        icon: '📦'
      },
      SHIPPED: { 
        bg: 'bg-purple-900/50', 
        text: 'text-purple-400', 
        label: 'Dalam Pengiriman', 
        border: 'border-purple-700',
        icon: '🚚'
      },
      DELIVERED: { 
        bg: 'bg-green-900/50', 
        text: 'text-green-400', 
        label: 'Terkirim', 
        border: 'border-green-700',
        icon: '✅'
      },
      CANCELLED: { 
        bg: 'bg-red-900/50', 
        text: 'text-red-400', 
        label: 'Dibatalkan', 
        border: 'border-red-700',
        icon: '❌'
      },
      REFUNDED: { 
        bg: 'bg-gray-900/50', 
        text: 'text-gray-400', 
        label: 'Dikembalikan', 
        border: 'border-gray-700',
        icon: '↩️'
      },
    };

    return statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING_PAYMENT;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long',
      timeStyle: 'short'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handlePayment = () => {
    // TODO: Implement payment flow
    alert('Fitur pembayaran akan segera tersedia!');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-300">Memuat detail pesanan...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-red-900 pt-24 pb-16">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <button
                onClick={() => router.push('/activity?tab=orders')}
                className="text-gray-400 hover:text-white mb-4 flex items-center transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali ke Riwayat Pesanan
              </button>
              <h1 className="text-4xl font-bold text-white mb-2">
                Pesanan #{order.orderNumber}
              </h1>
              <p className="text-gray-400">{formatDate(order.createdAt)}</p>
            </div>
            <div className={`${statusInfo.bg} ${statusInfo.text} ${statusInfo.border} border px-6 py-3 rounded-2xl font-bold text-lg flex items-center space-x-2`}>
              <span className="text-2xl">{statusInfo.icon}</span>
              <span>{statusInfo.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products */}
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Item Pesanan
              </h2>

              <div className="space-y-4">
                {order.orderProducts.map((orderProduct) => (
                  <div
                    key={orderProduct.id}
                    className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-red-900 transition-all duration-300"
                  >
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 bg-gray-800 rounded-lg overflow-hidden shrink-0">
                        {orderProduct.product.images?.[0] && (
                          <Image
                            src={orderProduct.product.images[0].url}
                            alt={orderProduct.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">
                          {orderProduct.name}
                        </h3>
                        <p className="text-sm text-gray-400 mb-2">
                          {orderProduct.product.brand.name}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            {orderProduct.discount > 0 ? (
                              <>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm text-gray-500 line-through">
                                    {formatCurrency(orderProduct.price)}
                                  </p>
                                  <span className="text-xs bg-green-900/50 text-green-400 border border-green-700 px-2 py-0.5 rounded font-semibold">
                                    -{orderProduct.discount}%
                                  </span>
                                </div>
                                <p className="text-gray-400 text-sm">
                                  {formatCurrency(orderProduct.price * (1 - orderProduct.discount / 100))} × {orderProduct.quantity}
                                </p>
                              </>
                            ) : (
                              <p className="text-gray-400 text-sm">
                                {formatCurrency(orderProduct.price)} × {orderProduct.quantity}
                              </p>
                            )}
                          </div>
                          <p className="text-xl font-bold text-white">
                            {formatCurrency(orderProduct.subtotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Informasi Pelanggan
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Nama</p>
                  <p className="text-white font-semibold">{order.user.name || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Nomor Telepon</p>
                  <p className="text-white font-semibold">{order.user.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Alamat Pengiriman</p>
                  <p className="text-white font-semibold">{order.user.address || '-'}</p>
                </div>
                {order.user.company && (
                  <>
                    <div className="border-t border-gray-800 pt-4 mt-4">
                      <p className="text-gray-400 text-sm mb-3 font-semibold">Informasi Perusahaan</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Nama Perusahaan</p>
                      <p className="text-white font-semibold">{order.user.company.name}</p>
                    </div>
                    {order.user.company.taxId && (
                      <div>
                        <p className="text-gray-400 text-sm mb-1">NPWP</p>
                        <p className="text-white font-semibold">{order.user.company.taxId}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Shipping Information */}
            {order.shippingAddress && (
              <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <svg className="w-8 h-8 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Informasi Pengiriman
                </h2>

                <div>
                  <p className="text-gray-400 text-sm mb-1">Alamat Pengiriman</p>
                  <p className="text-white font-bold text-lg">{order.shippingAddress}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary & Actions */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-800 sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-6">Ringkasan</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatCurrency(order.subtotal)}</span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Diskon {order.discountPercentage > 0 ? `(${order.discountPercentage}%)` : ''}</span>
                    <span className="font-semibold">-{formatCurrency(order.discount)}</span>
                  </div>
                )}

                <div className="border-t border-gray-800 pt-4">
                  <div className="flex justify-between text-white text-xl font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {order.status === 'PENDING_PAYMENT' && (
                  <PrimaryButton
                    onClick={handlePayment}
                    className="w-full py-4 text-lg"
                  >
                    💳 Bayar Sekarang
                  </PrimaryButton>
                )}

                {order.status === 'SHIPPED' && (
                  <PrimaryButton
                    onClick={() => alert('Fitur lacak paket akan segera tersedia!')}
                    className="w-full py-4 text-lg"
                  >
                    📦 Lacak Paket
                  </PrimaryButton>
                )}

                {order.status === 'DELIVERED' && (
                  <PrimaryButton
                    onClick={() => router.push('/shop')}
                    className="w-full py-4 text-lg"
                  >
                    🛒 Beli Lagi
                  </PrimaryButton>
                )}

                <SecondaryButton
                  onClick={() => router.push('/contact')}
                  className="w-full py-4 text-lg"
                >
                  💬 Hubungi CS
                </SecondaryButton>
              </div>

              {/* Payment Logs */}
              {order.paymentLogs.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <h3 className="text-lg font-bold text-white mb-4">Riwayat Pembayaran</h3>
                  <div className="space-y-3">
                    {order.paymentLogs.map((log) => (
                      <div key={log.id} className="bg-gray-900/50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm text-gray-400">{log.method}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            log.status === 'SUCCESS' ? 'bg-green-900/50 text-green-400' :
                            log.status === 'PENDING' ? 'bg-yellow-900/50 text-yellow-400' :
                            'bg-red-900/50 text-red-400'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                        <p className="text-white font-semibold">{formatCurrency(log.amount)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(log.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
