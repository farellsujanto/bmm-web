interface ProductCategory {
  title: string;
  description: string;
}

interface ProductCategoriesProps {
  title: string;
  categories: ProductCategory[];
}

export default function ProductCategories({ title, categories }: ProductCategoriesProps) {
  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">{title}</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-3 text-gray-900">{category.title}</h3>
            <p className="text-gray-600">{category.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
