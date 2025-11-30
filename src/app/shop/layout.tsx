import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop - Premium Engineering Spareparts | BMM Parts",
  description: "Browse our comprehensive catalog of premium engineering spareparts. Find bearings, belts, chains, motors, pumps, and more from trusted brands. Quality industrial components for all your needs.",
  keywords: "engineering spareparts, industrial parts, bearings, belts, chains, motors, pumps, hydraulic components, pneumatic parts, mechanical components, spare parts Indonesia",
  openGraph: {
    title: "Shop - Premium Engineering Spareparts | BMM Parts",
    description: "Browse our comprehensive catalog of premium engineering spareparts. Quality industrial components from trusted brands.",
    type: "website",
    url: "https://bmm-parts.com/shop",
    siteName: "BMM Parts",
    images: [
      {
        url: "/images/shop-og.jpg",
        width: 1200,
        height: 630,
        alt: "BMM Parts Shop - Engineering Spareparts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop - Premium Engineering Spareparts | BMM Parts",
    description: "Browse our comprehensive catalog of premium engineering spareparts. Quality industrial components from trusted brands.",
    images: ["/images/shop-og.jpg"],
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
    canonical: "https://bmm-parts.com/shop",
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
