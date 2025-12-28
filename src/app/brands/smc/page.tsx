import { Metadata } from 'next';
import BrandPageLayout from '../components/BrandPageLayout';

export const metadata: Metadata = {
  title: 'SMC Indonesia - Komponen Pneumatik & Otomasi | BMM Parts',
  description: 'Distributor resmi SMC di Indonesia. Silinder pneumatik SMC, air valve, unit FRL, peralatan vakum, aktuator elektrik. Produk SMC asli dengan dukungan teknis dan pengiriman cepat ke seluruh Indonesia.',
  keywords: 'smc indonesia, smc pneumatic, distributor smc indonesia, silinder smc, valve smc, solenoid valve smc, air filter smc, regulator smc, aktuator elektrik smc, vakum smc, otomasi pneumatik indonesia, smc jakarta, katalog smc',
  openGraph: {
    title: 'SMC Indonesia - Komponen Pneumatik & Otomasi | BMM Parts',
    description: 'Distributor resmi SMC. Rangkaian lengkap silinder pneumatik, valve, dan komponen otomasi.',
    url: 'https://bmmparts.co.id/brands/smc',
  },
};

export default function SMCBrandPage() {
  const brandData = {
    hero: {
      title: 'SMC Indonesia - Solusi Otomasi Lengkap',
      subtitle: 'Distributor resmi SMC menyediakan komponen otomasi pneumatik dan elektrik yang komprehensif',
    },
    about: {
      title: 'Tentang SMC',
      paragraphs: [
        'SMC Corporation adalah produsen terbesar komponen otomasi pneumatik di dunia, melayani industri di seluruh dunia dengan solusi inovatif. Dengan teknologi canggih dan lini produk yang komprehensif, SMC memimpin industri otomasi.',
        'BMM Parts adalah distributor resmi SMC di Indonesia, menawarkan produk SMC asli dengan garansi pabrikan penuh, konsultasi teknis, dan layanan pengiriman ke seluruh Indonesia.',
      ],
    },
    products: {
      title: 'Kategori Produk SMC',
      categories: [
        {
          title: 'Silinder Pneumatik',
          description: 'Silinder standar, kompak, guided, dan silinder pneumatik khusus',
        },
        {
          title: 'Directional Control Valve',
          description: 'Solenoid valve, sistem manifold, dan valve island',
        },
        {
          title: 'Peralatan Persiapan Udara',
          description: 'Filter, regulator, lubricator, dan unit FRL modular',
        },
        {
          title: 'Aktuator Elektrik',
          description: 'Linear slide, electric gripper, dan rotary actuator',
        },
        {
          title: 'Peralatan Vakum',
          description: 'Vacuum generator, suction cup, dan vacuum pad',
        },
        {
          title: 'Fitting & Aksesoris',
          description: 'One-touch fitting, speed controller, dan silencer',
        },
      ],
    },
    cta: {
      title: 'Mencari Produk SMC?',
      description: 'Jelajahi katalog lengkap SMC kami atau dapatkan bantuan ahli',
      searchQuery: 'smc',
      primaryButtonText: 'Lihat Produk SMC',
      secondaryButtonText: 'Hubungi Kami',
      bgColor: 'bg-blue-600',
      buttonTextColor: 'text-blue-600',
    },
  };

  return <BrandPageLayout {...brandData} />;
}
