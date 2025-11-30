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

  // Create a clean description
  const description = product.shortDescription || product.description || `${product.name} - Premium ${product.category?.name || 'engineering sparepart'} from ${product.brand?.name || 'trusted brand'}. Available at BMM Parts.`;
  const cleanDescription = description.slice(0, 160);

  return {
    title: `${product.name} - ${product.brand?.name || ''} | BMM Parts`,
    description: cleanDescription,
    keywords: `${product.name}, ${product.brand?.name}, ${product.category?.name}, engineering spareparts, ${product.sku || ''}, industrial parts, spare parts Indonesia`,
    openGraph: {
      title: `${product.name} - ${product.brand?.name || ''}`,
      description: cleanDescription,
      type: "website",
      url: productUrl,
      siteName: "BMM Parts",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
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
  return <ProductDetailClient />;
}
