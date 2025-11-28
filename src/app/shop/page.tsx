'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ProductCard from '../components/ProductCard';
import { apiRequest } from '@/src/utils/api/apiRequest';
import { Category, Product, ProductImage } from '@/generated/prisma/browser';
import { useCart } from '@/src/contexts/CartContext';
import { PrimaryInput } from '@/src/components/ui/Input';

type ProductWithRelations = Product & {
  category: Category;
  brand: { name: string };
  images: ProductImage[];
};

export default function ShopPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestProducts, setRequestProducts] = useState([{ name: '', description: '', quantity: 1 }]);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice, clearCart } = useCart();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        apiRequest.get<Category[]>('/v1/categories'),
        apiRequest.get<ProductWithRelations[]>('/v1/products'),
      ]);

      setCategories(categoriesRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'Semua' || product.category.name === selectedCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower) ||
      product.category.name.toLowerCase().includes(searchLower) ||
      product.brand.name.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  const handleAddRequestProduct = () => {
    setRequestProducts([...requestProducts, { name: '', description: '', quantity: 1 }]);
  };

  const handleRemoveRequestProduct = (index: number) => {
    if (requestProducts.length > 1) {
      setRequestProducts(requestProducts.filter((_, i) => i !== index));
    }
  };

  const handleRequestProductChange = (index: number, field: 'name' | 'description' | 'quantity', value: string | number) => {
    const updated = [...requestProducts];
    updated[index] = { ...updated[index], [field]: value };
    setRequestProducts(updated);
  };

  const handleSubmitRequest = async () => {
    const validProducts = requestProducts.filter(p => p.name.trim() !== '');
    if (validProducts.length === 0) {
      alert('Harap masukkan setidaknya satu nama produk');
      return;
    }

    setIsSubmittingRequest(true);
    try {
      await apiRequest.post('/v1/item-requests', { products: validProducts });
      alert('Permintaan produk berhasil dikirim!');
      setRequestModalOpen(false);
      setRequestProducts([{ name: '', description: '', quantity: 1 }]);
    } catch (error) {
      console.error('Failed to submit request:', error);
      alert('Gagal mengirim permintaan. Silakan coba lagi.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Memuat produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Black overlay for navbar */}
      <div className="fixed top-0 left-0 right-0 h-20 bg-black z-40"></div>
      
      <div className="relative pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Produk Kami</h1>
          <p className="text-xl text-gray-600">
            Temukan suku cadang teknik premium untuk semua kebutuhan Anda
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto relative">
          <PrimaryInput
            type="text"
            placeholder="Cari produk, kategori, merek, deskripsi..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value !== '') {
                setSelectedCategory('Semua');
              }
            }}
            className="rounded-full px-6 py-4 text-lg pr-12"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Hapus pencarian"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setSelectedCategory('Semua')}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              selectedCategory === 'Semua'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Semua
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                selectedCategory === category.name
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              id={product.id}
              name={product.name}
              slug={product.slug}
              category={product.category.name}
              price={Number(product.price) || 0}
              image={product.images[0]?.url || ''}
              brand={product.brand.name}
              preOrderReadyEarliest={product.preOrderReadyEarliest || undefined}
              preOrderReadyLatest={product.preOrderReadyLatest || undefined}
            />
          ))}
          
          {/* Request Item Card */}
          {filteredProducts.length > 0 && (
            <button
              onClick={() => setRequestModalOpen(true)}
              className="group relative bg-gradient-to-br from-red-600 to-red-700 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 flex flex-col items-center justify-center text-white min-h-[400px]"
            >
              <div className="text-center">
                <svg 
                  className="w-20 h-20 mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 4v16m8-8H4" 
                  />
                </svg>
                <h3 className="text-2xl font-bold mb-3">Tidak Menemukan Produk?</h3>
                <p className="text-red-100 mb-4 text-sm">
                  Ajukan permintaan produk yang Anda butuhkan
                </p>
                <span className="inline-block px-6 py-3 bg-white text-red-600 rounded-full font-semibold group-hover:bg-red-50 transition-colors duration-300">
                  Klik untuk Ajukan
                </span>
              </div>
            </button>
          )}
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-2xl text-gray-600 mb-2">Produk tidak ditemukan</p>
            <p className="text-gray-500 mb-6">Tidak menemukan produk yang Anda cari?</p>
            <button
              onClick={() => setRequestModalOpen(true)}
              className="px-8 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Ajukan Permintaan Produk
            </button>
          </div>
        )}
      </div>
      </div>

      {/* Cart FAB */}
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-8 right-8 bg-red-600 text-white p-4 rounded-full shadow-2xl hover:bg-red-700 transition-all duration-300 z-40 hover:scale-110"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {/* Cart Sidebar */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          cartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setCartOpen(false)}
      >
        <div
          className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ${
            cartOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Keranjang Belanja</h2>
              <button
                onClick={() => setCartOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-xl text-gray-600 mb-2">Keranjang kosong</p>
                  <p className="text-gray-500">Tambahkan produk untuk memulai belanja</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 bg-gray-50 p-4 rounded-lg">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0 relative">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover rounded-lg"
                            sizes="80px"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                        {item.brand && (
                          <p className="text-xs text-gray-500">{item.brand}</p>
                        )}
                        <p className="text-red-600 font-bold">Rp {item.price.toLocaleString('id-ID')}</p>
                        {item.preOrderReadyEarliest && item.preOrderReadyLatest && (
                          <p className="text-xs text-yellow-600 font-medium mt-1">
                            Pre-Order: {item.preOrderReadyEarliest}-{item.preOrderReadyLatest} minggu
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center transition-colors"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-semibold text-gray-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-6 bg-gray-50">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Total Item:</span>
                    <span className="font-semibold">{totalItems}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total:</span>
                    <span className="text-red-600">Rp {totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <button className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors mb-2">
                  Checkout
                </button>
                <button
                  onClick={clearCart}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Kosongkan Keranjang
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Request Modal */}
      {requestModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setRequestModalOpen(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Ajukan Permintaan Produk</h2>
                <button
                  onClick={() => setRequestModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mt-2">Beritahu kami produk yang Anda butuhkan dan kami akan mencarikannya untuk Anda</p>
            </div>

            <div className="p-6 space-y-6">
              {requestProducts.map((product, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Produk #{index + 1}</h3>
                    {requestProducts.length > 1 && (
                      <button
                        onClick={() => handleRemoveRequestProduct(index)}
                        className="text-red-600 hover:text-red-700 transition-colors text-sm font-medium"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <PrimaryInput
                      label="Nama Produk *"
                      placeholder="Contoh: Bearing SKF 6205"
                      value={product.name}
                      onChange={(e) => handleRequestProductChange(index, 'name', e.target.value)}
                      required
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Deskripsi (Opsional)
                      </label>
                      <textarea
                        placeholder="Tambahkan detail seperti spesifikasi, ukuran, atau kebutuhan khusus..."
                        value={product.description}
                        onChange={(e) => handleRequestProductChange(index, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-600 focus:outline-none transition text-gray-900 placeholder:text-gray-500"
                      />
                    </div>

                    <PrimaryInput
                      label="Kuantitas"
                      type="number"
                      min="1"
                      value={product.quantity}
                      onChange={(e) => handleRequestProductChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddRequestProduct}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-red-600 hover:text-red-600 transition-colors font-medium"
              >
                + Tambah Produk Lain
              </button>
            </div>

            <div className="p-6 border-t bg-gray-50 flex gap-3">
              <button
                onClick={() => setRequestModalOpen(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={isSubmittingRequest}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmittingRequest ? 'Mengirim...' : 'Kirim Permintaan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
