'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/src/contexts/CartContext';

interface ProductCardProps {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  slug: string;
  brand: string;
  preOrderReadyEarliest?: number;
  preOrderReadyLatest?: number;
}

export default function ProductCard({
  id,
  name,
  category,
  price,
  image,
  slug,
  brand,
  preOrderReadyEarliest,
  preOrderReadyLatest
}: ProductCardProps) {
  const { items, addToCart, updateQuantity } = useCart();
  
  const cartItem = items.find(item => item.id === id.toString());
  const inCart = !!cartItem;
  const currentQuantity = cartItem?.quantity || 0;
  
  const handleAddToCart = () => {
    addToCart({ 
      id: id.toString(), 
      name, 
      price, 
      image, 
      slug,
      brand,
      preOrderReadyEarliest,
      preOrderReadyLatest
    });
  };
  
  const handleIncreaseQuantity = () => {
    if (cartItem) {
      updateQuantity(cartItem.id, cartItem.quantity + 1);
    }
  };
  
  const handleDecreaseQuantity = () => {
    if (cartItem) {
      updateQuantity(cartItem.id, cartItem.quantity - 1);
    }
  };
  
  const formatPreOrderTime = () => {
    if (preOrderReadyEarliest && preOrderReadyLatest) {
      return `${preOrderReadyEarliest}-${preOrderReadyLatest} minggu`;
    } else if (preOrderReadyEarliest) {
      return `${preOrderReadyEarliest} minggu`;
    }
    return 'Pre-Order';
  };
  
  return (
    <div className={`group relative bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${!inCart ? 'transform hover:-translate-y-2' : ''}`}>
      {/* Product Image */}
      <div className="relative h-64 bg-gray-200 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
            style={{
              backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="18" fill="%239ca3af" text-anchor="middle" dy=".3em"%3E${encodeURIComponent(name)}%3C/text%3E%3C/svg%3E')`
            }}
          />
        )}
        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {category}
        </div>
        <div className="absolute top-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
          Pre-Order: {formatPreOrderTime()}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">
          {name}
        </h3>
        <p className="text-sm text-gray-600 mb-3">{brand}</p>
        <p className="text-2xl font-bold text-red-600 mb-4">
          Rp {price.toLocaleString('id-ID')}
        </p>
        <div className="space-y-2">
          <Link
            href={`/shop/${slug}`}
            className="block text-center py-3 rounded-lg font-semibold transition-colors duration-300 bg-black text-white hover:bg-red-600"
          >
            Lihat Detail
          </Link>
          {!inCart ? (
            <button
              onClick={handleAddToCart}
              className="w-full py-3 rounded-lg font-semibold transition-colors duration-300 bg-red-600 text-white hover:bg-red-700"
            >
              Tambah ke Keranjang
            </button>
          ) : (
            <div className="flex flex-col items-center justify-between bg-gray-100 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDecreaseQuantity}
                  className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center transition-colors font-bold shadow-md"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-gray-900">{currentQuantity}</span>
                <button
                  onClick={handleIncreaseQuantity}
                  className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center transition-colors font-bold shadow-md"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
