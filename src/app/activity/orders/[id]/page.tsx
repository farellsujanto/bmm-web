'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/src/contexts/AuthContext';
import { apiRequest } from '@/src/utils/api/apiRequest';
import { PrimaryButton, SecondaryButton } from '@/src/components/ui';
import Script from 'next/script';
import type { Order, OrderProduct } from '@/generated/prisma/browser';

type OrderWithRelations = Order & {
  orderProducts: (OrderProduct & {
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
  })[];
  user: {
    name?: string | null;
    phoneNumber: string;
    address?: string | null;
    governmentId?: string | null;
  };
  companyOrder?: {
    name: string;
    taxId: string | null;
    address?: string | null;
    phoneNumber?: string | null;
  } | null;
  paymentLogs: Array<{
    id: number;
    paymentMethod: string;
    paymentProvider: string;
    amount: number;
    transactionId?: string | null;
    paidAt: string;
    createdAt: string;
  }>;
};

// Declare global snap type for TypeScript
declare global {
  interface Window {
    snap?: {
      pay: (token: string, options?: any) => void;
    };
  }
}

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<OrderWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [snapReady, setSnapReady] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{
    paymentType: 'DP' | 'FULL' | 'CLEARANCE';
    amount: number;
    totalAmount: number;
    amountPaid: number;
    remainingBalance: number;
  } | null>(null);

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
        setOrder(response.data as OrderWithRelations);
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
        icon: '⚙️'
      },
      READY_TO_SHIP: { 
        bg: 'bg-cyan-900/50', 
        text: 'text-cyan-400', 
        label: 'Siap Dikirim', 
        border: 'border-cyan-700',
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

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long',
      timeStyle: 'short'
    }).format(dateObj);
  };

  const formatCurrency = (amount: number | string | { toString: () => string }) => {
    const numAmount = typeof amount === 'number' 
      ? amount 
      : typeof amount === 'string' 
        ? parseFloat(amount) 
        : parseFloat(amount.toString());
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(numAmount);
  };

  const handlePayment = async () => {
    if (!order || !snapReady) {
      alert('Payment gateway belum siap. Silakan refresh halaman.');
      return;
    }

    try {
      setIsProcessingPayment(true);

      // Request payment token from backend
      const response = await apiRequest.post(`/v1/orders/${params.id}/payment`, {});

      if (response.success && response.data) {
        const { token, paymentType, amount, totalAmount, amountPaid, remainingBalance } = response.data as any;
        
        // Store payment info for display
        setPaymentInfo({
          paymentType,
          amount,
          totalAmount,
          amountPaid,
          remainingBalance
        });

        // Open Midtrans Snap payment popup
        window.snap?.pay(token, {
          onSuccess: function(result: any) {
            console.log('Payment success:', result);
            alert(`Pembayaran ${paymentType === 'DP' ? 'DP' : paymentType === 'CLEARANCE' ? 'pelunasan' : ''} berhasil! Halaman akan dimuat ulang.`);
            // Refresh the page to show updated order status
            window.location.reload();
          },
          onPending: function(result: any) {
            console.log('Payment pending:', result);
            alert('Pembayaran sedang diproses. Kami akan memberitahu Anda jika pembayaran berhasil.');
            // Refresh to show pending status
            window.location.reload();
          },
          onError: function(result: any) {
            console.error('Payment error:', result);
            alert('Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.');
            setIsProcessingPayment(false);
          },
          onClose: function() {
            console.log('Payment popup closed');
            setIsProcessingPayment(false);
          }
        });
      } else {
        alert(response.message || 'Gagal membuat token pembayaran');
        setIsProcessingPayment(false);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(error.message || 'Terjadi kesalahan saat memproses pembayaran');
      setIsProcessingPayment(false);
    }
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
console.log(order);
console.log("SNAP", isProcessingPayment, snapReady)
  const statusInfo = getStatusInfo(order.status);

  return (
    <>
      {/* Load Midtrans Snap script */}
      <Script
        src={process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || 'https://app.sandbox.midtrans.com/snap/snap.js'}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
        onLoad={() => setSnapReady(true)}
        onError={() => console.error('Failed to load Midtrans Snap')}
      />

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
              <p className="text-gray-400 mb-4">{formatDate(order.createdAt)}</p>
              
              {/* Status Badge */}
              <div className={`inline-flex items-center space-x-2 ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border} border px-4 py-2 rounded-xl font-bold`}>
                <span className="text-xl">{statusInfo.icon}</span>
                <span>{statusInfo.label}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Order Status Timeline - Full Width */}
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-800 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-center">
            <svg className="w-8 h-8 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Status Pesanan
          </h2>
          
          {/* Order Progress Steps */}
          <div className="relative max-w-5xl mx-auto">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-700">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 via-blue-500 via-cyan-500 via-purple-500 to-green-500 transition-all duration-500"
                style={{ 
                  width: `${
                    order.status === 'PENDING_PAYMENT' ? '0%' :
                    order.status === 'PROCESSING' ? '25%' :
                    order.status === 'READY_TO_SHIP' ? '50%' :
                    order.status === 'SHIPPED' ? '75%' :
                    order.status === 'DELIVERED' ? '100%' :
                    order.status === 'CANCELLED' ? '0%' :
                    order.status === 'REFUNDED' ? '0%' : '0%'
                  }` 
                }}
              />
            </div>

            {/* Status Steps */}
            <div className="relative flex justify-between">
              {/* Pending Payment */}
              <div className="flex flex-col items-center" style={{ width: '20%' }}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                  order.status !== 'PENDING_PAYMENT' && order.status !== 'CANCELLED' && order.status !== 'REFUNDED'
                    ? 'bg-yellow-600 text-white' 
                    : order.status === 'PENDING_PAYMENT'
                      ? 'bg-yellow-600 text-white animate-pulse'
                      : 'bg-gray-700 text-gray-400'
                }`}>
                  {order.status !== 'PENDING_PAYMENT' && order.status !== 'CANCELLED' && order.status !== 'REFUNDED' ? '✓' : '⏳'}
                </div>
                <div className="mt-3 text-center">
                  <p className="text-sm font-semibold text-gray-300">Menunggu</p>
                  <p className="text-xs text-gray-500 mt-1">Pembayaran</p>
                </div>
              </div>

              {/* Processing */}
              <div className="flex flex-col items-center" style={{ width: '20%' }}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                  order.status === 'READY_TO_SHIP' || order.status === 'SHIPPED' || order.status === 'DELIVERED'
                    ? 'bg-blue-600 text-white' 
                    : order.status === 'PROCESSING'
                      ? 'bg-blue-600 text-white animate-pulse'
                      : 'bg-gray-700 text-gray-400'
                }`}>
                  {order.status === 'READY_TO_SHIP' || order.status === 'SHIPPED' || order.status === 'DELIVERED' ? '✓' : '⚙️'}
                </div>
                <div className="mt-3 text-center">
                  <p className="text-sm font-semibold text-gray-300">Diproses</p>
                  <p className="text-xs text-gray-500 mt-1">Admin</p>
                </div>
              </div>

              {/* Ready to Ship */}
              <div className="flex flex-col items-center" style={{ width: '20%' }}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                  order.status === 'SHIPPED' || order.status === 'DELIVERED'
                    ? 'bg-cyan-600 text-white' 
                    : order.status === 'READY_TO_SHIP'
                      ? 'bg-cyan-600 text-white animate-pulse'
                      : 'bg-gray-700 text-gray-400'
                }`}>
                  {order.status === 'SHIPPED' || order.status === 'DELIVERED' ? '✓' : '📦'}
                </div>
                <div className="mt-3 text-center">
                  <p className="text-sm font-semibold text-gray-300">Siap Kirim</p>
                  <p className="text-xs text-gray-500 mt-1">Packing</p>
                </div>
              </div>

              {/* Shipped */}
              <div className="flex flex-col items-center" style={{ width: '20%' }}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                  order.status === 'DELIVERED'
                    ? 'bg-purple-600 text-white' 
                    : order.status === 'SHIPPED'
                      ? 'bg-purple-600 text-white animate-pulse'
                      : 'bg-gray-700 text-gray-400'
                }`}>
                  {order.status === 'DELIVERED' ? '✓' : '🚚'}
                </div>
                <div className="mt-3 text-center">
                  <p className="text-sm font-semibold text-gray-300">Dikirim</p>
                  <p className="text-xs text-gray-500 mt-1">Dalam Perjalanan</p>
                </div>
              </div>

              {/* Delivered */}
              <div className="flex flex-col items-center" style={{ width: '20%' }}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                  order.status === 'DELIVERED'
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {order.status === 'DELIVERED' ? '✓' : '🏠'}
                </div>
                <div className="mt-3 text-center">
                  <p className="text-sm font-semibold text-gray-300">Selesai</p>
                  <p className="text-xs text-gray-500 mt-1">Diterima</p>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                            {Number(orderProduct.discount) > 0 ? (
                              <>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm text-gray-500 line-through">
                                    {formatCurrency(orderProduct.price)}
                                  </p>
                                  <span className="text-xs bg-green-900/50 text-green-400 border border-green-700 px-2 py-0.5 rounded font-semibold">
                                    -{Number(orderProduct.discount)}%
                                  </span>
                                </div>
                                <p className="text-gray-400 text-sm">
                                  {formatCurrency(Number(orderProduct.price) * (1 - Number(orderProduct.discount) / 100))} × {orderProduct.quantity}
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
                {order.companyOrder && (
                  <>
                    <div className="border-t border-gray-800 pt-4 mt-4">
                      <p className="text-gray-400 text-sm mb-3 font-semibold">Informasi Perusahaan</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Nama Perusahaan</p>
                      <p className="text-white font-semibold">{order.companyOrder.name}</p>
                    </div>
                    {order.companyOrder.taxId && (
                      <div>
                        <p className="text-gray-400 text-sm mb-1">NPWP</p>
                        <p className="text-white font-semibold">{order.companyOrder.taxId}</p>
                      </div>
                    )}
                    {order.companyOrder.address && (
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Alamat Perusahaan</p>
                        <p className="text-white font-semibold">{order.companyOrder.address}</p>
                      </div>
                    )}
                    {order.companyOrder.phoneNumber && (
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Nomor Telepon Perusahaan</p>
                        <p className="text-white font-semibold">{order.companyOrder.phoneNumber}</p>
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

                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Diskon {Number(order.discountPercentage) > 0 ? `(${Number(order.discountPercentage)}%)` : ''}</span>
                    <span className="font-semibold">-{formatCurrency(order.discount)}</span>
                  </div>
                )}

                <div className="border-t border-gray-800 pt-4">
                  <div className="flex justify-between text-white text-xl font-bold mb-4">
                    <span>Total Pesanan</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>

                  {/* Payment Progress */}
                  {Number(order.amountPaid) > 0 ? (
                    <>
                      {/* Payment Breakdown */}
                      <div className="bg-gray-900/50 rounded-xl p-4 mb-4 space-y-3">
                        <div className="flex justify-between text-blue-400">
                          <span className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Sudah Dibayar
                          </span>
                          <span className="font-bold">{formatCurrency(order.amountPaid)}</span>
                        </div>
                        
                        {Number(order.remainingBalance) > 0 && (
                          <div className="flex justify-between text-yellow-400">
                            <span className="flex items-center">
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Sisa Pembayaran
                            </span>
                            <span className="font-bold">{formatCurrency(order.remainingBalance)}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-2">
                          <span>Progress Pembayaran</span>
                          <span className="font-bold text-white">
                            {((Number(order.amountPaid) / Number(order.total)) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden relative">
                          <div 
                            className="bg-gradient-to-r from-blue-500 via-blue-600 to-green-500 h-full transition-all duration-500 relative"
                            style={{ width: `${(Number(order.amountPaid) / Number(order.total)) * 100}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Status Badge */}
                      {Number(order.remainingBalance) > 0 && (
                        <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500 rounded-xl p-4">
                          <div className="flex items-center mb-2">
                            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-yellow-400 font-bold">
                                {order.status === 'READY_TO_SHIP' ? '🚨 Pembayaran Pelunasan Diperlukan' : '💰 DP Sudah Dibayar'}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {order.status === 'READY_TO_SHIP' 
                                  ? 'Pesanan siap dikirim setelah pelunasan' 
                                  : 'Pesanan sedang diproses'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border-2 border-red-500 rounded-xl p-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-3 animate-pulse">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-red-400 font-bold">⏳ Menunggu Pembayaran</p>
                          <p className="text-xs text-gray-400 mt-0.5">Selesaikan pembayaran untuk memproses pesanan</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {(order.status === 'PENDING_PAYMENT' || order.status === 'PROCESSING' || order.status === 'READY_TO_SHIP') && Number(order.remainingBalance) > 0 && (
                  <>
                    {/* Calculate payment details */}
                    {(() => {
                      const totalAmount = Number(order.total);
                      const amountPaid = Number(order.amountPaid);
                      const remainingBalance = Number(order.remainingBalance);
                      const isFirstPayment = amountPaid === 0;
                      
                      // Check if DP is required
                      const requiresDP = order.orderProducts.some(op => 
                        Number(op.downpaymentPercentage) > 0 && Number(op.downpaymentPercentage) < 100
                      );
                      
                      // Calculate DP amount if needed
                      const maxDPPercentage = requiresDP 
                        ? Math.max(...order.orderProducts.map(op => Number(op.downpaymentPercentage)))
                        : 100;
                      
                      const dpAmount = Math.ceil(totalAmount * (maxDPPercentage / 100));
                      const isClearancePayment = !isFirstPayment;
                      const isUrgent = order.status === 'READY_TO_SHIP';

                      return (
                        <>
                          <PrimaryButton
                            onClick={handlePayment}
                            disabled={isProcessingPayment || !snapReady}
                            className={`w-full py-4 text-lg font-bold transition-all duration-300 ${
                              isUrgent 
                                ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 animate-pulse' 
                                : ''
                            }`}
                          >
                            {isProcessingPayment ? (
                              <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Memproses Pembayaran...
                              </span>
                            ) : isClearancePayment ? (
                              <span className="flex items-center justify-center">
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {isUrgent ? '🚨 Bayar Pelunasan Sekarang' : '💳 Bayar Pelunasan'}
                                <span className="ml-2 text-sm font-normal opacity-90">
                                  ({formatCurrency(remainingBalance)})
                                </span>
                              </span>
                            ) : requiresDP ? (
                              <span className="flex items-center justify-center">
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                💰 Bayar DP ({maxDPPercentage.toFixed(0)}%)
                                <span className="ml-2 text-sm font-normal opacity-90">
                                  ({formatCurrency(dpAmount)})
                                </span>
                              </span>
                            ) : (
                              <span className="flex items-center justify-center">
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                💳 Bayar Sekarang
                                <span className="ml-2 text-sm font-normal opacity-90">
                                  ({formatCurrency(totalAmount)})
                                </span>
                              </span>
                            )}
                          </PrimaryButton>
                          
                          {/* Payment Info Card */}
                          <div className={`rounded-xl p-4 text-xs ${
                            isUrgent 
                              ? 'bg-gradient-to-r from-red-900/50 to-orange-900/50 border-2 border-red-500' 
                              : 'bg-gray-900/50 border border-gray-700'
                          }`}>
                            {isClearancePayment ? (
                              isUrgent ? (
                                <>
                                  <div className="flex items-start mb-2">
                                    <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div>
                                      <p className="text-red-400 font-bold">🚨 PELUNASAN DIPERLUKAN!</p>
                                      <p className="text-gray-300 mt-1 leading-relaxed">
                                        Pesanan Anda sudah <span className="font-semibold text-white">siap dikirim</span>. 
                                        Selesaikan pembayaran pelunasan sebesar <span className="font-bold text-yellow-400">{formatCurrency(remainingBalance)}</span> untuk 
                                        melanjutkan proses pengiriman.
                                      </p>
                                    </div>
                                  </div>
                                  <div className="bg-black/30 rounded-lg p-3 mt-3">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-gray-400">Total Pesanan:</span>
                                      <span className="text-white font-semibold">{formatCurrency(totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-blue-400">DP Dibayar:</span>
                                      <span className="text-blue-400 font-semibold">-{formatCurrency(amountPaid)}</span>
                                    </div>
                                    <div className="border-t border-gray-700 pt-2 mt-2">
                                      <div className="flex justify-between items-center">
                                        <span className="text-yellow-400 font-bold">Sisa Pembayaran:</span>
                                        <span className="text-yellow-400 font-bold text-lg">{formatCurrency(remainingBalance)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-start mb-2">
                                    <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                      <p className="text-blue-400 font-bold">✅ DP Sudah Dibayar</p>
                                      <p className="text-gray-400 mt-1 leading-relaxed">
                                        Pesanan sedang diproses. Anda dapat melunasi sisa pembayaran sebesar <span className="font-semibold text-white">{formatCurrency(remainingBalance)}</span> kapan saja 
                                        untuk mempercepat pengiriman.
                                      </p>
                                    </div>
                                  </div>
                                </>
                              )
                            ) : requiresDP ? (
                              <>
                                <div className="flex items-start mb-2">
                                  <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <div>
                                    <p className="text-yellow-400 font-bold">💰 Sistem Pembayaran Bertahap</p>
                                    <p className="text-gray-400 mt-1 leading-relaxed">
                                      <span className="font-semibold text-white">Langkah 1:</span> Bayar DP sebesar <span className="font-bold text-yellow-400">{formatCurrency(dpAmount)}</span> ({maxDPPercentage.toFixed(0)}%) 
                                      untuk memulai proses pesanan.
                                    </p>
                                    <p className="text-gray-400 mt-2 leading-relaxed">
                                      <span className="font-semibold text-white">Langkah 2:</span> Lunasi sisa <span className="font-bold text-white">{formatCurrency(totalAmount - dpAmount)}</span> saat 
                                      pesanan siap dikirim.
                                    </p>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-start">
                                  <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <div>
                                    <p className="text-green-400 font-bold">💳 Pembayaran Penuh</p>
                                    <p className="text-gray-400 mt-1 leading-relaxed">
                                      Bayar full payment sebesar <span className="font-bold text-white">{formatCurrency(totalAmount)}</span> untuk 
                                      langsung memproses pesanan Anda.
                                    </p>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </>
                )}

                {Number(order.remainingBalance) === 0 && order.status !== 'SHIPPED' && order.status !== 'DELIVERED' && (
                  <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-2 border-green-500 rounded-xl p-5 text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-green-400 font-bold text-lg mb-1">✅ Pembayaran Lunas</p>
                    <p className="text-sm text-gray-400">Pesanan Anda sedang diproses dengan baik</p>
                  </div>
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
                  💬 Hubungi Customer Service
                </SecondaryButton>
              </div>

              {/* Payment Logs */}
              {order.paymentLogs.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Riwayat Pembayaran
                  </h3>
                  <div className="space-y-3">
                    {order.paymentLogs.map((log, index) => {
                      // Determine payment type based on amount and order
                      const isFirstPayment = index === order.paymentLogs.length - 1;
                      const isFullPayment = Number(log.amount) === Number(order.total);
                      const paymentLabel = isFullPayment 
                        ? 'Pembayaran Penuh' 
                        : isFirstPayment 
                          ? 'Down Payment (DP)' 
                          : 'Pembayaran Pelunasan';
                      
                      return (
                        <div key={log.id} className="bg-gradient-to-r from-gray-900/70 to-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-green-600 transition-all duration-300">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-green-400">{paymentLabel}</p>
                                <p className="text-xs text-gray-400">
                                  {log.paymentMethod?.replace(/_/g, ' ') || 'N/A'} - {log.paymentProvider || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs px-3 py-1 rounded-full bg-green-900/50 text-green-400 border border-green-700 font-semibold">
                              BERHASIL
                            </span>
                          </div>
                          <div className="flex justify-between items-end mt-3">
                            <div>
                              {log.transactionId && (
                                <p className="text-xs text-gray-500 mb-1">
                                  ID: {log.transactionId}
                                </p>
                              )}
                              <p className="text-xs text-gray-400">
                                {formatDate(log.paidAt || log.createdAt)}
                              </p>
                            </div>
                            <p className="text-white font-bold text-xl">{formatCurrency(log.amount)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
