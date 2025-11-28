'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/src/contexts/AuthContext';
import { useCart } from '@/src/contexts/CartContext';
import { PrimaryButton, SecondaryButton } from '@/src/components/ui';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();
  const { items, totalPrice, totalItems } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (items.length === 0 && !isLoading) {
      router.push('/shop');
    }
  }, [items, isLoading, router]);

  const handlePayment = async () => {
    setIsProcessing(true);
    // Payment logic will be implemented later
    alert('Payment functionality coming soon!');
    setIsProcessing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Black overlay for navbar */}
      <div className="fixed top-0 left-0 right-0 h-20 bg-black z-40"></div>
      
      <div className="relative pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
            <p className="text-gray-600">Selesaikan pesanan Anda</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Item Pesanan ({totalItems})
                </h2>
                
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                      <div className="relative w-24 h-24 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                        {item.brand && (
                          <p className="text-sm text-gray-600 mb-2">{item.brand}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-red-600">
                              Rp {item.price.toLocaleString('id-ID')}
                            </p>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="text-xl font-bold text-gray-900">
                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                          </p>
                        </div>
                        {(item.preOrderReadyEarliest || item.preOrderReadyLatest) && (
                          <div className="mt-2">
                            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                              Pre-Order: {item.preOrderReadyEarliest}
                              {item.preOrderReadyLatest && `-${item.preOrderReadyLatest}`} minggu
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Informasi Pelanggan
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama
                    </label>
                    <p className="text-gray-900">{user?.name || 'Belum diisi'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nomor Telepon
                    </label>
                    <p className="text-gray-900">{user?.phoneNumber}</p>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Kami akan menghubungi Anda melalui WhatsApp untuk konfirmasi pesanan dan detail pembayaran.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Ringkasan Pesanan
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({totalItems} item)</span>
                    <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Biaya Pengiriman</span>
                    <span className="text-sm font-bold text-red-600">GRATIS</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-red-600">
                        Rp {totalPrice.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <PrimaryButton
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? 'Memproses...' : 'Lanjut ke Pembayaran'}
                  </PrimaryButton>
                  
                  <SecondaryButton
                    onClick={() => router.push('/shop')}
                    className="w-full"
                    size="md"
                  >
                    Lanjut Belanja
                  </SecondaryButton>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>
                      Pesanan Anda akan diproses setelah konfirmasi pembayaran. 
                      Tim kami akan menghubungi Anda untuk detail lebih lanjut.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
