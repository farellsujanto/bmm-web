import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Industrial Spareparts - Norgren, SMC, HIKRobot, Continental, VIBCO | BMM Parts",
  description: "Browse industrial spareparts from top brands: Norgren pneumatic valves & cylinders, SMC automation components, HIKRobot vision systems, Hikvision industrial cameras, Continental & Contitech seal kits, VIBCO industrial vibrators. Genuine products, competitive prices, fast Indonesia delivery.",
  keywords: "buy norgren indonesia, smc catalog, hikrobot price, hikvision industrial camera, continental seal kit catalog, contitech distributor, vibco vibrator, parker hannifin, festo, bosch rexroth, pneumatic cylinder, solenoid valve, air filter regulator, hydraulic seal, o-ring seal, mechanical seal, industrial camera, barcode reader, linear actuator, industrial parts online indonesia",
  openGraph: {
    title: "Shop Industrial Spareparts - Norgren, SMC, HIKRobot, Continental | BMM Parts",
    description: "Premium industrial components from Norgren, SMC, HIKRobot, Hikvision, Continental, Contitech, VIBCO. Authorized distributor in Indonesia.",
    type: "website",
    url: "https://bmmparts.co.id/shop",
    siteName: "BMM Parts",
    images: [
      {
        url: "/images/shop-og.jpg",
        width: 1200,
        height: 630,
        alt: "BMM Parts Industrial Spareparts Catalog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Industrial Spareparts - Norgren, SMC, HIKRobot | BMM Parts",
    description: "Premium industrial components from top brands. Authorized distributor in Indonesia.",
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
    canonical: "https://bmmparts.co.id/shop",
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
