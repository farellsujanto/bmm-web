import { Metadata } from 'next';
import BrandPageLayout from '../components/BrandPageLayout';

export const metadata: Metadata = {
  title: 'HIKRobot & Hikvision Sistem Vision Industri Indonesia | BMM Parts',
  description: 'Distributor resmi HIKRobot dan Hikvision di Indonesia. Kamera industri, sistem machine vision, barcode reader, 3D vision, sistem inspeksi AI. Otomasi smart factory, solusi quality control, dukungan teknis.',
  keywords: 'hikrobot indonesia, hikvision industrial, kamera hikrobot, machine vision indonesia, kamera industri, hikvision industrial camera, barcode reader, sistem 3d vision, ai inspection, vision system indonesia, smart factory, distributor hikrobot, distributor hikvision jakarta',
  openGraph: {
    title: 'HIKRobot & Hikvision Sistem Vision Industri | BMM Parts',
    description: 'Kamera industri dan sistem machine vision untuk otomasi dan quality control.',
    url: 'https://bmmparts.co.id/brands/hikrobot-hikvision',
  },
};

export default function HIKRobotHikvisionPage() {
  const brandData = {
    hero: {
      title: 'HIKRobot & Hikvision - Sistem Vision Industri Indonesia',
      subtitle: 'Solusi machine vision dan kamera industri canggih untuk smart manufacturing',
    },
    about: {
      title: 'Tentang HIKRobot & Hikvision Industrial',
      paragraphs: [
        'HIKRobot dan Hikvision Industrial adalah penyedia terkemuka solusi machine vision dan otomasi industri. Memanfaatkan teknologi AI dan imaging canggih, mereka menghadirkan sistem vision komprehensif untuk aplikasi quality control, inspeksi, pengukuran, dan identifikasi.',
        'Sebagai distributor resmi di Indonesia, BMM Parts menawarkan solusi vision HIKRobot dan Hikvision yang lengkap dengan dukungan integrasi teknis, pelatihan, dan layanan purna jual lokal.',
      ],
    },
    products: {
      title: 'Produk Sistem Vision',
      categories: [
        {
          title: 'Kamera Industri',
          description: 'Kamera area scan dan line scan resolusi tinggi dengan interface GigE dan USB3',
        },
        {
          title: 'Smart Camera',
          description: 'Sistem vision all-in-one dengan pemrosesan terintegrasi dan I/O',
        },
        {
          title: 'Sistem 3D Vision',
          description: 'Kamera 3D untuk pengukuran dimensi dan inspeksi',
        },
        {
          title: 'Barcode Reader',
          description: 'Industrial code reader untuk barcode 1D/2D dan OCR',
        },
        {
          title: 'Vision Software',
          description: 'MVS development kit dan software inspeksi VisionMaster',
        },
        {
          title: 'Lensa & Aksesoris',
          description: 'Lensa industri, lighting, dan aksesoris mounting',
        },
      ],
    },
    applications: {
      title: 'Aplikasi',
      sections: [
        {
          title: 'Quality Control',
          items: [
            'Deteksi cacat dan inspeksi',
            'Pengukuran dimensi',
            'Verifikasi warna',
            'Inspeksi permukaan',
            'Verifikasi perakitan',
          ],
        },
        {
          title: 'Otomasi & Tracking',
          items: [
            'Robot guidance dan positioning',
            'Pembacaan barcode dan OCR',
            'Package sorting',
            'Sistem traceability',
            'Smart logistics',
          ],
        },
      ],
    },
    cta: {
      title: 'Tingkatkan Quality Control Anda',
      description: 'Temukan bagaimana machine vision dapat mentransformasi proses manufaktur Anda',
      searchQuery: 'hikrobot',
      primaryButtonText: 'Lihat Sistem Vision',
      secondaryButtonText: 'Minta Konsultasi',
      bgColor: 'bg-indigo-600',
      buttonTextColor: 'text-indigo-600',
    },
  };

  return <BrandPageLayout {...brandData} />;
}
