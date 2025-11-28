'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/src/utils/api/apiRequest';
import type { ProductModel, BrandModel, CategoryModel, ProductImageModel } from '@/generated/prisma/models';
import { PrimaryButton, SecondaryButton, TertiaryButton, DangerButton, PrimaryInput, PrimarySelect, PrimaryTextArea } from '@/src/components/ui';

type ProductImage = {
  url: string;
  alt: string | null;
  sortOrder: number;
};

type ProductWithRelations = ProductModel & {
  brand: { name: string };
  category: { name: string };
  images?: ProductImageModel[];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [brands, setBrands] = useState<BrandModel[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithRelations | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]); // Store actual files for new products
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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
    isPreOrder: true,
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
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });
      
      if (editingProduct) {
        // For updates, send existing image storage paths and new files
        images.forEach((img) => {
          // Only add storage paths (not blob URLs from new uploads)
          if (!img.url.startsWith('blob:')) {
            formDataToSend.append('existingImagePaths', img.url);
          }
        });
        
        // Append new image files
        imageFiles.forEach((file) => {
          formDataToSend.append('images', file);
        });

        await apiRequest.put(`/v1/admin/products/${editingProduct.id}`, formDataToSend);
        alert('Product updated successfully');
      } else {
        // For creation, just append image files
        imageFiles.forEach((file) => {
          formDataToSend.append('images', file);
        });

        await apiRequest.post('/v1/admin/products', formDataToSend);
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
      preOrderReadyEarliest: product.preOrderReadyEarliest?.toString() || '',
      preOrderReadyLatest: product.preOrderReadyLatest?.toString() || '',
      brandId: product.brandId.toString(),
      categoryId: product.categoryId.toString(),
    });
    // Convert ProductImageModel[] to ProductImage[]
    const mappedImages: ProductImage[] = (product.images || []).map(img => ({
      url: img.url,
      alt: img.alt || '',
      sortOrder: img.sortOrder
    }));
    setImages(mappedImages);
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setImages([]);
    setImageFiles([]);
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
      isPreOrder: true,
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // For both create and edit, store File object and blob URL for preview
      const blobUrl = URL.createObjectURL(file);
      setImages([...images, {
        url: blobUrl,
        alt: '',
        sortOrder: images.length
      }]);
      setImageFiles([...imageFiles, file]);
    } catch (error: any) {
      alert(error.message || 'Failed to handle image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageDragStart = (index: number) => {
    setDraggedImageIndex(index);
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedImageIndex === null || draggedImageIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedImageIndex];
    newImages.splice(draggedImageIndex, 1);
    newImages.splice(index, 0, draggedImage);

    setImages(newImages);
    setDraggedImageIndex(index);
  };

  const handleImageDragEnd = () => {
    setDraggedImageIndex(null);
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    setImages(images.filter((_, i) => i !== index));
    
    // If it's a blob URL (new upload), also remove from imageFiles
    if (imageToRemove.url.startsWith('blob:')) {
      const fileIndex = imageFiles.findIndex((_, i) => {
        // Find corresponding file index (accounting for existing images)
        const blobImages = images.filter(img => img.url.startsWith('blob:'));
        const blobIndex = blobImages.findIndex(img => img.url === imageToRemove.url);
        return i === blobIndex;
      });
      if (fileIndex !== -1) {
        setImageFiles(imageFiles.filter((_, i) => i !== fileIndex));
      }
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
                    label="Ready Earliest (weeks)"
                    type="number"
                    min="0"
                    value={formData.preOrderReadyEarliest}
                    onChange={(e) => setFormData({ ...formData, preOrderReadyEarliest: e.target.value })}
                    placeholder="e.g., 2"
                  />

                  <PrimaryInput
                    label="Ready Latest (weeks)"
                    type="number"
                    min="0"
                    value={formData.preOrderReadyLatest}
                    onChange={(e) => setFormData({ ...formData, preOrderReadyLatest: e.target.value })}
                    placeholder="e.g., 4"
                  />
                </div>
              )}

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-900">Product Images</label>
                
                {/* Image Upload */}
                <div className="flex items-center space-x-4">
                  <label className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  <span className="text-sm text-gray-600">
                    Images will be converted to WebP format
                  </span>
                </div>

                {/* Image List with Drag & Drop */}
                {images.length > 0 && (
                  <div className="space-y-2">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        draggable
                        onDragStart={() => handleImageDragStart(index)}
                        onDragOver={(e) => handleImageDragOver(e, index)}
                        onDragEnd={handleImageDragEnd}
                        className={`flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border-2 cursor-move ${
                          draggedImageIndex === index ? 'border-blue-500 opacity-50' : 'border-gray-200'
                        }`}
                      >
                        <span className="text-gray-500 font-mono text-sm">☰</span>
                        <img
                          src={image.url}
                          alt={image.alt || `Product image ${index + 1}`}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <input
                          type="text"
                          value={image.alt || ''}
                          onChange={(e) => {
                            const newImages = [...images];
                            newImages[index].alt = e.target.value;
                            setImages(newImages);
                          }}
                          placeholder="Alt text (optional)"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
