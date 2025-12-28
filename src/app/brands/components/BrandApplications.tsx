interface ApplicationSection {
  title: string;
  items: string[];
}

interface BrandApplicationsProps {
  title: string;
  sections: ApplicationSection[];
}

export default function BrandApplications({ title, sections }: BrandApplicationsProps) {
  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">{title}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {sections.map((section, index) => (
          <div key={index}>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">{section.title}</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
