import { Metadata } from 'next';
import BrandPageLayout from '../components/BrandPageLayout';

export const metadata: Metadata = {
  title: 'Norgren Indonesia - Komponen Pneumatik & Otomasi | BMM Parts',
  description: 'Distributor resmi produk pneumatik Norgren di Indonesia. Silinder Norgren, valve, FRL, unit persiapan udara, dan komponen otomasi. Produk asli, dukungan ahli, pengiriman cepat ke seluruh Indonesia.',
  keywords: 'norgren indonesia, distributor norgren, norgren pneumatic, silinder norgren, valve norgren, norgren frl, norgren air filter, regulator norgren, norgren lubricator, solenoid valve norgren, aktuator norgren, komponen pneumatik indonesia, norgren jakarta',
  openGraph: {
    title: 'Norgren Indonesia - Komponen Pneumatik | BMM Parts',
    description: 'Distributor resmi produk pneumatik Norgren di Indonesia. Silinder, valve, FRL, dan komponen otomasi.',
    url: 'https://bmmparts.co.id/brands/norgren',
  },
};

export default function NorgrenBrandPage() {
  const brandData = {
    hero: {
      title: 'Norgren Indonesia - Solusi Pneumatik Premium',
      subtitle: 'Distributor resmi komponen pneumatik dan produk otomasi Norgren di Indonesia',
    },
    about: {
      title: 'Tentang Norgren',
      paragraphs: [
        'Norgren adalah pemimpin dunia dalam teknologi kontrol pneumatik dan gerak, menyediakan solusi inovatif untuk otomasi industri. Dengan pengalaman lebih dari 125 tahun, Norgren menghadirkan komponen pneumatik berkualitas tinggi yang dipercaya oleh produsen di seluruh dunia.',
        'Sebagai distributor resmi Norgren di Indonesia, BMM Parts menyediakan produk Norgren asli dengan dukungan garansi penuh, bantuan teknis, dan pengiriman cepat ke seluruh Indonesia.',
      ],
    },
    products: {
      title: 'Rangkaian Produk Norgren',
      categories: [
        {
          title: 'Silinder Pneumatik',
          description: 'Silinder ISO, silinder kompak, silinder tanpa batang, dan aktuator khusus',
        },
        {
          title: 'Valve',
          description: 'Solenoid valve, pilot valve, process valve, dan proportional valve',
        },
        {
          title: 'Persiapan Udara (FRL)',
          description: 'Filter, regulator, lubricator, dan unit kombinasi',
        },
        {
          title: 'Fitting & Tubing',
          description: 'Push-in fitting, quick coupling, dan selang pneumatik',
        },
        {
          title: 'Pressure Switch',
          description: 'Pressure switch elektronik dan mekanik serta sensor',
        },
        {
          title: 'Kontrol Gerak',
          description: 'Linear slide, guided cylinder, dan rotary actuator',
        },
      ],
    },
    cta: {
      title: 'Butuh Produk Norgren?',
      description: 'Jelajahi katalog lengkap Norgren kami atau hubungi kami untuk bantuan',
      searchQuery: 'norgren',
      primaryButtonText: 'Lihat Produk Norgren',
      secondaryButtonText: 'Hubungi Kami',
    },
  };

  return <BrandPageLayout {...brandData} />;
}
