'use client';

import Link from 'next/link';

interface OrderSectionProps {
  orders?: any[];
  isSnippet?: boolean;
}

export default function OrderSection({ orders = [], isSnippet = false }: OrderSectionProps) {
  const displayOrders = orders;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING_PAYMENT: { bg: 'bg-yellow-900/50', text: 'text-yellow-400', label: 'Menunggu Pembayaran', border: 'border-yellow-700' },
      PROCESSING: { bg: 'bg-blue-900/50', text: 'text-blue-400', label: 'Diproses', border: 'border-blue-700' },
      READY_TO_SHIP: { bg: 'bg-cyan-900/50', text: 'text-cyan-400', label: 'Siap Dikirim', border: 'border-cyan-700' },
      SHIPPED: { bg: 'bg-purple-900/50', text: 'text-purple-400', label: 'Dalam Pengiriman', border: 'border-purple-700' },
      DELIVERED: { bg: 'bg-green-900/50', text: 'text-green-400', label: 'Terkirim', border: 'border-green-700' },
      CANCELLED: { bg: 'bg-red-900/50', text: 'text-red-400', label: 'Dibatalkan', border: 'border-red-700' },
      REFUNDED: { bg: 'bg-gray-900/50', text: 'text-gray-400', label: 'Dikembalikan', border: 'border-gray-700' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING_PAYMENT;

    return (
      <span className={`${config.bg} ${config.text} ${config.border} border px-3 py-1 rounded-full text-xs font-semibold`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
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

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-800 hover:border-red-600 transition-all duration-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <svg className="w-8 h-8 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {isSnippet ? 'Pesanan Terbaru' : 'Riwayat Pesanan'}
        </h2>
        {isSnippet && displayOrders.length > 0 && (
          <button className="text-red-400 hover:text-red-300 font-semibold text-sm transition-colors">
            Lihat Semua →
          </button>
        )}
      </div>

      {displayOrders.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>Belum ada pesanan</p>
          <p className="text-sm mt-2">Mulai belanja sekarang!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayOrders.map((order) => (
            <Link
              key={order.id}
              href={`/activity/orders/${order.orderNumber}`}
              className="block bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-red-900 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{order.orderNumber || `#${order.id}`}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-sm text-gray-400">{formatDate(order.createdAt)}</p>
                </div>
                <p className="text-xl font-bold text-white">{formatCurrency(order.total)}</p>
              </div>

              <div className="border-t border-gray-800 pt-4 mb-4">
                <p className="text-gray-300 text-sm mb-2">
                  {order.orderProducts?.length || 0} item{(order.orderProducts?.length || 0) > 1 ? 's' : ''}
                </p>
                {order.shippingAddress && (
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Alamat: {order.shippingAddress.substring(0, 30)}...</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Klik untuk melihat detail</span>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!isSnippet && displayOrders.length > 0 && (
        <div className="mt-6 text-center">
          <button className="text-gray-400 hover:text-white transition-colors text-sm font-semibold">
            Muat Lebih Banyak
          </button>
        </div>
      )}
    </div>
  );
}
