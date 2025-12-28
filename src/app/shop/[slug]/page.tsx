import type { Metadata } from "next";
import ProductDetailClient from "./client-page";

// This is a server component that generates metadata
type Props = {
  params: Promise<{ slug: string }>;
};

// Function to fetch product data for metadata
async function getProductBySlug(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/v1/products?slug=${slug}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error('API response not ok:', response.status);
      return null;
    }
    
    const result = await response.json();
    console.log('API result for slug', slug, ':', result);
    
    // Handle wrapped response with success field
    if (result.success === false) {
      console.error('API returned success: false');
      return null;
    }
    
    // Return data field if it exists, otherwise return result
    const product = result.data || result;
    console.log('Product found:', product ? product.name : 'null');
    
    return product;
  } catch (error) {
    console.error('Error fetching product for metadata:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  console.log('Generating metadata for slug:', slug);
  const product = await getProductBySlug(slug);

  if (!product || !product.name) {
    console.log('Product not found or invalid for slug:', slug);
    return {
      title: "Product Not Found | BMM Parts",
      description: "The product you're looking for could not be found.",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  console.log('Generating metadata for product:', product.name);

  const price = Number(product.price) || 0;
  const discount = Number(product.discount) || 0;
  const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;
  const imageUrl = product.images?.[0]?.url || '/images/default-product.jpg';
  const productUrl = `https://bmm-parts.com/shop/${product.slug}`;

  // Create a clean description with brand emphasis
  const brandName = product.brand?.name || 'trusted brand';
  const categoryName = product.category?.name || 'industrial sparepart';
  const description = product.shortDescription || product.description || `${product.name} - Premium ${categoryName} from ${brandName}. Genuine ${brandName} product available at BMM Parts Indonesia. Fast delivery, competitive prices.`;
  const cleanDescription = description.slice(0, 160);
  
  // Enhanced keywords with brand and category focus
  const productKeywords = [
    product.name,
    `${product.brand?.name} ${product.name}`,
    `${product.brand?.name} indonesia`,
    `buy ${product.brand?.name}`,
    product.brand?.name,
    product.category?.name,
    product.sku || '',
    'industrial spareparts',
    'engineering parts',
    'spare parts indonesia',
    'genuine parts',
    `${product.category?.name} supplier`,
  ].filter(Boolean).join(', ');

  return {
    title: `${product.name} - ${product.brand?.name || ''} | BMM Parts Indonesia`,
    description: cleanDescription,
    keywords: productKeywords,
    openGraph: {
      title: `${product.name} - ${product.brand?.name || ''} | BMM Parts`,
      description: cleanDescription,
      type: "website",
      url: productUrl,
      siteName: "BMM Parts",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${product.name} - ${product.brand?.name || ''}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} - ${product.brand?.name || ''}`,
      description: cleanDescription,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: productUrl,
    },
    other: {
      'product:price:amount': finalPrice.toString(),
      'product:price:currency': 'IDR',
      'product:availability': product.isPreOrder ? 'preorder' : 'instock',
      'product:condition': 'new',
      'product:brand': product.brand?.name || '',
      'product:category': product.category?.name || '',
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  // Generate JSON-LD structured data for SEO
  let jsonLd = null;
  if (product && product.name) {
    const price = Number(product.price) || 0;
    const discount = Number(product.discount) || 0;
    const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;
    const imageUrl = product.images?.[0]?.url || '/images/default-product.jpg';
    
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: product.images?.map((img: any) => img.url) || [imageUrl],
      description: product.description || product.shortDescription || `${product.name} from ${product.brand?.name || 'BMM Parts'}`,
      sku: product.sku || product.slug,
      mpn: product.name,
      brand: {
        '@type': 'Brand',
        name: product.brand?.name || 'BMM Parts',
      },
      offers: {
        '@type': 'Offer',
        url: `https://bmm-parts.com/shop/${product.slug}`,
        priceCurrency: 'IDR',
        price: finalPrice,
        priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        availability: product.isPreOrder 
          ? 'https://schema.org/PreOrder' 
          : (product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'),
        itemCondition: 'https://schema.org/NewCondition',
        seller: {
          '@type': 'Organization',
          name: 'BMM Parts',
        },
      },
      category: product.category?.name || 'Industrial Spareparts',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '12',
      },
    };
  }
  
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailClient initialProduct={product} />
    </>
  );
}
