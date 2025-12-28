import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'HIKRobot & Hikvision Industrial Vision Systems Indonesia | BMM Parts',
  description: 'Authorized HIKRobot and Hikvision distributor in Indonesia. Industrial cameras, machine vision systems, barcode readers, 3D vision, AI inspection systems. Smart factory automation, quality control solutions, technical support.',
  keywords: 'hikrobot indonesia, hikvision industrial, hikrobot camera, machine vision indonesia, industrial camera, hikvision industrial camera, barcode reader, 3d vision system, ai inspection, vision system indonesia, smart factory, hikrobot distributor, hikvision distributor jakarta',
  openGraph: {
    title: 'HIKRobot & Hikvision Industrial Vision Systems | BMM Parts',
    description: 'Industrial cameras and machine vision systems for automation and quality control.',
    url: 'https://bmm-parts.com/brands/hikrobot-hikvision',
  },
};

export default function HIKRobotHikvisionPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            HIKRobot & Hikvision Industrial Vision Systems Indonesia
          </h1>
          <p className="text-xl text-gray-600">
            Advanced machine vision and industrial camera solutions for smart manufacturing
          </p>
        </div>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">About HIKRobot & Hikvision Industrial</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-4">
              HIKRobot and Hikvision Industrial are leading providers of machine vision and industrial automation 
              solutions. Leveraging advanced AI and imaging technologies, they deliver comprehensive vision systems 
              for quality control, inspection, measurement, and identification applications.
            </p>
            <p className="text-gray-700 mb-4">
              As an authorized distributor in Indonesia, BMM Parts offers complete HIKRobot and Hikvision industrial 
              vision solutions with technical integration support, training, and local after-sales service.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Vision System Products</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Industrial Cameras</h3>
              <p className="text-gray-600">High-resolution area scan and line scan cameras with GigE and USB3 interfaces</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Smart Cameras</h3>
              <p className="text-gray-600">All-in-one vision systems with integrated processing and I/O</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">3D Vision Systems</h3>
              <p className="text-gray-600">3D cameras for dimensional measurement and inspection</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Barcode Readers</h3>
              <p className="text-gray-600">Industrial code readers for 1D/2D barcodes and OCR</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Vision Software</h3>
              <p className="text-gray-600">MVS development kits and VisionMaster inspection software</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Lenses & Accessories</h3>
              <p className="text-gray-600">Industrial lenses, lighting, and mounting accessories</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Applications</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Quality Control</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Defect detection and inspection</li>
                <li>Dimensional measurement</li>
                <li>Color verification</li>
                <li>Surface inspection</li>
                <li>Assembly verification</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Automation & Tracking</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Robot guidance and positioning</li>
                <li>Barcode and OCR reading</li>
                <li>Package sorting</li>
                <li>Traceability systems</li>
                <li>Smart logistics</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-indigo-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Upgrade Your Quality Control</h2>
          <p className="text-xl mb-6">Discover how machine vision can transform your manufacturing process</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              href="/shop?brand=hikrobot" 
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Browse Vision Systems
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Request Consultation
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
