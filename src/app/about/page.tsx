import FeatureCard from '../components/FeatureCard';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] bg-gradient-to-r from-black to-gray-900 flex items-center justify-center text-white">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Tentang Kami</h1>
          <p className="text-xl md:text-2xl text-gray-200">
            Memimpin industri suku cadang teknik sejak 2025
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Misi Kami</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Di BMM Parts, kami berkomitmen untuk menyediakan suku cadang teknik 
            berkualitas tinggi dan layanan luar biasa kepada pelanggan kami. Misi kami adalah 
            menjadi solusi lengkap terpercaya Anda untuk semua kebutuhan teknik, menghadirkan 
            keandalan, inovasi, dan keunggulan dalam setiap produk yang kami tawarkan.
          </p>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Nilai-Nilai Kami</h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Prinsip yang memandu semua yang kami lakukan
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Kualitas</h3>
              <p className="text-gray-600">
                Kami tidak pernah berkompromi pada kualitas produk dan layanan kami
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Keandalan</h3>
              <p className="text-gray-600">
                Andalkan kami untuk layanan yang konsisten dan terpercaya setiap saat
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Inovasi</h3>
              <p className="text-gray-600">
                Selalu mencari solusi yang lebih baik untuk kebutuhan pelanggan kami
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Kemitraan</h3>
              <p className="text-gray-600">
                Membangun hubungan jangka panjang dengan klien kami
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Kisah Kami</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Didirikan pada tahun 2025, BMM Parts telah berkembang dari pemasok lokal kecil 
                  menjadi nama terpercaya di industri suku cadang teknik. Perjalanan kami dimulai dengan 
                  visi sederhana: menyediakan komponen berkualitas tinggi dan andal kepada produsen 
                  dan insinyur di seluruh Indonesia.
                </p>
                <p>
                  Selama bertahun-tahun, kami telah membangun kemitraan yang kuat dengan produsen terkemuka di seluruh dunia, 
                  memastikan bahwa pelanggan kami memiliki akses ke produk terbaik yang tersedia. Komitmen kami 
                  terhadap keunggulan telah memberi kami kepercayaan dari lebih dari 1.000 klien yang puas.
                </p>
                <p>
                  Saat ini, kami terus memperluas rangkaian produk dan layanan kami, selalu mengikuti 
                  tren industri dan kemajuan teknologi. Tim profesional berpengalaman kami 
                  berdedikasi untuk memberikan panduan ahli dan dukungan untuk membantu Anda menemukan 
                  solusi sempurna untuk tantangan teknik Anda.
                </p>
              </div>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden shadow-2xl">
              <div 
                className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-600"
                style={{
                  backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"%3E%3Crect fill="%23374151" width="600" height="400"/%3E%3Ctext x="50%25" y="50%25" font-size="24" fill="%23ffffff" text-anchor="middle" dy=".3em"%3EBMM PARTS%3C/text%3E%3C/svg%3E')`
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team/Certifications */}
      <section className="py-20 px-6 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Keunggulan Bersertifikat</h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
            Komitmen kami terhadap kualitas didukung oleh sertifikasi yang diakui industri
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-6xl font-bold text-red-600 mb-2">ISO 9001</div>
              <div className="text-gray-400">Manajemen Kualitas</div>
            </div>
            <div>
              <div className="text-6xl font-bold text-red-600 mb-2">ISO 14001</div>
              <div className="text-gray-400">Lingkungan</div>
            </div>
            <div>
              <div className="text-6xl font-bold text-red-600 mb-2">OHSAS</div>
              <div className="text-gray-400">Kesehatan & Keselamatan</div>
            </div>
            <div>
              <div className="text-6xl font-bold text-red-600 mb-2">CE</div>
              <div className="text-gray-400">Standar Eropa</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
