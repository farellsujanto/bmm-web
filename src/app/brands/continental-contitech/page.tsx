import { Metadata } from 'next';
import BrandPageLayout from '../components/BrandPageLayout';

export const metadata: Metadata = {
  title: 'Continental & Contitech Seal Kit Indonesia | BMM Parts',
  description: 'Seal kit premium Continental dan Contitech, O-ring, seal hidrolik, seal pneumatik di Indonesia. Produk Continental asli untuk aplikasi industri dan otomotif. Solusi sealing ahli, dukungan teknis, pengiriman cepat.',
  keywords: 'continental seal kit, contitech seal, continental o-ring, contitech hydraulic seal, seal kit indonesia, distributor continental indonesia, distributor contitech, hydraulic seal kit, pneumatic seal, mechanical seal, oil seal, continental jakarta, katalog contitech',
  openGraph: {
    title: 'Continental & Contitech Seal Kit Indonesia | BMM Parts',
    description: 'Seal kit premium, O-ring, dan seal hidrolik dari Continental dan Contitech.',
    url: 'https://bmmparts.co.id/brands/continental-contitech',
  },
};

export default function ContinentalContitechPage() {
  const brandData = {
    hero: {
      title: 'Continental & Contitech - Solusi Seal Indonesia',
      subtitle: 'Seal kit premium, O-ring, dan solusi sealing untuk aplikasi industri dan mobile',
    },
    about: {
      title: 'Tentang Continental & Contitech',
      paragraphs: [
        'Continental dan Contitech adalah pemimpin global dalam teknologi sealing, menawarkan solusi komprehensif untuk aplikasi hidrolik, pneumatik, dan mekanik. Dengan pengalaman puluhan tahun di bidang engineering, Continental menghadirkan sistem sealing berkinerja tinggi yang dipercaya di seluruh dunia.',
        'BMM Parts menyediakan seal kit Continental dan Contitech asli di Indonesia, didukung oleh keahlian teknis, dukungan aplikasi, dan pengiriman cepat ke seluruh nusantara. Kami memastikan Anda mendapatkan solusi sealing yang tepat untuk kebutuhan spesifik Anda.',
      ],
    },
    products: {
      title: 'Rangkaian Produk Seal',
      categories: [
        {
          title: 'Seal Kit Hidrolik',
          description: 'Seal kit lengkap untuk silinder hidrolik dan sistem',
        },
        {
          title: 'O-Ring & Gasket',
          description: 'O-ring standar dan custom dalam berbagai material dan ukuran',
        },
        {
          title: 'Seal Pneumatik',
          description: 'Seal untuk silinder pneumatik dan sistem udara',
        },
        {
          title: 'Rotary Seal',
          description: 'Oil seal, mechanical seal, dan shaft seal',
        },
        {
          title: 'Wiper Seal',
          description: 'Perlindungan kontaminasi untuk batang hidrolik dan pneumatik',
        },
        {
          title: 'Solusi Seal Custom',
          description: 'Solusi sealing yang direkayasa untuk aplikasi khusus',
        },
      ],
    },
    applications: {
      title: 'Aplikasi',
      sections: [
        {
          title: 'Aplikasi Industri',
          items: [
            'Peralatan manufaktur',
            'Sistem material handling',
            'Mesin press',
            'Mesin injection molding',
            'Otomasi industri',
          ],
        },
        {
          title: 'Aplikasi Mobile',
          items: [
            'Alat berat konstruksi',
            'Mesin pertanian',
            'Peralatan pertambangan',
            'Mesin kehutanan',
            'Kendaraan material handling',
          ],
        },
      ],
    },
    cta: {
      title: 'Butuh Solusi Seal?',
      description: 'Dapatkan bantuan ahli dalam memilih seal kit yang tepat untuk aplikasi Anda',
      searchQuery: 'continental',
      primaryButtonText: 'Lihat Produk Seal',
      secondaryButtonText: 'Dukungan Teknis',
      bgColor: 'bg-orange-600',
      buttonTextColor: 'text-orange-600',
    },
  };

  return <BrandPageLayout {...brandData} />;
}
