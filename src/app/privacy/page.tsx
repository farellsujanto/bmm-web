export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[40vh] bg-gradient-to-r from-black to-gray-900 flex items-center justify-center text-white">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Kebijakan Privasi</h1>
          <p className="text-xl text-gray-200">
            Terakhir diperbarui: 23 November 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            
            {/* Introduction */}
            <div className="mb-12">
              <p className="text-gray-600 leading-relaxed mb-4">
                CV. Bocah Mantul Mabur ("kami", "kita", atau "perusahaan") menghormati privasi Anda 
                dan berkomitmen untuk melindungi data pribadi Anda. Kebijakan Privasi ini menjelaskan 
                bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi Anda.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Dengan menggunakan situs web kami, Anda menyetujui pengumpulan dan penggunaan informasi 
                sesuai dengan kebijakan ini.
              </p>
            </div>

            {/* Section 1 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Informasi yang Kami Kumpulkan</h2>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">1.1 Informasi yang Anda Berikan</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Kami mengumpulkan informasi yang Anda berikan secara langsung, termasuk:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Nama lengkap</li>
                <li>Alamat email</li>
                <li>Nomor telepon</li>
                <li>Alamat pengiriman dan penagihan</li>
                <li>Informasi pembayaran (diproses melalui penyedia pembayaran pihak ketiga)</li>
                <li>Informasi akun (username dan password)</li>
                <li>Riwayat pesanan dan preferensi</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">1.2 Informasi yang Dikumpulkan Otomatis</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Ketika Anda mengunjungi situs web kami, kami secara otomatis mengumpulkan:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Alamat IP</li>
                <li>Jenis browser dan versi</li>
                <li>Sistem operasi</li>
                <li>Halaman yang dikunjungi dan waktu kunjungan</li>
                <li>Sumber rujukan (dari mana Anda datang)</li>
                <li>Data cookie dan teknologi pelacakan serupa</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">1.3 Informasi dari Pihak Ketiga</h3>
              <p className="text-gray-600 leading-relaxed">
                Kami mungkin menerima informasi tentang Anda dari pihak ketiga seperti mitra bisnis, 
                penyedia layanan pembayaran, atau platform media sosial jika Anda memilih untuk menghubungkan 
                akun Anda.
              </p>
            </div>

            {/* Section 2 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Bagaimana Kami Menggunakan Informasi Anda</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Kami menggunakan informasi yang dikumpulkan untuk:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Memproses dan memenuhi pesanan Anda</li>
                <li>Mengelola akun dan memberikan layanan pelanggan</li>
                <li>Berkomunikasi dengan Anda tentang pesanan, produk, dan layanan</li>
                <li>Mengirimkan pembaruan, promosi, dan informasi pemasaran (dengan persetujuan Anda)</li>
                <li>Meningkatkan situs web dan pengalaman pengguna</li>
                <li>Melakukan analisis dan riset pasar</li>
                <li>Mencegah penipuan dan memastikan keamanan</li>
                <li>Mematuhi kewajiban hukum</li>
                <li>Menyelesaikan sengketa</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Dasar Hukum Pemrosesan</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Kami memproses data pribadi Anda berdasarkan:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li><strong>Kontrak:</strong> Untuk memenuhi kewajiban kontraktual kami kepada Anda</li>
                <li><strong>Persetujuan:</strong> Ketika Anda memberikan persetujuan eksplisit</li>
                <li><strong>Kepentingan Sah:</strong> Untuk kepentingan bisnis yang sah</li>
                <li><strong>Kewajiban Hukum:</strong> Untuk mematuhi persyaratan hukum</li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Berbagi Informasi</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Kami tidak menjual atau menyewakan informasi pribadi Anda. Kami dapat berbagi informasi dengan:
              </p>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">4.1 Penyedia Layanan</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Kami bekerja dengan penyedia layanan pihak ketiga yang membantu kami dalam:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Pemrosesan pembayaran</li>
                <li>Pengiriman dan logistik</li>
                <li>Hosting situs web</li>
                <li>Analitik dan pemasaran</li>
                <li>Layanan pelanggan</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">4.2 Kewajiban Hukum</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Kami dapat mengungkapkan informasi Anda jika diwajibkan oleh hukum atau untuk:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Mematuhi proses hukum</li>
                <li>Melindungi hak dan properti kami</li>
                <li>Mencegah penipuan atau aktivitas ilegal</li>
                <li>Melindungi keselamatan pengguna atau publik</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">4.3 Transfer Bisnis</h3>
              <p className="text-gray-600 leading-relaxed">
                Jika terjadi merger, akuisisi, atau penjualan aset, informasi Anda dapat ditransfer 
                ke entitas penerus.
              </p>
            </div>

            {/* Section 5 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Keamanan Data</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Kami menerapkan langkah-langkah keamanan teknis dan organisasi untuk melindungi 
                informasi Anda, termasuk:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Enkripsi SSL/TLS untuk transmisi data</li>
                <li>Penyimpanan data yang aman</li>
                <li>Kontrol akses terbatas</li>
                <li>Pemantauan keamanan reguler</li>
                <li>Pelatihan karyawan tentang privasi data</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                Namun, tidak ada metode transmisi melalui internet yang 100% aman. Kami tidak dapat 
                menjamin keamanan absolut dari informasi Anda.
              </p>
            </div>

            {/* Section 6 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Cookie dan Teknologi Pelacakan</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Kami menggunakan cookie dan teknologi serupa untuk:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Mengingat preferensi dan pengaturan Anda</li>
                <li>Memahami bagaimana Anda menggunakan situs web kami</li>
                <li>Meningkatkan performa situs web</li>
                <li>Menyediakan konten dan iklan yang relevan</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                Anda dapat mengatur browser Anda untuk menolak cookie, namun beberapa fitur situs web 
                mungkin tidak berfungsi dengan baik.
              </p>
            </div>

            {/* Section 7 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Hak Anda</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Anda memiliki hak untuk:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li><strong>Akses:</strong> Meminta salinan data pribadi Anda</li>
                <li><strong>Perbaikan:</strong> Meminta koreksi data yang tidak akurat</li>
                <li><strong>Penghapusan:</strong> Meminta penghapusan data pribadi Anda</li>
                <li><strong>Pembatasan:</strong> Membatasi pemrosesan data Anda</li>
                <li><strong>Portabilitas:</strong> Menerima data Anda dalam format yang dapat dibaca mesin</li>
                <li><strong>Keberatan:</strong> Menolak pemrosesan data untuk tujuan tertentu</li>
                <li><strong>Penarikan Persetujuan:</strong> Menarik persetujuan kapan saja</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                Untuk menggunakan hak-hak ini, silakan hubungi kami melalui detail kontak di bawah.
              </p>
            </div>

            {/* Section 8 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Penyimpanan Data</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Kami menyimpan data pribadi Anda selama:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Diperlukan untuk tujuan yang dikumpulkan</li>
                <li>Diwajibkan oleh hukum atau peraturan</li>
                <li>Diperlukan untuk menyelesaikan sengketa atau menegakkan hak kami</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                Setelah periode penyimpanan, kami akan menghapus atau menganonimkan data Anda dengan aman.
              </p>
            </div>

            {/* Section 9 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">9. Transfer Data Internasional</h2>
              <p className="text-gray-600 leading-relaxed">
                Data Anda dapat ditransfer dan diproses di negara selain Indonesia. Kami memastikan 
                bahwa transfer tersebut dilakukan sesuai dengan hukum perlindungan data yang berlaku 
                dan dengan perlindungan yang memadai.
              </p>
            </div>

            {/* Section 10 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">10. Privasi Anak-anak</h2>
              <p className="text-gray-600 leading-relaxed">
                Layanan kami tidak ditujukan untuk anak-anak di bawah usia 18 tahun. Kami tidak 
                secara sengaja mengumpulkan informasi pribadi dari anak-anak. Jika Anda adalah orang tua 
                atau wali dan mengetahui bahwa anak Anda telah memberikan informasi pribadi kepada kami, 
                silakan hubungi kami.
              </p>
            </div>

            {/* Section 11 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">11. Tautan ke Situs Pihak Ketiga</h2>
              <p className="text-gray-600 leading-relaxed">
                Situs web kami mungkin berisi tautan ke situs web pihak ketiga. Kami tidak bertanggung 
                jawab atas praktik privasi situs tersebut. Kami mendorong Anda untuk membaca kebijakan 
                privasi setiap situs web yang Anda kunjungi.
              </p>
            </div>

            {/* Section 12 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">12. Perubahan Kebijakan Privasi</h2>
              <p className="text-gray-600 leading-relaxed">
                Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Kami akan memberi tahu 
                Anda tentang perubahan dengan memposting kebijakan baru di halaman ini dan memperbarui 
                tanggal "Terakhir diperbarui". Perubahan signifikan akan dikomunikasikan melalui email 
                atau pemberitahuan di situs web.
              </p>
            </div>

            {/* Section 13 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">13. Persetujuan</h2>
              <p className="text-gray-600 leading-relaxed">
                Dengan menggunakan situs web kami, Anda menyetujui Kebijakan Privasi ini dan setuju 
                dengan syarat dan ketentuannya. Jika Anda tidak setuju, harap jangan menggunakan layanan kami.
              </p>
            </div>

            {/* Contact */}
            <div className="mt-16 p-8 bg-gray-50 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Hubungi Kami</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Jika Anda memiliki pertanyaan, kekhawatiran, atau permintaan terkait Kebijakan Privasi 
                ini atau data pribadi Anda, silakan hubungi kami:
              </p>
              <div className="space-y-2 text-gray-600">
                <p><strong>CV. Bocah Mantul Mabur</strong></p>
                <p><strong>Email:</strong> privacy@bocahmantulmabur.com</p>
                <p><strong>Telepon:</strong> +62 XXX XXXX XXXX</p>
                <p><strong>Alamat:</strong> Jakarta, Indonesia</p>
              </div>
              <p className="text-gray-600 leading-relaxed mt-4">
                Kami akan merespons permintaan Anda dalam waktu 30 hari kerja.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
