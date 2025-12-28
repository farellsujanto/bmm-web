'use client';

import { useEffect } from 'react';

type ProductStructuredDataProps = {
  product: any; // Using any to handle Prisma Decimal types
};

export default function ProductStructuredData({ product }: ProductStructuredDataProps) {
  useEffect(() => {
    const price = Number(product.price) || 0;
    const discount = Number(product.discount) || 0;
    const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.description || `${product.name} - Premium ${product.category.name}`,
      "image": product.images.map((img: any) => img.url),
      "brand": {
        "@type": "Brand",
        "name": product.brand.name
      },
      "sku": product.sku || product.slug,
      "offers": {
        "@type": "Offer",
        "url": `https://bmmparts.co.id/shop/${product.slug}`,
        "priceCurrency": "IDR",
        "price": finalPrice,
        "availability": product.isPreOrder 
          ? "https://schema.org/PreOrder" 
          : "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      "category": product.category.name
    };

    // Remove existing structured data if any
    const existingScript = document.getElementById('product-structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.id = 'product-structured-data';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('product-structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [product]);

  return null;
}
