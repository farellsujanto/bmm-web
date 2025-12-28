import { Metadata } from 'next';
import BrandPageLayout from '../components/BrandPageLayout';

export const metadata: Metadata = {
  title: 'VIBCO Vibrator Industri Indonesia | BMM Parts',
  description: 'Vibrator industri premium VIBCO untuk material handling di Indonesia. Electric vibrator, pneumatic vibrator, turbine vibrator untuk hopper, bin, chute, conveyor. Mencegah material bridging dan blockage. Dukungan ahli, produk VIBCO asli.',
  keywords: 'vibco indonesia, vibco vibrator, vibrator industri, pneumatic vibrator, electric vibrator, turbine vibrator, hopper vibrator, bin vibrator, material flow, distributor vibco indonesia, vibrator jakarta, vibrator beton industri',
  openGraph: {
    title: 'VIBCO Vibrator Industri Indonesia | BMM Parts',
    description: 'Vibrator industri premium untuk material handling dan kontrol aliran.',
    url: 'https://bmmparts.co.id/brands/vibco',
  },
};

export default function VIBCOBrandPage() {
  const brandData = {
    hero: {
      title: 'VIBCO Vibrator Industri Indonesia',
      subtitle: 'Solusi vibrasi premium untuk aplikasi aliran material dan handling',
    },
    about: {
      title: 'Tentang VIBCO',
      paragraphs: [
        'VIBCO Vibrators adalah produsen terkemuka vibrator industri, menyediakan solusi inovatif untuk tantangan aliran material dan handling. Dengan pengalaman puluhan tahun, VIBCO menghadirkan peralatan vibrasi yang handal dan dipercaya di berbagai industri di seluruh dunia.',
        'BMM Parts adalah distributor resmi VIBCO di Indonesia, menawarkan vibrator VIBCO asli dengan dukungan application engineering, panduan instalasi, dan layanan purna jual yang komprehensif.',
      ],
    },
    products: {
      title: 'Rangkaian Produk VIBCO',
      categories: [
        {
          title: 'Pneumatic Vibrator',
          description: 'Ball, piston, dan turbine pneumatic vibrator untuk berbagai aplikasi',
        },
        {
          title: 'Electric Vibrator',
          description: 'Rotary electric vibrator dengan force dan frekuensi yang dapat disesuaikan',
        },
        {
          title: 'Turbine Vibrator',
          description: 'High-frequency turbine vibrator untuk material halus',
        },
        {
          title: 'Silent Pneumatic Vibrator',
          description: 'Low-noise vibrator untuk lingkungan yang sensitif terhadap kebisingan',
        },
        {
          title: 'Bin Activator',
          description: 'Vibrator skala besar untuk silo dan penyimpanan curah',
        },
        {
          title: 'Kontrol & Aksesoris',
          description: 'Timer, controller, dan aksesoris mounting',
        },
      ],
    },
    applications: {
      title: 'Aplikasi',
      sections: [
        {
          title: 'Aliran Material',
          items: [
            'Discharge hopper dan bin',
            'Peningkatan aliran chute',
            'Pembersihan conveyor belt',
            'Sistem discharge silo',
            'Vibrasi feeder',
          ],
        },
        {
          title: 'Industri',
          items: [
            'Pemrosesan dan packaging makanan',
            'Kimia dan farmasi',
            'Pertambangan dan agregat',
            'Semen dan beton',
            'Daur ulang dan pengelolaan limbah',
          ],
        },
      ],
    },
    cta: {
      title: 'Selesaikan Masalah Material Flow',
      description: 'Dapatkan bantuan ahli dalam memilih vibrator yang tepat untuk aplikasi Anda',
      searchQuery: 'vibco',
      primaryButtonText: 'Lihat Produk VIBCO',
      secondaryButtonText: 'Application Engineering',
      bgColor: 'bg-yellow-500',
      textColor: 'text-gray-900',
      buttonColor: 'bg-gray-900',
      buttonTextColor: 'text-white',
    },
  };

  return <BrandPageLayout {...brandData} />;
}
