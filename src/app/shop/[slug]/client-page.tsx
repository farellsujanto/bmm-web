'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
// Use native <img> to avoid Next.js image optimization limits
import Link from 'next/link';
import { apiRequest } from '@/src/utils/api/apiRequest';
import { Product, ProductImage, Category, Brand } from '@/generated/prisma/browser';
import { useCart } from '@/src/contexts/CartContext';
import CartSidebar from '@/src/app/components/CartSidebar';
import ProductStructuredData from './components/ProductStructuredData';
import { trackProductViewed } from '@/src/utils/analytics/posthog.util';

type ProductWithRelations = Product & {
  category: Category;
  brand: Brand;
  images: ProductImage[];
};

type Props = {
  initialProduct: ProductWithRelations | null;
};

const PRODUCT_CACHE_PREFIX = 'bmm_product_detail_';
const RELATED_CACHE_PREFIX = 'bmm_related_products_';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

type CacheData<T> = {
  data: T;
  timestamp: number;
};

export default function ProductDetailPage({ initialProduct }: Props) {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [product, setProduct] = useState<ProductWithRelations | null>(initialProduct);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<ProductWithRelations[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  
  const { addToCart, items, removeFromCart, updateQuantity, totalItems, totalPrice, clearCart } = useCart();

  useEffect(() => {
    loadProductData();
    
    // Track product view
    if (initialProduct) {
      trackProductViewed({
        id: initialProduct.id.toString(),
        name: initialProduct.name,
        price: Number(initialProduct.price),
        category: initialProduct.category.name,
        brand: initialProduct.brand.name,
      });
    }
  }, [slug]);

  const getCachedData = <T,>(key: string): T | null => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheData: CacheData<T> = JSON.parse(cached);
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

  const loadProductData = async () => {
    try {
      setLoading(true);
      
      // If no initial product, redirect
      if (!initialProduct) {
        router.push('/shop');
        return;
      }

      // Try to load related products from cache first
      const relatedCacheKey = `${RELATED_CACHE_PREFIX}${initialProduct.id}`;
      const cachedRelated = getCachedData<ProductWithRelations[]>(relatedCacheKey);
      
      if (cachedRelated) {
        setRelatedProducts(cachedRelated);
        setLoading(false);
      }
      
      // Fetch fresh related products in background
      const relatedRes = await apiRequest.get<ProductWithRelations[]>(
        `/v1/products/related?categoryId=${initialProduct.categoryId}&productId=${initialProduct.id}&limit=4`
      );
      
      // Update state with fresh data
      setRelatedProducts(relatedRes.data);
      
      // Update cache
      setCachedData(relatedCacheKey, relatedRes.data);
      
    } catch (error) {
      console.error('Failed to load related products:', error);
      // Don't redirect on error, just log it
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: Number(product.price) || 0,
      image: product.images[0]?.url || '',
      slug: product.slug,
      brand: product.brand.name,
      preOrderReadyEarliest: product.preOrderReadyEarliest || undefined,
      preOrderReadyLatest: product.preOrderReadyLatest || undefined,
      discount: product.discount ? Number(product.discount) : undefined,
      affiliatePercent: product.affiliatePercent ? Number(product.affiliatePercent) : undefined,
      isPreOrder: product.isPreOrder || false,
    });
  };

  const handleIncreaseQuantity = () => {
    if (!product) return;
    const cartItem = items.find(item => item.id === product.id.toString());
    if (cartItem) {
      updateQuantity(cartItem.id, cartItem.quantity + 1);
    }
  };

  const handleDecreaseQuantity = () => {
    if (!product) return;
    const cartItem = items.find(item => item.id === product.id.toString());
    if (cartItem) {
      updateQuantity(cartItem.id, cartItem.quantity - 1);
    }
  };

  const cartItem = items.find(item => item.id === product?.id.toString());
  const inCart = !!cartItem;
  const currentQuantity = cartItem?.quantity || 0;

  const formatPreOrderTime = () => {
    if (!product) return '';
    if (product.preOrderReadyEarliest && product.preOrderReadyLatest) {
      return `${product.preOrderReadyEarliest}-${product.preOrderReadyLatest} minggu`;
    } else if (product.preOrderReadyEarliest) {
      return `${product.preOrderReadyEarliest} minggu`;
    }
    return 'Pre-Order';
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

  if (!product) {
    return null;
  }

  const currentImage = product.images[selectedImageIndex] || product.images[0];
  const price = Number(product.price) || 0;
  const discount = Number(product.discount) || 0;
  const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data for SEO */}
      <ProductStructuredData product={product} />
      
      {/* Black overlay for navbar */}
      <div className="fixed top-0 left-0 right-0 h-20 bg-black z-40"></div>
      
      <div className="relative pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm">
            <span className="text-gray-400">/</span>
            <Link href="/shop" className="text-gray-600 hover:text-red-600 transition-colors">
              Produk
            </Link>
            <span className="text-gray-400">/</span>
            <Link 
              href={`/shop?category=${product.category.slug}`} 
              className="text-gray-600 hover:text-red-600 transition-colors"
            >
              {product.category.name}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold">{product.name}</span>
          </nav>

          {/* Product Details */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Image Gallery */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  {currentImage ? (
                    <img
                      src={currentImage.url}
                      alt={currentImage.alt || product.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Pre-Order Badge */}
                  {product.isPreOrder && (
                    <div className="absolute top-4 left-4 bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      Pre-Order: {formatPreOrderTime()}
                    </div>
                  )}
                  
                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      -{discount}%
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-4">
                    {product.images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative aspect-square bg-gray-200 rounded-lg overflow-hidden transition-all duration-300 ${
                          selectedImageIndex === index
                            ? 'ring-4 ring-red-600 scale-105'
                            : 'hover:ring-2 hover:ring-gray-300'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={image.alt || `${product.name} - ${index + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                          sizes="(max-width: 1024px) 25vw, 12.5vw"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex flex-col">
                <div className="mb-4">
                  <Link 
                    href={`/shop?category=${product.category.slug}`}
                    className="inline-block bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-200 transition-colors mb-4"
                  >
                    {product.category.name}
                  </Link>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <p className="text-lg text-gray-600 mb-4">
                    <span className="font-semibold">Merek:</span> {product.brand.name}
                  </p>
                  {product.sku && (
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold">SKU:</span> {product.sku}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="mb-6">
                  {discount > 0 ? (
                    <div>
                      <p className="text-2xl text-gray-400 line-through mb-1">
                        Rp {price.toLocaleString('id-ID')}
                      </p>
                      <p className="text-4xl font-bold text-red-600">
                        Rp {finalPrice.toLocaleString('id-ID')}
                      </p>
                      <p className="text-sm text-green-600 font-semibold mt-1">
                        Hemat Rp {(price - finalPrice).toLocaleString('id-ID')}
                      </p>
                    </div>
                  ) : (
                    <p className="text-4xl font-bold text-red-600">
                      Rp {price.toLocaleString('id-ID')}
                    </p>
                  )}
                </div>

                {/* Short Description */}
                {product.shortDescription && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{product.shortDescription}</p>
                  </div>
                )}

                {/* Add to Cart */}
                <div className="space-y-3 mt-auto">
                  {!inCart ? (
                    <button
                      onClick={handleAddToCart}
                      className="w-full py-4 rounded-lg font-semibold transition-colors duration-300 bg-red-600 text-white hover:bg-red-700 text-lg"
                    >
                      Tambah ke Keranjang
                    </button>
                  ) : (
                    <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4">
                      <button
                        onClick={handleDecreaseQuantity}
                        className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center transition-colors font-bold shadow-md text-xl"
                      >
                        -
                      </button>
                      <span className="w-16 text-center font-bold text-gray-900 text-xl">{currentQuantity}</span>
                      <button
                        onClick={handleIncreaseQuantity}
                        className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center transition-colors font-bold shadow-md text-xl"
                      >
                        +
                      </button>
                    </div>
                  )}
                  
                  <Link
                    href="/shop"
                    className="block text-center py-4 rounded-lg font-semibold transition-colors duration-300 bg-gray-200 text-gray-900 hover:bg-gray-300 text-lg"
                  >
                    Kembali ke Produk
                  </Link>
                </div>

                {/* Affiliate Commission */}
                {product.affiliatePercent && Number(product.affiliatePercent) > 0 && (
                  <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                    <p className="text-yellow-800 font-semibold text-sm">
                      🎁 Dapatkan komisi {Number(product.affiliatePercent)}% untuk setiap produk ini terjual!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Description & Details */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Detail Produk</h2>
            
            {product.description ? (
              <div className="prose max-w-none mb-8">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {product.description}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 mb-8">Deskripsi detail akan segera ditambahkan.</p>
            )}

            {/* Data Sheet Link */}
            {product.dataSheetUrl && (
              <a
                href={product.dataSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Data Sheet
              </a>
            )}

            {/* Specifications Table */}
            <div className="mt-8 border-t pt-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Spesifikasi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-700">Kategori:</span>
                  <span className="text-gray-900">{product.category.name}</span>
                </div>
                <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-700">Merek:</span>
                  <span className="text-gray-900">{product.brand.name}</span>
                </div>
                <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-700">SKU:</span>
                  <span className="text-gray-900">{product.sku}</span>
                </div>
                <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-700">Status:</span>
                  <span className={`font-semibold ${product.isPreOrder ? 'text-yellow-600' : 'text-green-600'}`}>
                    {product.isPreOrder ? 'Pre-Order' : 'Tersedia'}
                  </span>
                </div>
                {product.isPreOrder && (
                  <div className="flex justify-between p-4 bg-gray-50 rounded-lg md:col-span-2">
                    <span className="font-semibold text-gray-700">Waktu Pre-Order:</span>
                    <span className="text-gray-900">{formatPreOrderTime()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Produk Terkait</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    href={`/shop/${relatedProduct.slug}`}
                    className="group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <div className="relative h-48 bg-gray-200">
                      {relatedProduct.images[0] ? (
                        <img
                          src={relatedProduct.images[0].url}
                          alt={relatedProduct.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors truncate">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{relatedProduct.brand.name}</p>
                      <p className="text-xl font-bold text-red-600">
                        Rp {Number(relatedProduct.price).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(!cartOpen)} />
    </div>
  );
}
