'use client';

export default function OrderSection() {
  const orders = [
    { 
      id: 'ORD-2025-001', 
      date: '25 Nov 2025', 
      items: 'Bearing Bola Industrial, Kit Seal HP',
      total: 'Rp 2.140.000',
      status: 'delivered',
      trackingNumber: 'JNE123456789'
    },
    { 
      id: 'ORD-2025-002', 
      date: '23 Nov 2025', 
      items: 'Sistem Pompa Hidrolik',
      total: 'Rp 8.500.000',
      status: 'shipping',
      trackingNumber: 'JNE987654321'
    },
    { 
      id: 'ORD-2025-003', 
      date: '20 Nov 2025', 
      items: 'Pelumas Sintetis 5L (x3)',
      total: 'Rp 435.000',
      status: 'processing',
      trackingNumber: '-'
    },
    { 
      id: 'ORD-2025-004', 
      date: '18 Nov 2025', 
      items: 'Kunci Torsi Profesional',
      total: 'Rp 4.200.000',
      status: 'delivered',
      trackingNumber: 'JNE555666777'
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      delivered: { bg: 'bg-green-900/50', text: 'text-green-400', label: 'Terkirim', border: 'border-green-700' },
      shipping: { bg: 'bg-blue-900/50', text: 'text-blue-400', label: 'Dalam Pengiriman', border: 'border-blue-700' },
      processing: { bg: 'bg-yellow-900/50', text: 'text-yellow-400', label: 'Diproses', border: 'border-yellow-700' },
      cancelled: { bg: 'bg-red-900/50', text: 'text-red-400', label: 'Dibatalkan', border: 'border-red-700' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.processing;

    return (
      <span className={`${config.bg} ${config.text} ${config.border} border px-3 py-1 rounded-full text-xs font-semibold`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-800 hover:border-red-600 transition-all duration-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <svg className="w-8 h-8 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Riwayat Pesanan
        </h2>
        <button className="text-red-400 hover:text-red-300 font-semibold text-sm transition-colors">
          Lihat Semua →
        </button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-red-900 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-bold text-white">{order.id}</h3>
                  {getStatusBadge(order.status)}
                </div>
                <p className="text-sm text-gray-400">{order.date}</p>
              </div>
              <p className="text-xl font-bold text-white">{order.total}</p>
            </div>

            <div className="border-t border-gray-800 pt-4 mb-4">
              <p className="text-gray-300 text-sm mb-2">{order.items}</p>
              {order.trackingNumber !== '-' && (
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Resi: {order.trackingNumber}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              {order.status === 'delivered' && (
                <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold text-sm transition-colors">
                  Beli Lagi
                </button>
              )}
              {order.status === 'shipping' && (
                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold text-sm transition-colors">
                  Lacak Paket
                </button>
              )}
              {order.status === 'processing' && (
                <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold text-sm transition-colors">
                  Batalkan
                </button>
              )}
              <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold text-sm transition-colors">
                Detail
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button className="text-gray-400 hover:text-white transition-colors text-sm font-semibold">
          Muat Lebih Banyak
        </button>
      </div>
    </div>
  );
}
