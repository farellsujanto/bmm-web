import Hero from './components/Hero';
import FeatureCard from './components/FeatureCard';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <Hero
        title="Engineering Excellence"
        subtitle="Your One-Stop Solution for Premium Spareparts"
        ctaText="Explore Products"
        ctaLink="/shop"
      />

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
            Why Choose Us
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Experience unmatched quality and service in engineering solutions
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Premium Quality"
              description="All our spareparts meet the highest industry standards, ensuring reliability and longevity for your engineering needs."
            />
            <FeatureCard
              icon={
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              title="Fast Delivery"
              description="Swift and secure shipping to ensure your projects stay on schedule. We prioritize your time."
            />
            <FeatureCard
              icon={
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
              title="Expert Support"
              description="Our technical team is always ready to assist you with product selection and technical specifications."
            />
          </div>
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="py-20 px-6 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Product Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Bearings', icon: '⚙️' },
              { name: 'Hydraulics', icon: '💧' },
              { name: 'Pneumatics', icon: '🔧' },
              { name: 'Power Transmission', icon: '⚡' },
              { name: 'Seals & Gaskets', icon: '🔩' },
              { name: 'Lubricants', icon: '🛢️' },
              { name: 'Fasteners', icon: '🔗' },
              { name: 'Tools', icon: '🛠️' },
            ].map((category) => (
              <Link
                key={category.name}
                href="/shop"
                className="bg-gray-900 hover:bg-red-600 p-8 rounded-lg text-center transition-all duration-300 transform hover:scale-105 group"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Browse our extensive catalog of premium engineering spareparts
          </p>
          <Link
            href="/shop"
            className="inline-block bg-white text-red-600 px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-red-600 mb-2">500+</div>
              <div className="text-gray-600">Products</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-red-600 mb-2">1000+</div>
              <div className="text-gray-600">Happy Clients</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-red-600 mb-2">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-red-600 mb-2">15+</div>
              <div className="text-gray-600">Years Experience</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
