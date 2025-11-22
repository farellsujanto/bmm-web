import FeatureCard from '../components/FeatureCard';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] bg-gradient-to-r from-black to-gray-900 flex items-center justify-center text-white">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">About Us</h1>
          <p className="text-xl md:text-2xl text-gray-200">
            Leading the industry in engineering spareparts since 2008
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            At CV. Bocah Mantul Mabur, we are committed to providing the highest quality 
            engineering spareparts and exceptional service to our customers. Our mission is 
            to be your trusted one-stop solution for all engineering needs, delivering 
            reliability, innovation, and excellence in every product we offer.
          </p>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Our Values</h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            The principles that guide everything we do
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quality</h3>
              <p className="text-gray-600">
                We never compromise on the quality of our products and services
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Reliability</h3>
              <p className="text-gray-600">
                Count on us for consistent, dependable service every time
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600">
                Always seeking better solutions for our customers' needs
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Partnership</h3>
              <p className="text-gray-600">
                Building long-term relationships with our clients
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Founded in 2008, CV. Bocah Mantul Mabur has grown from a small local supplier 
                  to a trusted name in the engineering spareparts industry. Our journey began with 
                  a simple vision: to provide high-quality, reliable components to manufacturers 
                  and engineers across Indonesia.
                </p>
                <p>
                  Over the years, we've built strong partnerships with leading manufacturers worldwide, 
                  ensuring that our customers have access to the best products available. Our commitment 
                  to excellence has earned us the trust of over 1,000 satisfied clients.
                </p>
                <p>
                  Today, we continue to expand our product range and services, always staying ahead 
                  of industry trends and technological advancements. Our team of experienced professionals 
                  is dedicated to providing expert guidance and support to help you find the perfect 
                  solutions for your engineering challenges.
                </p>
              </div>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden shadow-2xl">
              <div 
                className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-600"
                style={{
                  backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"%3E%3Crect fill="%23374151" width="600" height="400"/%3E%3Ctext x="50%25" y="50%25" font-size="24" fill="%23ffffff" text-anchor="middle" dy=".3em"%3ECV. BOCAH MANTUL MABUR%3C/text%3E%3C/svg%3E')`
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team/Certifications */}
      <section className="py-20 px-6 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Certified Excellence</h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
            Our commitment to quality is backed by industry-recognized certifications
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-6xl font-bold text-red-600 mb-2">ISO 9001</div>
              <div className="text-gray-400">Quality Management</div>
            </div>
            <div>
              <div className="text-6xl font-bold text-red-600 mb-2">ISO 14001</div>
              <div className="text-gray-400">Environmental</div>
            </div>
            <div>
              <div className="text-6xl font-bold text-red-600 mb-2">OHSAS</div>
              <div className="text-gray-400">Health & Safety</div>
            </div>
            <div>
              <div className="text-6xl font-bold text-red-600 mb-2">CE</div>
              <div className="text-gray-400">European Standards</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
