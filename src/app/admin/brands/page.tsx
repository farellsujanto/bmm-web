'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/src/utils/api/apiRequest';
import { useAlert } from '@/src/contexts/AlertContext';
import type { BrandModel } from '@/generated/prisma/models';
import { PrimaryButton, TertiaryButton, PrimaryInput } from '@/src/components/ui';

export default function BrandsPage() {
  const { showAlert, showConfirm } = useAlert();
  const [brands, setBrands] = useState<BrandModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandModel | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logoUrl: '',
  });

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      const response = await apiRequest.get<BrandModel[]>('/v1/admin/brands');
      setBrands(response.data);
    } catch (error) {
      console.error('Failed to load brands:', error);
      showAlert({ message: 'Failed to load brands' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingBrand) {
        await apiRequest.put(`/v1/admin/brands/${editingBrand.id}`, formData);
        showAlert({ message: 'Brand updated successfully' });
      } else {
        await apiRequest.post('/v1/admin/brands', formData);
        showAlert({ message: 'Brand created successfully' });
      }

      setShowModal(false);
      resetForm();
      loadBrands();
    } catch (error: any) {
      showAlert({ message: error.message || 'Failed to save brand' });
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirm({ message: 'Are you sure you want to delete this brand?' });
    if (!confirmed) return;

    try {
      await apiRequest.delete(`/v1/admin/brands/${id}`);
      showAlert({ message: 'Brand deleted successfully' });
      loadBrands();
    } catch (error) {
      showAlert({ message: 'Failed to delete brand' });
    }
  };

  const handleEdit = (brand: BrandModel) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      logoUrl: brand.logoUrl || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingBrand(null);
    setFormData({
      name: '',
      slug: '',
      logoUrl: '',
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
        >
          Add Brand
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Logo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {brands.map((brand) => (
              <tr
                key={brand.id}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">{brand.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {brand.logoUrl && (
                    <img
                      src={brand.logoUrl}
                      alt={brand.name}
                      className="h-8 w-auto object-contain"
                    />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{brand.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{brand.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => handleEdit(brand)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(brand.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {brands.length === 0 && (
          <div className="text-center py-12 text-gray-700">
            No brands found. Create your first brand!
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingBrand ? 'Edit Brand' : 'Add Brand'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <PrimaryInput
                label="Name"
                type="text"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData({ 
                    ...formData, 
                    name,
                    slug: generateSlug(name)
                  });
                }}
                required
              />

              <PrimaryInput
                label="Slug"
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                helperText="URL-friendly version of the name"
                required
              />

              <PrimaryInput
                label="Logo URL"
                type="url"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
              />

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
                  {editingBrand ? 'Update' : 'Create'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
