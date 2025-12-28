interface BrandHeroProps {
  title: string;
  subtitle: string;
}

export default function BrandHero({ title, subtitle }: BrandHeroProps) {
  return (
    <div className="mb-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        {title}
      </h1>
      <p className="text-xl text-gray-600">
        {subtitle}
      </p>
    </div>
  );
}
