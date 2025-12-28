import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'VIBCO Industrial Vibrators Indonesia | BMM Parts',
  description: 'Premium VIBCO industrial vibrators for material handling in Indonesia. Electric vibrators, pneumatic vibrators, turbine vibrators for hoppers, bins, chutes, conveyors. Prevent material bridging and blockages. Expert support, genuine VIBCO products.',
  keywords: 'vibco indonesia, vibco vibrator, industrial vibrator, pneumatic vibrator, electric vibrator, turbine vibrator, hopper vibrator, bin vibrator, material flow, vibco distributor indonesia, vibrator jakarta, concrete vibrator industrial',
  openGraph: {
    title: 'VIBCO Industrial Vibrators Indonesia | BMM Parts',
    description: 'Premium industrial vibrators for material handling and flow control.',
    url: 'https://bmm-parts.com/brands/vibco',
  },
};

export default function VIBCOBrandPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            VIBCO Industrial Vibrators Indonesia
          </h1>
          <p className="text-xl text-gray-600">
            Premium vibration solutions for material flow and handling applications
          </p>
        </div>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">About VIBCO</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-4">
              VIBCO Vibrators is a leading manufacturer of industrial vibrators, providing innovative solutions 
              for material flow and handling challenges. With decades of experience, VIBCO delivers reliable 
              vibration equipment trusted across industries worldwide.
            </p>
            <p className="text-gray-700 mb-4">
              BMM Parts is an authorized VIBCO distributor in Indonesia, offering genuine VIBCO vibrators with 
              application engineering support, installation guidance, and comprehensive after-sales service.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">VIBCO Product Range</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Pneumatic Vibrators</h3>
              <p className="text-gray-600">Ball, piston, and turbine pneumatic vibrators for various applications</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Electric Vibrators</h3>
              <p className="text-gray-600">Rotary electric vibrators with adjustable force and frequency</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Turbine Vibrators</h3>
              <p className="text-gray-600">High-frequency turbine vibrators for fine materials</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Silent Pneumatic Vibrators</h3>
              <p className="text-gray-600">Low-noise vibrators for noise-sensitive environments</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Bin Activators</h3>
              <p className="text-gray-600">Large-scale vibrators for silos and bulk storage</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Controls & Accessories</h3>
              <p className="text-gray-600">Timers, controllers, and mounting accessories</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Applications</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Material Flow</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Hopper and bin discharge</li>
                <li>Chute flow enhancement</li>
                <li>Conveyor belt cleaning</li>
                <li>Silo discharge systems</li>
                <li>Feeder vibration</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Industries</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Food processing and packaging</li>
                <li>Chemical and pharmaceutical</li>
                <li>Mining and aggregates</li>
                <li>Cement and concrete</li>
                <li>Recycling and waste management</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-yellow-500 text-gray-900 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Solve Material Flow Problems</h2>
          <p className="text-xl mb-6">Get expert help selecting the right vibrator for your application</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              href="/shop?brand=vibco" 
              className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Browse VIBCO Products
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-gray-900 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition"
            >
              Application Engineering
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
