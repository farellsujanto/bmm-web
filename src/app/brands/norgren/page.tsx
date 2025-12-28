import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Norgren Indonesia - Pneumatic Components & Automation | BMM Parts',
  description: 'Official distributor of Norgren pneumatic products in Indonesia. Norgren cylinders, valves, FRLs, air preparation units, and automation components. Genuine products, expert support, fast delivery across Indonesia.',
  keywords: 'norgren indonesia, norgren distributor, norgren pneumatic, norgren cylinder, norgren valve, norgren frl, norgren air filter, norgren regulator, norgren lubricator, norgren solenoid valve, norgren actuator, pneumatic components indonesia, norgren jakarta',
  openGraph: {
    title: 'Norgren Indonesia - Pneumatic Components | BMM Parts',
    description: 'Official distributor of Norgren pneumatic products in Indonesia. Cylinders, valves, FRLs, and automation components.',
    url: 'https://bmm-parts.com/brands/norgren',
  },
};

export default function NorgrenBrandPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Norgren Indonesia - Premium Pneumatic Solutions
          </h1>
          <p className="text-xl text-gray-600">
            Authorized distributor of Norgren pneumatic components and automation products in Indonesia
          </p>
        </div>

        {/* About Norgren */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">About Norgren</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-4">
              Norgren is a world leader in pneumatic and motion control technology, providing innovative solutions 
              for industrial automation. With over 125 years of experience, Norgren delivers high-quality pneumatic 
              components trusted by manufacturers worldwide.
            </p>
            <p className="text-gray-700 mb-4">
              As an authorized Norgren distributor in Indonesia, BMM Parts provides genuine Norgren products with 
              full warranty support, technical assistance, and fast delivery across Indonesia.
            </p>
          </div>
        </section>

        {/* Product Categories */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Norgren Product Range</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Pneumatic Cylinders</h3>
              <p className="text-gray-600">ISO cylinders, compact cylinders, rodless cylinders, and specialty actuators</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Valves</h3>
              <p className="text-gray-600">Solenoid valves, pilot valves, process valves, and proportional valves</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Air Preparation (FRL)</h3>
              <p className="text-gray-600">Filters, regulators, lubricators, and combination units</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Fittings & Tubing</h3>
              <p className="text-gray-600">Push-in fittings, quick couplings, and pneumatic tubing</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Pressure Switches</h3>
              <p className="text-gray-600">Electronic and mechanical pressure switches and sensors</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Motion Control</h3>
              <p className="text-gray-600">Linear slides, guided cylinders, and rotary actuators</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-red-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Norgren Products?</h2>
          <p className="text-xl mb-6">Browse our complete Norgren catalog or contact us for assistance</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              href="/shop?brand=norgren" 
              className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Browse Norgren Products
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
