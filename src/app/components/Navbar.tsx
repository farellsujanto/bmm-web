'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-white tracking-wider">
              BMM PARTS
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/shop"
              className="text-white hover:text-red-500 transition-colors duration-300 font-medium"
            >
              Belanja
            </Link>
            <Link
              href="/about"
              className="text-white hover:text-red-500 transition-colors duration-300 font-medium"
            >
              Tentang
            </Link>
            <Link
              href="/contact"
              className="text-white hover:text-red-500 transition-colors duration-300 font-medium"
            >
              Kontak
            </Link>
            
            {isAuthenticated ? (
              <Link
                href="/activity"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full transition-colors duration-300 font-medium"
              >
                Pusat Aktifitas
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full transition-colors duration-300 font-medium"
              >
                Masuk
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 bg-black/95 backdrop-blur-md rounded-lg p-4 -mx-6">
            <Link
              href="/shop"
              className="block text-white hover:text-red-500 transition-colors duration-300 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Belanja
            </Link>
            <Link
              href="/about"
              className="block text-white hover:text-red-500 transition-colors duration-300 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tentang
            </Link>
            <Link
              href="/contact"
              className="block text-white hover:text-red-500 transition-colors duration-300 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Kontak
            </Link>
            {isAuthenticated ? (
              <Link
                href="/activity"
                className="block bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full transition-colors duration-300 font-medium text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pusat Aktifitas
              </Link>
            ) : (
              <Link
                href="/login"
                className="block bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full transition-colors duration-300 font-medium text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Masuk
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
