"use client";

import { useState, useEffect } from "react";
import { Size } from "@/types";
import { AttributeService } from "@/services/v2";
import { PlusIcon, PencilIcon, TrashIcon, TagIcon } from "@heroicons/react/24/outline";

const sizeCategories = [
  { value: "clothing", label: "Clothing" },
  { value: "shoes", label: "Shoes" },
  { value: "accessories", label: "Accessories" },
  { value: "jewelry", label: "Jewelry" },
  { value: "bags", label: "Bags" },
  { value: "watches", label: "Watches" }
];

export default function SizesPage() {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSize, setEditingSize] = useState<Size | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    category: "clothing",
    numericValue: 0,
    isActive: true
  });

  useEffect(() => {
    fetchSizes();
  }, []);

  const fetchSizes = async () => {
    try {
      setLoading(true);
      const response = await AttributeService.getSizes({ limit: 100 });
      console.log("Sizes API Response:", response); // Debug log
      if (response.success) {
        // Handle different response structures
        let sizesData: any[] = [];
        
        if (response.data && Array.isArray(response.data)) {
          // Paginated response with data array
          sizesData = response.data;
        } else if ((response as any).sizes && Array.isArray((response as any).sizes)) {
          // Response with sizes array
          sizesData = (response as any).sizes;
        } else if ((response as any).size && typeof (response as any).size === 'object') {
          // Single size response (like after creation)
          sizesData = [(response as any).size];
        } else if (Array.isArray(response)) {
          // Direct array response
          sizesData = response;
        }
        
        console.log("Processed Sizes Data:", sizesData); // Debug log
        // Filter out any invalid size objects
        const validSizes = sizesData.filter((size: any) => size && typeof size === 'object');
        setSizes(validSizes);
      }
    } catch (error) {
      console.error("Error fetching sizes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSize) {
        const response = await AttributeService.updateSize(editingSize._id, formData);
        console.log("Update response:", response); // Debug log
        if (response.success) {
          // Handle different response structures
          const updatedSize = response.data || (response as any).size;
          if (updatedSize) {
            setSizes(sizes.map(s => s._id === editingSize._id ? updatedSize : s));
          }
        }
      } else {
        const response = await AttributeService.createSize(formData);
        console.log("Create response:", response); // Debug log
        if (response.success) {
          // Handle different response structures
          const newSize = response.data || (response as any).size;
          if (newSize) {
            setSizes([...sizes, newSize]);
          }
        }
      }
      resetForm();
    } catch (error) {
      console.error("Error saving size:", error);
    }
  };

  const handleEdit = (size: Size) => {
    setEditingSize(size);
    setFormData({
      name: size.name,
      slug: size.slug,
      description: size.description || "",
      category: size.category,
      numericValue: size.numericValue || 0,
      isActive: size.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (sizeId: string) => {
    if (!confirm("Are you sure you want to delete this size?")) return;
    
    try {
      const response = await AttributeService.deleteSize(sizeId);
      console.log("Delete response:", response); // Debug log
      if (response.success) {
        setSizes(sizes.filter(s => s._id !== sizeId));
      }
    } catch (error) {
      console.error("Error deleting size:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      category: "clothing",
      numericValue: 0,
      isActive: true
    });
    setEditingSize(null);
    setShowForm(false);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      clothing: "bg-blue-100 text-blue-800",
      shoes: "bg-green-100 text-green-800",
      accessories: "bg-purple-100 text-purple-800",
      jewelry: "bg-yellow-100 text-yellow-800",
      bags: "bg-pink-100 text-pink-800",
      watches: "bg-indigo-100 text-indigo-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Sizes</h1>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sizes</h1>
          <p className="text-gray-600">Manage size options for different categories</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Size
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingSize ? "Edit Size" : "Add New Size"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Small, Medium, Large"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Optional description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {sizeCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Numeric Value</label>
                  <input
                    type="number"
                    value={formData.numericValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, numericValue: parseInt(e.target.value) || 0 }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional numeric value for sorting"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {editingSize ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sizes List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sizes.map((size) => {
              // Safety check for size object
              if (!size || !size._id) {
                console.warn("Invalid size object:", size);
                return null;
              }
              
              return (
              <div key={size._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      <TagIcon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{size.name || 'Unnamed Size'}</h3>
                      <p className="text-xs text-gray-500">{size.category || 'No category'}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(size)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Size"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(size._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Size"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {size.description && (
                  <p className="text-xs text-gray-500 mt-2">{size.description}</p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(size.category || 'clothing')}`}>
                    {sizeCategories.find(c => c.value === (size.category || 'clothing'))?.label || (size.category || 'clothing')}
                  </span>
                  <div className="flex items-center space-x-2">
                    {(size.numericValue || 0) > 0 && (
                      <span className="text-xs text-gray-400">#{size.numericValue}</span>
                    )}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      (size.isActive !== false) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {(size.isActive !== false) ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
          
          {sizes.length === 0 && (
            <div className="text-center py-8">
              <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No sizes</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new size.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
