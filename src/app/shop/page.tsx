'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '../components/ProductCard';
import CartSidebar from '../components/CartSidebar';
import { apiRequest } from '@/src/utils/api/apiRequest';
import { Category, Product, ProductImage } from '@/generated/prisma/browser';
import { useAuth } from '@/src/contexts/AuthContext';
import { useAlert } from '@/src/contexts/AlertContext';
import { PrimaryInput } from '@/src/components/ui/Input';
import ShopStructuredData from './components/ShopStructuredData';

type ProductWithRelations = Product & {
  category: Category;
  brand: { name: string };
  images: ProductImage[];
};

const STORAGE_KEY = 'bmm_product_requests';
const PRODUCTS_CACHE_KEY = 'bmm_products_cache';
const CATEGORIES_CACHE_KEY = 'bmm_categories_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

type CacheData<T> = {
  data: T;
  timestamp: number;
};

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { showAlert } = useAlert();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestProducts, setRequestProducts] = useState([{ name: '', description: '', quantity: 1 }]);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  useEffect(() => {
    loadData();
    loadRequestsFromStorage();
  }, []);

  useEffect(() => {
    const searchParam = searchParams.get('search');
    const categoryParam = searchParams.get('category');
    
    if (searchParam) {
      setSearchQuery(searchParam);
      setSelectedCategory('Semua');
    }
    
    if (categoryParam) {
      // Normalize category parameter to match category names
      const normalizeCategory = (str: string) => 
        str.toLowerCase()
          .replace(/\s*\/\s*/g, '-')  // Replace / with surrounding spaces with -
          .replace(/\s+/g, '-')        // Replace spaces with -
          .replace(/-+/g, '-')         // Replace multiple - with single -
          .trim();
      
      const matchedCategory = categories.find(cat => normalizeCategory(cat.name) === normalizeCategory(categoryParam));
      
      if (matchedCategory) {
        setSelectedCategory(matchedCategory.name);
        setSearchQuery('');
      }
    }
  }, [searchParams, categories]);

  const loadRequestsFromStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRequestProducts(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load requests from storage:', error);
    }
  };

  const saveRequestsToStorage = (requests: typeof requestProducts) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    } catch (error) {
      console.error('Failed to save requests to storage:', error);
    }
  };

  const getCachedData = <T,>(key: string): T | null => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheData: CacheData<T> = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > CACHE_DURATION;
      
      // Return cached data even if expired (we'll refresh in background)
      return cacheData.data;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  };

  const setCachedData = <T,>(key: string, data: T) => {
    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  };

  const loadData = async () => {
    try {
      // Load from cache first for instant display
      const cachedProducts = getCachedData<ProductWithRelations[]>(PRODUCTS_CACHE_KEY);
      const cachedCategories = getCachedData<Category[]>(CATEGORIES_CACHE_KEY);

      if (cachedProducts && cachedCategories) {
        setProducts(cachedProducts);
        setCategories(cachedCategories);
        setLoading(false);
      }

      // Fetch fresh data in background
      const [categoriesRes, productsRes] = await Promise.all([
        apiRequest.get<Category[]>('/v1/categories'),
        apiRequest.get<ProductWithRelations[]>('/v1/products'),
      ]);

      // Update state with fresh data
      setCategories(categoriesRes.data);
      setProducts(productsRes.data);

      // Update cache
      setCachedData(CATEGORIES_CACHE_KEY, categoriesRes.data);
      setCachedData(PRODUCTS_CACHE_KEY, productsRes.data);
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
      product.name?.toLowerCase()?.includes(searchLower) ||
      product.description?.toLowerCase()?.includes(searchLower) ||
      product.category.name.toLowerCase()?.includes(searchLower) ||
      product.brand?.name?.toLowerCase()?.includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  const handleAddRequestProduct = () => {
    const updated = [...requestProducts, { name: '', description: '', quantity: 1 }];
    setRequestProducts(updated);
    saveRequestsToStorage(updated);
  };

  const handleRemoveRequestProduct = (index: number) => {
    if (requestProducts.length > 1) {
      const updated = requestProducts.filter((_, i) => i !== index);
      setRequestProducts(updated);
      saveRequestsToStorage(updated);
    }
  };

  const handleRequestProductChange = (index: number, field: 'name' | 'description' | 'quantity', value: string | number) => {
    const updated = [...requestProducts];
    updated[index] = { ...updated[index], [field]: value };
    setRequestProducts(updated);
    saveRequestsToStorage(updated);
  };

  const handleSubmitRequest = async () => {
    // Check if user is logged in
    if (!isAuthenticated) {
      showAlert({ message: 'Silakan login terlebih dahulu untuk mengirim permintaan produk' });
      router.push('/login');
      return;
    }

    const validProducts = requestProducts.filter(p => p.name.trim() !== '');
    if (validProducts.length === 0) {
      showAlert({ message: 'Harap masukkan setidaknya satu nama produk' });
      return;
    }

    setIsSubmittingRequest(true);
    try {
      await apiRequest.post('/v1/item-requests', { products: validProducts });
      showAlert({ message: 'Permintaan produk berhasil dikirim!' });
      setRequestModalOpen(false);
      const resetProducts = [{ name: '', description: '', quantity: 1 }];
      setRequestProducts(resetProducts);
      saveRequestsToStorage(resetProducts);
    } catch (error) {
      console.error('Failed to submit request:', error);
      showAlert({ message: 'Gagal mengirim permintaan. Silakan coba lagi.' });
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
      {/* Structured Data for SEO */}
      <ShopStructuredData products={filteredProducts} />
      
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
        <div className="mb-12 relative -mx-6 md:mx-0">
          {/* Gradient indicators for scroll */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-200 to-transparent z-10 pointer-events-none md:hidden"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-200 to-transparent z-10 pointer-events-none md:hidden"></div>
          
          <div className="flex md:flex-wrap md:justify-center gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide px-6 md:px-0">
            <button
              onClick={() => setSelectedCategory('Semua')}
              className={`px-4 py-2 md:px-6 md:py-3 rounded-full font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0 text-sm md:text-base ${
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
                className={`px-4 py-2 md:px-6 md:py-3 rounded-full font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0 text-sm md:text-base ${
                  selectedCategory === category.name
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
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
              discount={product.discount ? Number(product.discount) : undefined}
              affiliatePercent={product.affiliatePercent ? Number(product.affiliatePercent) : undefined}
              isPreOrder={product.isPreOrder || false}
            />
          ))}
          
          {/* Request Item Card */}
          {filteredProducts.length > 0 && (
            <button
              onClick={() => setRequestModalOpen(true)}
              className="group relative bg-gradient-to-br from-red-600 to-red-700 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-4 sm:p-6 flex flex-col items-center justify-center text-white min-h-[280px] sm:min-h-[320px]"
            >
              <div className="text-center">
                <svg 
                  className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 transform group-hover:scale-110 transition-transform duration-300" 
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
                <h3 className="text-sm sm:text-lg font-bold mb-1.5 sm:mb-2">Tidak Menemukan Produk?</h3>
                <p className="text-red-100 mb-2 sm:mb-3 text-xs">
                  Ajukan permintaan produk yang Anda butuhkan
                </p>
                <span className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-red-600 rounded-full text-xs sm:text-sm font-semibold group-hover:bg-red-50 transition-colors duration-300">
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

      {/* Cart Sidebar */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(!cartOpen)} />

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

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Memuat produk...</p>
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
