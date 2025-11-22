'use client';

import { useState } from 'react';
import ProductCard from '../components/ProductCard';

const categories = ['All', 'Bearings', 'Hydraulics', 'Pneumatics', 'Power Transmission', 'Seals', 'Lubricants', 'Fasteners', 'Tools'];

const products = [
  { id: '1', name: 'Industrial Ball Bearing', category: 'Bearings', price: 125, image: '/product1.jpg', inStock: true },
  { id: '2', name: 'Hydraulic Pump System', category: 'Hydraulics', price: 850, image: '/product2.jpg', inStock: true },
  { id: '3', name: 'Pneumatic Cylinder', category: 'Pneumatics', price: 320, image: '/product3.jpg', inStock: true },
  { id: '4', name: 'V-Belt Drive System', category: 'Power Transmission', price: 275, image: '/product4.jpg', inStock: true },
  { id: '5', name: 'High-Pressure Seal Kit', category: 'Seals', price: 89, image: '/product5.jpg', inStock: true },
  { id: '6', name: 'Synthetic Lubricant 5L', category: 'Lubricants', price: 145, image: '/product6.jpg', inStock: true },
  { id: '7', name: 'Precision Fastener Set', category: 'Fasteners', price: 65, image: '/product7.jpg', inStock: false },
  { id: '8', name: 'Professional Torque Wrench', category: 'Tools', price: 420, image: '/product8.jpg', inStock: true },
  { id: '9', name: 'Roller Bearing Unit', category: 'Bearings', price: 195, image: '/product9.jpg', inStock: true },
  { id: '10', name: 'Hydraulic Valve', category: 'Hydraulics', price: 380, image: '/product10.jpg', inStock: true },
  { id: '11', name: 'Air Compressor Filter', category: 'Pneumatics', price: 78, image: '/product11.jpg', inStock: true },
  { id: '12', name: 'Chain Drive System', category: 'Power Transmission', price: 490, image: '/product12.jpg', inStock: true },
];

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Our Products</h1>
          <p className="text-xl text-gray-600">
            Discover premium engineering spareparts for all your needs
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search products..."
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
            <p className="text-2xl text-gray-600">No products found</p>
            <p className="text-gray-500 mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
