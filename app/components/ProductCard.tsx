import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  inStock?: boolean;
}

export default function ProductCard({
  id,
  name,
  category,
  price,
  image,
  inStock = true
}: ProductCardProps) {
  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      {/* Product Image */}
      <div className="relative h-64 bg-gray-200 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="18" fill="%239ca3af" text-anchor="middle" dy=".3em"%3E${encodeURIComponent(name)}%3C/text%3E%3C/svg%3E')`
          }}
        />
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {category}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
          {name}
        </h3>
        <p className="text-2xl font-bold text-red-600 mb-4">
          ${price.toLocaleString()}
        </p>
        <Link
          href={`/shop/${id}`}
          className={`block text-center py-3 rounded-lg font-semibold transition-colors duration-300 ${
            inStock
              ? 'bg-black text-white hover:bg-red-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {inStock ? 'View Details' : 'Unavailable'}
        </Link>
      </div>
    </div>
  );
}
