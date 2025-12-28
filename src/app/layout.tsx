import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "./components/ConditionalLayout";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { CartProvider } from "@/src/contexts/CartContext";
import { AlertProvider } from "@/src/contexts/AlertContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BMM Parts - Premium Industrial Spareparts | Norgren, SMC, HIKRobot, Continental, Contitech, VIBCO",
  description: "Authorized distributor of premium industrial spareparts: Norgren pneumatic components, SMC cylinders & valves, HIKRobot vision systems, Hikvision cameras, Continental & Contitech seal kits, VIBCO vibrators. Genuine engineering parts for manufacturing & automation.",
  keywords: "Norgren Indonesia, SMC pneumatic, HIKRobot, Hikvision industrial camera, Continental seal kit, Contitech, VIBCO vibrator, Parker, Bosch Rexroth, Festo, industrial spareparts, pneumatic components, hydraulic parts, automation parts, seal kits, o-rings, engineering supplies, manufacturing parts Indonesia",
  openGraph: {
    title: "BMM Parts - Premium Industrial Spareparts | Norgren, SMC, HIKRobot, Continental",
    description: "Authorized distributor of Norgren, SMC, HIKRobot, Hikvision, Continental, Contitech, VIBCO and more. Genuine industrial spareparts for your manufacturing needs.",
    type: "website",
    url: "https://bmm-parts.com",
    siteName: "BMM Parts",
    locale: "id_ID",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BMM Parts - Industrial Spareparts Distributor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BMM Parts - Industrial Spareparts | Norgren, SMC, HIKRobot",
    description: "Authorized distributor of premium industrial components and seal kits",
    images: ["/images/og-image.jpg"],
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
    canonical: "https://bmm-parts.com",
  },
  verification: {
    google: "your-google-verification-code",
  },
  other: {
    'og:phone_number': '+62-xxx-xxxx-xxxx',
    'og:email': 'info@bmm-parts.com',
    'og:country-name': 'Indonesia',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Organization JSON-LD for enhanced SEO
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BMM Parts',
    url: 'https://bmm-parts.com',
    logo: 'https://bmm-parts.com/images/logo.png',
    description: 'Leading distributor of premium industrial spareparts in Indonesia including Norgren, SMC, HIKRobot, Hikvision, Continental, Contitech, and VIBCO',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'ID',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['Indonesian', 'English'],
    },
    sameAs: [
      // Add your social media profiles here when available
      // 'https://www.facebook.com/bmmparts',
      // 'https://www.instagram.com/bmmparts',
      // 'https://www.linkedin.com/company/bmmparts',
    ],
    brand: [
      { '@type': 'Brand', name: 'Norgren' },
      { '@type': 'Brand', name: 'SMC' },
      { '@type': 'Brand', name: 'HIKRobot' },
      { '@type': 'Brand', name: 'Hikvision' },
      { '@type': 'Brand', name: 'Continental' },
      { '@type': 'Brand', name: 'Contitech' },
      { '@type': 'Brand', name: 'VIBCO' },
    ],
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <CartProvider>
            <AlertProvider>
              <ConditionalLayout>{children}</ConditionalLayout>
            </AlertProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
