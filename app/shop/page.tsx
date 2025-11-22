'use client';

import { useState } from 'react';
import ProductCard from '../components/ProductCard';

const categories = ['Semua', 'Bearing', 'Hidrolik', 'Pneumatik', 'Transmisi Daya', 'Seal', 'Pelumas', 'Pengencang', 'Perkakas'];

const products = [
  { id: '1', name: 'Bearing Bola Industrial', category: 'Bearing', price: 125, image: '/product1.jpg', inStock: true },
  { id: '2', name: 'Sistem Pompa Hidrolik', category: 'Hidrolik', price: 850, image: '/product2.jpg', inStock: true },
  { id: '3', name: 'Silinder Pneumatik', category: 'Pneumatik', price: 320, image: '/product3.jpg', inStock: true },
  { id: '4', name: 'Sistem Drive V-Belt', category: 'Transmisi Daya', price: 275, image: '/product4.jpg', inStock: true },
  { id: '5', name: 'Kit Seal Tekanan Tinggi', category: 'Seal', price: 89, image: '/product5.jpg', inStock: true },
  { id: '6', name: 'Pelumas Sintetis 5L', category: 'Pelumas', price: 145, image: '/product6.jpg', inStock: true },
  { id: '7', name: 'Set Pengencang Presisi', category: 'Pengencang', price: 65, image: '/product7.jpg', inStock: false },
  { id: '8', name: 'Kunci Torsi Profesional', category: 'Perkakas', price: 420, image: '/product8.jpg', inStock: true },
  { id: '9', name: 'Unit Bearing Roller', category: 'Bearing', price: 195, image: '/product9.jpg', inStock: true },
  { id: '10', name: 'Katup Hidrolik', category: 'Hidrolik', price: 380, image: '/product10.jpg', inStock: true },
  { id: '11', name: 'Filter Kompresor Udara', category: 'Pneumatik', price: 78, image: '/product11.jpg', inStock: true },
  { id: '12', name: 'Sistem Drive Rantai', category: 'Transmisi Daya', price: 490, image: '/product12.jpg', inStock: true },
];

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Produk Kami</h1>
          <p className="text-xl text-gray-600">
            Temukan suku cadang teknik premium untuk semua kebutuhan Anda
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-2xl mx-auto block px-6 py-4 rounded-full border-2 border-gray-300 focus:border-red-600 focus:outline-none text-lg"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-600">Produk tidak ditemukan</p>
            <p className="text-gray-500 mt-2">Coba sesuaikan filter Anda</p>
          </div>
        )}
      </div>
    </div>
  );
}
