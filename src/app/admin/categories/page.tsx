'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/src/utils/api/apiRequest';
import { useAlert } from '@/src/contexts/AlertContext';
import type { CategoryModel } from '@/generated/prisma/models';
import { PrimaryButton, TertiaryButton, PrimaryInput } from '@/src/components/ui';

export default function CategoriesPage() {
  const { showAlert, showConfirm } = useAlert();
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryModel | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await apiRequest.get<CategoryModel[]>('/v1/admin/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
      showAlert({ message: 'Failed to load categories' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingCategory) {
        await apiRequest.put(`/v1/admin/categories/${editingCategory.id}`, formData);
        showAlert({ message: 'Category updated successfully' });
      } else {
        await apiRequest.post('/v1/admin/categories', formData);
        showAlert({ message: 'Category created successfully' });
      }

      setShowModal(false);
      resetForm();
      loadCategories();
    } catch (error: any) {
      showAlert({ message: error.message || 'Failed to save category' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirm({ message: 'Are you sure you want to delete this category?' });
    if (!confirmed) return;

    try {
      await apiRequest.delete(`/v1/admin/categories/${id}`);
      showAlert({ message: 'Category deleted successfully' });
      loadCategories();
    } catch (error) {
      showAlert({ message: 'Failed to delete category' });
    }
  };

  const handleEdit = (category: CategoryModel) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newCategories = [...categories];
    const draggedCategory = newCategories[draggedItem];
    newCategories.splice(draggedItem, 1);
    newCategories.splice(index, 0, draggedCategory);

    setCategories(newCategories);
    setDraggedItem(index);
  };

  const handleDragEnd = async () => {
    if (draggedItem === null) return;

    try {
      // Update sort order for all categories
      const items = categories.map((cat, index) => ({
        id: cat.id,
        sortOrder: index
      }));

      await apiRequest.post('/v1/admin/categories/reorder', { items });
    } catch (error) {
      console.error('Failed to reorder categories:', error);
      showAlert({ message: 'Failed to save new order' });
      loadCategories(); // Reload on error
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
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
        >
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category, index) => (
              <tr
                key={category.id}
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
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{category.id}</td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{category.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{category.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            No categories found. Create your first category!
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingCategory ? 'Edit Category' : 'Add Category'}
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

              <div className="flex justify-end space-x-4 pt-4">
                <TertiaryButton
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  disabled={submitting}
                >
                  Cancel
                </TertiaryButton>
                <PrimaryButton type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
