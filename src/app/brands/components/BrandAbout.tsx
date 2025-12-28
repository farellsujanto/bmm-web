interface BrandAboutProps {
  title: string;
  paragraphs: string[];
}

export default function BrandAbout({ title, paragraphs }: BrandAboutProps) {
  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">{title}</h2>
      <div className="prose prose-lg max-w-none">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-gray-700 mb-4">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
