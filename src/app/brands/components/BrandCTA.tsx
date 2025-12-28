import Link from 'next/link';

interface BrandCTAProps {
  title: string;
  description: string;
  searchQuery: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  bgColor?: string;
  textColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
}

export default function BrandCTA({
  title,
  description,
  searchQuery,
  primaryButtonText,
  secondaryButtonText,
  bgColor = 'bg-red-600',
  textColor = 'text-white',
  buttonColor = 'bg-white',
  buttonTextColor = 'text-red-600',
}: BrandCTAProps) {
  return (
    <section className={`${bgColor} ${textColor} rounded-lg p-8 text-center`}>
      <h2 className="text-3xl font-bold mb-4">{title}</h2>
      <p className="text-xl mb-6 opacity-90">{description}</p>
      <div className="flex gap-4 justify-center flex-wrap">
        <Link 
          href={`/shop?search=${encodeURIComponent(searchQuery)}`}
          className={`${buttonColor} ${buttonTextColor} px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition`}
        >
          {primaryButtonText}
        </Link>
        <Link 
          href="/contact" 
          className={`border-2 ${textColor.replace('text-', 'border-')} ${textColor} px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition`}
        >
          {secondaryButtonText}
        </Link>
      </div>
    </section>
  );
}
