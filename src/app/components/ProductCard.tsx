'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/src/contexts/CartContext';
import { trackButtonClick } from '@/src/utils/analytics/posthog.util';

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
  discount?: number;
  affiliatePercent?: number;
  isPreOrder?: boolean;
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
  preOrderReadyLatest,
  discount,
  affiliatePercent,
  isPreOrder
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
      preOrderReadyLatest,
      discount,
      affiliatePercent,
      isPreOrder
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
    return 'PO';
  };
  
  return (
    <div className={`group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full ${!inCart ? 'transform hover:-translate-y-1' : ''}`}>
      {/* Product Image */}
      <div className="relative h-48 sm:h-52 bg-gray-200 overflow-hidden flex-shrink-0">
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
        <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
          {category}
        </div>
        {discount && discount > 0 && (
          <div className="absolute top-10 right-2 bg-green-600 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-md">
            -{discount}%
          </div>
        )}
        {isPreOrder && (
          <div className="absolute bottom-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded text-[10px] sm:text-xs font-bold shadow-md whitespace-nowrap">
            PO: {formatPreOrderTime()}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-red-600 transition-colors break-words">
          {name}
        </h3>
        <p className="text-xs text-gray-600 mb-2 truncate">{brand}</p>
        {discount && discount > 0 ? (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-xs sm:text-sm text-gray-400 line-through">
                Rp {price.toLocaleString('id-ID')}
              </p>
              <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">
                -{discount}%
              </span>
            </div>
            <p className="text-base sm:text-lg font-bold text-red-600">
              Rp {(price * (1 - discount / 100)).toLocaleString('id-ID')}
            </p>
          </div>
        ) : (
          <p className="text-base sm:text-lg font-bold text-red-600 mb-3">
            Rp {price.toLocaleString('id-ID')}
          </p>
        )}
        <div className="space-y-1.5 mt-auto">
          <Link
            href={`/shop/${slug}`}
            onClick={() => trackButtonClick('view_product_detail', 'product_card')}
            className="block text-center py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-300 bg-black text-white hover:bg-red-600"
          >
            Lihat Detail
          </Link>
          {!inCart ? (
            <button
              onClick={handleAddToCart}
              className="w-full py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-300 bg-red-600 text-white hover:bg-red-700"
            >
              Tambah ke Keranjang
            </button>
          ) : (
            <div className="flex flex-col items-center justify-between bg-gray-100 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDecreaseQuantity}
                  className="w-7 h-7 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center transition-colors font-bold shadow-sm"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-bold text-gray-900">{currentQuantity}</span>
                <button
                  onClick={handleIncreaseQuantity}
                  className="w-7 h-7 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center transition-colors font-bold shadow-sm"
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
