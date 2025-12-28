import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Industrial Brands - Norgren, SMC, HIKRobot, Continental, VIBCO | BMM Parts',
  description: 'Authorized distributor of premium industrial brands in Indonesia: Norgren, SMC, HIKRobot, Hikvision, Continental, Contitech, VIBCO, Parker, Festo, Bosch Rexroth. Genuine products, technical support, nationwide delivery.',
  keywords: 'industrial brands indonesia, norgren distributor, smc distributor, hikrobot distributor, continental distributor, contitech, vibco, parker, festo, bosch rexroth, automation brands, pneumatic brands, hydraulic brands, seal kit brands',
  openGraph: {
    title: 'Premium Industrial Brands | BMM Parts Indonesia',
    description: 'Authorized distributor of world-class industrial automation and component brands.',
    url: 'https://bmm-parts.com/brands',
  },
};

export default function BrandsPage() {
  const brands = [
    {
      name: 'Norgren',
      slug: 'norgren',
      category: 'Pneumatic Components',
      description: 'World leader in pneumatic and motion control technology',
      color: 'red',
    },
    {
      name: 'SMC',
      slug: 'smc',
      category: 'Pneumatic & Automation',
      description: 'Global leader in pneumatic automation components',
      color: 'blue',
    },
    {
      name: 'HIKRobot & Hikvision',
      slug: 'hikrobot-hikvision',
      category: 'Machine Vision',
      description: 'Advanced industrial vision and AI inspection systems',
      color: 'indigo',
    },
    {
      name: 'Continental & Contitech',
      slug: 'continental-contitech',
      category: 'Sealing Solutions',
      description: 'Premium seal kits, O-rings, and hydraulic seals',
      color: 'orange',
    },
    {
      name: 'VIBCO',
      slug: 'vibco',
      category: 'Industrial Vibrators',
      description: 'Material flow and vibration solutions',
      color: 'yellow',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Premium Industrial Brands
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            BMM Parts is the authorized distributor of world-leading industrial component manufacturers. 
            We provide genuine products with full warranty, technical support, and fast delivery across Indonesia.
          </p>
        </div>

        {/* Brand Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {brands.map((brand) => (
            <Link 
              key={brand.slug}
              href={`/brands/${brand.slug}`}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-8 border-t-4 border-red-600"
            >
              <div className="mb-4">
                <span className="text-sm font-semibold text-red-600 uppercase tracking-wide">
                  {brand.category}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {brand.name}
              </h2>
              <p className="text-gray-600 mb-4">
                {brand.description}
              </p>
              <div className="text-red-600 font-semibold flex items-center">
                Learn More 
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Why Choose Our Brands */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Why Choose BMM Parts for Your Industrial Needs?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Genuine Products</h3>
              <p className="text-gray-600 text-sm">100% authentic with manufacturer warranty</p>
            </div>
            <div className="text-center">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">Nationwide coverage across Indonesia</p>
            </div>
            <div className="text-center">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Expert Support</h3>
              <p className="text-gray-600 text-sm">Technical assistance and consultation</p>
            </div>
            <div className="text-center">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Competitive Pricing</h3>
              <p className="text-gray-600 text-sm">Best value for premium quality</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Can't Find What You're Looking For?</h2>
          <p className="text-xl mb-8 opacity-90">
            We carry many more brands and can source specialized industrial components
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              href="/shop" 
              className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Browse All Products
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-800 transition"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
