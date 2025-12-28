import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'SMC Indonesia - Pneumatic & Automation Components | BMM Parts',
  description: 'Authorized SMC distributor in Indonesia. SMC pneumatic cylinders, air valves, FRL units, vacuum equipment, electric actuators. Genuine SMC products with technical support and fast Indonesia-wide delivery.',
  keywords: 'smc indonesia, smc pneumatic, smc distributor indonesia, smc cylinder, smc valve, smc solenoid valve, smc air filter, smc regulator, smc electric actuator, smc vacuum, pneumatic automation indonesia, smc jakarta, smc catalog',
  openGraph: {
    title: 'SMC Indonesia - Pneumatic & Automation Components | BMM Parts',
    description: 'Authorized SMC distributor. Complete range of pneumatic cylinders, valves, and automation components.',
    url: 'https://bmm-parts.com/brands/smc',
  },
};

export default function SMCBrandPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SMC Indonesia - Complete Automation Solutions
          </h1>
          <p className="text-xl text-gray-600">
            Official SMC distributor providing comprehensive pneumatic and electric automation components
          </p>
        </div>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">About SMC</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-4">
              SMC Corporation is the world's largest manufacturer of pneumatic automation components, serving 
              industries worldwide with innovative solutions. With cutting-edge technology and comprehensive 
              product lines, SMC leads the automation industry.
            </p>
            <p className="text-gray-700 mb-4">
              BMM Parts is an authorized SMC distributor in Indonesia, offering genuine SMC products with 
              full manufacturer warranty, technical consultation, and nationwide delivery service.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">SMC Product Categories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Pneumatic Cylinders</h3>
              <p className="text-gray-600">Standard, compact, guided, and specialty pneumatic cylinders</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Directional Control Valves</h3>
              <p className="text-gray-600">Solenoid valves, manifold systems, and valve islands</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Air Preparation Equipment</h3>
              <p className="text-gray-600">Filters, regulators, lubricators, and modular FRL units</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Electric Actuators</h3>
              <p className="text-gray-600">Linear slides, electric grippers, and rotary actuators</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Vacuum Equipment</h3>
              <p className="text-gray-600">Vacuum generators, suction cups, and vacuum pads</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Fittings & Accessories</h3>
              <p className="text-gray-600">One-touch fittings, speed controllers, and silencers</p>
            </div>
          </div>
        </section>

        <section className="bg-blue-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Looking for SMC Products?</h2>
          <p className="text-xl mb-6">Explore our complete SMC catalog or get expert assistance</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              href="/shop?brand=smc" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Browse SMC Products
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
