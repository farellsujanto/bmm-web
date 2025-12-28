import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Continental & Contitech Seal Kits Indonesia | BMM Parts',
  description: 'Premium Continental and Contitech seal kits, O-rings, hydraulic seals, pneumatic seals in Indonesia. Genuine Continental products for industrial and automotive applications. Expert sealing solutions, technical support, fast delivery.',
  keywords: 'continental seal kit, contitech seal, continental o-ring, contitech hydraulic seal, seal kit indonesia, continental distributor indonesia, contitech distributor, hydraulic seal kit, pneumatic seal, mechanical seal, oil seal, continental jakarta, contitech catalog',
  openGraph: {
    title: 'Continental & Contitech Seal Kits Indonesia | BMM Parts',
    description: 'Premium seal kits, O-rings, and hydraulic seals from Continental and Contitech.',
    url: 'https://bmm-parts.com/brands/continental-contitech',
  },
};

export default function ContinentalContitechPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Continental & Contitech Seal Solutions Indonesia
          </h1>
          <p className="text-xl text-gray-600">
            Premium seal kits, O-rings, and sealing solutions for industrial and mobile applications
          </p>
        </div>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">About Continental & Contitech</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-4">
              Continental and Contitech are global leaders in sealing technology, offering comprehensive solutions 
              for hydraulic, pneumatic, and mechanical applications. With decades of engineering expertise, 
              Continental delivers high-performance sealing systems trusted worldwide.
            </p>
            <p className="text-gray-700 mb-4">
              BMM Parts provides genuine Continental and Contitech seal kits in Indonesia, backed by technical 
              expertise, application support, and fast nationwide delivery. We ensure you get the right sealing 
              solution for your specific requirements.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Seal Product Range</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Hydraulic Seal Kits</h3>
              <p className="text-gray-600">Complete seal kits for hydraulic cylinders and systems</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">O-Rings & Gaskets</h3>
              <p className="text-gray-600">Standard and custom O-rings in various materials and sizes</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Pneumatic Seals</h3>
              <p className="text-gray-600">Seals for pneumatic cylinders and air systems</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Rotary Seals</h3>
              <p className="text-gray-600">Oil seals, mechanical seals, and shaft seals</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Wiper Seals</h3>
              <p className="text-gray-600">Contamination protection for hydraulic and pneumatic rods</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Custom Seal Solutions</h3>
              <p className="text-gray-600">Engineered sealing solutions for specialized applications</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Applications</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Industrial Applications</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Manufacturing equipment</li>
                <li>Material handling systems</li>
                <li>Press machines</li>
                <li>Injection molding machines</li>
                <li>Industrial automation</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Mobile Applications</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Construction equipment</li>
                <li>Agricultural machinery</li>
                <li>Mining equipment</li>
                <li>Forestry machines</li>
                <li>Material handling vehicles</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-orange-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Seal Solutions?</h2>
          <p className="text-xl mb-6">Get expert help selecting the right seal kit for your application</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              href="/shop?brand=continental" 
              className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Browse Seal Products
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
            >
              Technical Support
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
