export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[40vh] bg-gradient-to-r from-black to-gray-900 flex items-center justify-center text-white">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Syarat dan Ketentuan</h1>
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
              <p className="text-gray-600 leading-relaxed">
                Selamat datang di BMM Parts. Dengan mengakses dan menggunakan situs web ini, 
                Anda menyetujui untuk terikat oleh syarat dan ketentuan berikut. Harap baca dengan saksama 
                sebelum menggunakan layanan kami.
              </p>
            </div>

            {/* Section 1 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Penerimaan Syarat</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Dengan mengakses situs web BMM Parts, Anda menyetujui untuk mematuhi 
                syarat dan ketentuan penggunaan ini. Jika Anda tidak setuju dengan salah satu bagian 
                dari syarat ini, Anda tidak diperkenankan untuk menggunakan situs web kami.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Kami berhak untuk mengubah, memodifikasi, menambah, atau menghapus bagian dari syarat 
                dan ketentuan ini kapan saja. Perubahan akan berlaku segera setelah diposting di situs web.
              </p>
            </div>

            {/* Section 2 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Penggunaan Layanan</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Anda setuju untuk menggunakan layanan kami hanya untuk tujuan yang sah dan sesuai dengan 
                hukum yang berlaku. Anda tidak diperkenankan untuk:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Menggunakan situs web untuk tujuan ilegal atau melanggar hukum</li>
                <li>Mengganggu atau merusak keamanan situs web</li>
                <li>Menggunakan robot, spider, atau perangkat otomatis lainnya</li>
                <li>Mencoba mendapatkan akses tidak sah ke sistem kami</li>
                <li>Mengunggah konten yang berbahaya atau melanggar hukum</li>
                <li>Menyalahgunakan informasi produk atau harga</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Akun Pengguna</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Untuk mengakses beberapa fitur layanan kami, Anda mungkin perlu membuat akun. 
                Anda bertanggung jawab untuk:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Menjaga kerahasiaan informasi akun Anda</li>
                <li>Semua aktivitas yang terjadi di bawah akun Anda</li>
                <li>Memberikan informasi yang akurat dan terkini</li>
                <li>Segera memberi tahu kami tentang penggunaan tidak sah</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                Kami berhak untuk menangguhkan atau menghentikan akun Anda jika kami mencurigai 
                adanya pelanggaran terhadap syarat dan ketentuan ini.
              </p>
            </div>

            {/* Section 4 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Produk dan Harga</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Kami berusaha untuk menyediakan informasi produk yang akurat. Namun:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Harga dapat berubah tanpa pemberitahuan sebelumnya</li>
                <li>Ketersediaan produk tidak dijamin sampai pemesanan dikonfirmasi</li>
                <li>Spesifikasi produk dapat berubah sesuai dengan pabrikan</li>
                <li>Gambar produk bersifat ilustratif dan dapat berbeda dengan produk aktual</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                Kami berhak untuk membatasi jumlah pembelian produk tertentu dan menolak 
                pesanan yang mencurigakan.
              </p>
            </div>

            {/* Section 5 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Pembayaran</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Pembayaran dapat dilakukan melalui metode yang tersedia di situs web kami. 
                Dengan melakukan pembayaran, Anda menjamin bahwa:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Anda memiliki hak legal untuk menggunakan metode pembayaran</li>
                <li>Informasi pembayaran yang diberikan adalah akurat</li>
                <li>Dana yang cukup tersedia untuk menyelesaikan transaksi</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                Semua pembayaran diproses dengan aman melalui penyedia layanan pembayaran pihak ketiga yang terpercaya.
              </p>
            </div>

            {/* Section 6 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Pengiriman</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Kami akan berusaha sebaik mungkin untuk mengirimkan produk tepat waktu. Namun:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Waktu pengiriman yang ditampilkan adalah estimasi</li>
                <li>Keterlambatan dapat terjadi karena faktor di luar kendali kami</li>
                <li>Risiko kehilangan atau kerusakan berpindah ke pembeli setelah pengiriman</li>
                <li>Biaya pengiriman akan ditampilkan sebelum checkout</li>
              </ul>
            </div>

            {/* Section 7 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Pengembalian dan Penukaran</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Kebijakan pengembalian kami meliputi:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Produk dapat dikembalikan dalam waktu 7 hari setelah penerimaan</li>
                <li>Produk harus dalam kondisi asli dan tidak digunakan</li>
                <li>Bukti pembelian harus disertakan</li>
                <li>Biaya pengiriman pengembalian ditanggung pembeli kecuali produk cacat</li>
                <li>Pengembalian dana akan diproses dalam 14 hari kerja</li>
              </ul>
            </div>

            {/* Section 8 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Garansi dan Jaminan</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Produk yang kami jual dilindungi oleh garansi pabrikan jika berlaku. Namun:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Garansi terbatas pada cacat manufaktur</li>
                <li>Garansi tidak mencakup kerusakan akibat penyalahgunaan</li>
                <li>Syarat dan ketentuan garansi pabrikan berlaku</li>
                <li>Kami tidak bertanggung jawab atas kerusakan tidak langsung</li>
              </ul>
            </div>

            {/* Section 9 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">9. Hak Kekayaan Intelektual</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Semua konten di situs web ini, termasuk teks, grafik, logo, gambar, dan perangkat lunak, 
                adalah milik BMM Parts atau pemberi lisensinya dan dilindungi oleh hukum 
                hak cipta Indonesia dan internasional.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Anda tidak diperkenankan untuk mereproduksi, mendistribusikan, atau membuat karya turunan 
                dari konten kami tanpa izin tertulis terlebih dahulu.
              </p>
            </div>

            {/* Section 10 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">10. Batasan Tanggung Jawab</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                BMM Parts tidak bertanggung jawab atas:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Kerugian tidak langsung atau konsekuensial</li>
                <li>Kehilangan data atau keuntungan</li>
                <li>Gangguan bisnis</li>
                <li>Kesalahan atau kelalaian dalam konten</li>
                <li>Kerusakan yang timbul dari penggunaan atau ketidakmampuan menggunakan layanan</li>
              </ul>
            </div>

            {/* Section 11 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">11. Tautan Pihak Ketiga</h2>
              <p className="text-gray-600 leading-relaxed">
                Situs web kami mungkin berisi tautan ke situs web pihak ketiga. Kami tidak bertanggung 
                jawab atas konten atau praktik privasi situs web tersebut. Penggunaan situs web pihak 
                ketiga sepenuhnya merupakan risiko Anda sendiri.
              </p>
            </div>

            {/* Section 12 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">12. Hukum yang Berlaku</h2>
              <p className="text-gray-600 leading-relaxed">
                Syarat dan ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia. 
                Setiap sengketa yang timbul akan diselesaikan di pengadilan yang berwenang di Jakarta, Indonesia.
              </p>
            </div>

            {/* Section 13 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">13. Penyelesaian Sengketa</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Jika terjadi sengketa, kami mendorong penyelesaian secara damai melalui:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Negosiasi langsung antara para pihak</li>
                <li>Mediasi oleh pihak ketiga yang netral</li>
                <li>Arbitrase jika mediasi tidak berhasil</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                Untuk kasus tertentu yang memerlukan penanganan khusus:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Permintaan pengembalian dana DP dapat ditolak tergantung pada kondisi tertentu</li>
                <li>Permintaan pengembalian dana setelah pelunasan dapat ditolak</li>
                <li>Penghapusan akun memerlukan persetujuan dan verifikasi</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                Untuk resolusi kasus di atas, silakan hubungi tim dukungan kami di support@bmmparts.co.id
              </p>
            </div>

            {/* Section 14 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">14. Program Referral</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                BMM Parts menyediakan program referral bagi pengguna yang ingin merekomendasikan 
                layanan kami kepada orang lain. Ketentuan program referral:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Komisi referral akan diberikan sesuai dengan persentase yang telah ditentukan</li>
                <li>Komisi referral yang diterima akan dipotong pajak sesuai dengan ketentuan PPh (Pajak Penghasilan) yang berlaku</li>
                <li>Pemotongan pajak mengikuti peraturan perpajakan Republik Indonesia</li>
                <li>Bukti pemotongan pajak akan diberikan sesuai dengan ketentuan yang berlaku</li>
                <li>Pengguna bertanggung jawab atas kewajiban perpajakan yang timbul dari komisi referral</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                BMM Parts berhak untuk mengubah ketentuan program referral termasuk persentase komisi 
                dan mekanisme pembayaran sesuai dengan kebijakan perusahaan dan peraturan yang berlaku.
              </p>
            </div>

            {/* Section 15 */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">15. Pemisahan</h2>
              <p className="text-gray-600 leading-relaxed">
                Jika ada ketentuan dalam syarat dan ketentuan ini yang dianggap tidak sah atau tidak dapat 
                dilaksanakan, ketentuan tersebut akan dihapus dan sisanya akan tetap berlaku.
              </p>
            </div>

            {/* Contact */}
            <div className="mt-16 p-8 bg-gray-50 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Hubungi Kami</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami:
              </p>
              <div className="space-y-2 text-gray-600">
                <p><strong>Email:</strong> support@bmmparts.co.id</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
