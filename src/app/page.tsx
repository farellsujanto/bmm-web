import Hero from './components/Hero';

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <Hero
        title="Keunggulan Teknik"
        subtitle="Solusi Lengkap untuk Suku Cadang Premium"
        ctaText="Jelajahi Produk"
        ctaLink="/shop"
      />

      {/* Stats in Bottom Right */}
      {/* <div className="fixed bottom-8 right-8 bg-black/80 backdrop-blur-sm text-white p-6 rounded-lg shadow-2xl border border-gray-800 z-50">
        <div className="space-y-3">
          <div>
            <div className="text-3xl font-bold text-red-500">1,234</div>
            <div className="text-sm text-gray-300">Total Pesanan</div>
          </div>
          <div className="border-t border-gray-700 pt-3">
            <div className="text-3xl font-bold text-red-500">Rp 125M</div>
            <div className="text-sm text-gray-300">Total Transaksi</div>
          </div>
        </div>
      </div> */}
    </div>
  );
}
