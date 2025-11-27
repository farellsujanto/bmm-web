'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/src/utils/api/apiRequest';
import type { ProductModel, BrandModel, CategoryModel } from '@/generated/prisma/models';
import { PrimaryButton, SecondaryButton, TertiaryButton, DangerButton, PrimaryInput, PrimarySelect, PrimaryTextArea } from '@/src/components/ui';

type ProductWithRelations = ProductModel & {
  brand: { name: string };
  category: { name: string };
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [brands, setBrands] = useState<BrandModel[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithRelations | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    description: '',
    shortDescription: '',
    dataSheetUrl: '',
    price: '',
    discount: '',
    stock: '0',
    isActive: true,
    affiliatePercent: '',
    isPreOrder: false,
    preOrderReadyEarliest: '',
    preOrderReadyLatest: '',
    brandId: '',
    categoryId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, brandsRes, categoriesRes] = await Promise.all([
        apiRequest.get<ProductWithRelations[]>('/v1/admin/products'),
        apiRequest.get<BrandModel[]>('/v1/admin/brands'),
        apiRequest.get<CategoryModel[]>('/v1/admin/categories'),
      ]);

      setProducts(productsRes.data);
      setBrands(brandsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        await apiRequest.put(`/v1/admin/products/${editingProduct.id}`, formData);
        alert('Product updated successfully');
      } else {
        await apiRequest.post('/v1/admin/products', formData);
        alert('Product created successfully');
      }

      setShowModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await apiRequest.delete(`/v1/admin/products/${id}`);
      alert('Product deleted successfully');
      loadData();
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  const handleEdit = (product: ProductWithRelations) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      dataSheetUrl: product.dataSheetUrl || '',
      price: product.price?.toString() || '',
      discount: product.discount?.toString() || '',
      stock: product.stock.toString(),
      isActive: product.isActive,
      affiliatePercent: product.affiliatePercent?.toString() || '',
      isPreOrder: product.isPreOrder,
      preOrderReadyEarliest: product.preOrderReadyEarliest ? new Date(product.preOrderReadyEarliest).toISOString().slice(0, 16) : '',
      preOrderReadyLatest: product.preOrderReadyLatest ? new Date(product.preOrderReadyLatest).toISOString().slice(0, 16) : '',
      brandId: product.brandId.toString(),
      categoryId: product.categoryId.toString(),
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      sku: '',
      description: '',
      shortDescription: '',
      dataSheetUrl: '',
      price: '',
      discount: '',
      stock: '0',
      isActive: true,
      affiliatePercent: '',
      isPreOrder: false,
      preOrderReadyEarliest: '',
      preOrderReadyLatest: '',
      brandId: '',
      categoryId: '',
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newProducts = [...products];
    const draggedProduct = newProducts[draggedItem];
    newProducts.splice(draggedItem, 1);
    newProducts.splice(index, 0, draggedProduct);

    setProducts(newProducts);
    setDraggedItem(index);
  };

  const handleDragEnd = async () => {
    if (draggedItem === null) return;

    try {
      // Update sort order for all products
      const items = products.map((prod, index) => ({
        id: prod.id,
        sortOrder: index
      }));

      await apiRequest.post('/v1/admin/products/reorder', { items });
    } catch (error) {
      console.error('Failed to reorder products:', error);
      alert('Failed to save new order');
      loadData(); // Reload on error
    } finally {
      setDraggedItem(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
        >
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product, index) => (
              <tr
                key={product.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`cursor-move hover:bg-gray-50 ${draggedItem === index ? 'opacity-50' : ''}`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.sku}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.brand.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.category.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.price ? `$${product.price}` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <PrimaryInput
                label="Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <PrimaryInput
                label="Slug"
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />

              <PrimaryInput
                label="SKU"
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />

              <PrimaryTextArea
                label="Short Description"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                rows={2}
              />

              <PrimaryTextArea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />

              <PrimaryInput
                label="Data Sheet URL"
                type="url"
                value={formData.dataSheetUrl}
                onChange={(e) => setFormData({ ...formData, dataSheetUrl: e.target.value })}
                placeholder="https://example.com/datasheet.pdf"
              />

              <div className="grid grid-cols-2 gap-4">
                <PrimarySelect
                  label="Brand"
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  options={[
                    { value: '', label: 'Select Brand' },
                    ...brands.map((brand) => ({ value: brand.id, label: brand.name }))
                  ]}
                  required
                />

                <PrimarySelect
                  label="Category"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  options={[
                    { value: '', label: 'Select Category' },
                    ...categories.map((category) => ({ value: category.id, label: category.name }))
                  ]}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <PrimaryInput
                  label="Price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                />

                <PrimaryInput
                  label="Discount (%)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="99.99"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  placeholder="0.00"
                />

                <PrimaryInput
                  label="Stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>

              <PrimaryInput
                label="Affiliate Percentage"
                type="number"
                step="0.01"
                min="0"
                max="99.99"
                value={formData.affiliatePercent}
                onChange={(e) => setFormData({ ...formData, affiliatePercent: e.target.value })}
                placeholder="0.00"
                helperText="Commission percentage for affiliates"
              />

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-900">Active</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPreOrder}
                    onChange={(e) => setFormData({ ...formData, isPreOrder: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-900">Pre-Order</label>
                </div>
              </div>

              {formData.isPreOrder && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <PrimaryInput
                    label="Ready Earliest"
                    type="datetime-local"
                    value={formData.preOrderReadyEarliest}
                    onChange={(e) => setFormData({ ...formData, preOrderReadyEarliest: e.target.value })}
                  />

                  <PrimaryInput
                    label="Ready Latest"
                    type="datetime-local"
                    value={formData.preOrderReadyLatest}
                    onChange={(e) => setFormData({ ...formData, preOrderReadyLatest: e.target.value })}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4">
                <TertiaryButton
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </TertiaryButton>
                <PrimaryButton type="submit">
                  {editingProduct ? 'Update' : 'Create'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
