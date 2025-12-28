import BrandHero from './BrandHero';
import BrandAbout from './BrandAbout';
import ProductCategories from './ProductCategories';
import BrandApplications from './BrandApplications';
import BrandCTA from './BrandCTA';

interface ProductCategory {
  title: string;
  description: string;
}

interface ApplicationSection {
  title: string;
  items: string[];
}

interface BrandPageLayoutProps {
  hero: {
    title: string;
    subtitle: string;
  };
  about: {
    title: string;
    paragraphs: string[];
  };
  products: {
    title: string;
    categories: ProductCategory[];
  };
  applications?: {
    title: string;
    sections: ApplicationSection[];
  };
  cta: {
    title: string;
    description: string;
    searchQuery: string;
    primaryButtonText: string;
    secondaryButtonText: string;
    bgColor?: string;
    textColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
  };
}

export default function BrandPageLayout({ hero, about, products, applications, cta }: BrandPageLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BrandHero {...hero} />
        <BrandAbout {...about} />
        <ProductCategories {...products} />
        {applications && <BrandApplications {...applications} />}
        <BrandCTA {...cta} />
      </div>
    </div>
  );
}
