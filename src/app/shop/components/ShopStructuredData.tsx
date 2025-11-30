'use client';

import { useEffect } from 'react';

type ShopStructuredDataProps = {
  products: Array<any>; // Using any to handle Prisma types
};

export default function ShopStructuredData({ products }: ShopStructuredDataProps) {
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "BMM Parts Product Catalog",
      "description": "Premium engineering spareparts for all your industrial needs",
      "numberOfItems": products.length,
      "itemListElement": products.slice(0, 20).map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": product.name,
          "image": product.images[0]?.url || '',
          "brand": {
            "@type": "Brand",
            "name": product.brand.name
          },
          "offers": {
            "@type": "Offer",
            "url": `https://bmm-parts.com/shop/${product.slug}`,
            "priceCurrency": "IDR",
            "price": Number(product.price) || 0,
            "availability": "https://schema.org/InStock",
            "itemCondition": "https://schema.org/NewCondition"
          },
          "category": product.category.name
        }
      }))
    };

    // Remove existing structured data if any
    const existingScript = document.getElementById('shop-structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.id = 'shop-structured-data';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('shop-structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [products]);

  return null;
}
