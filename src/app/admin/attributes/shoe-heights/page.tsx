"use client";

import { useState, useEffect } from "react";
import { ShoeHeight } from "@/types";
import { AttributeService } from "@/services/v2";
import { PlusIcon, PencilIcon, TrashIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

export default function ShoeHeightsPage() {
  const [shoeHeights, setShoeHeights] = useState<ShoeHeight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingShoeHeight, setEditingShoeHeight] = useState<ShoeHeight | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true
  });

  useEffect(() => {
    fetchShoeHeights();
  }, []);

  const fetchShoeHeights = async () => {
    try {
      setLoading(true);
      const response = await AttributeService.getShoeHeights({ limit: 100 });
      console.log("Shoe Heights API Response:", response); // Debug log
      if (response.success) {
        // Handle different response structures
        let shoeHeightsData: any[] = [];
        
        if (response.data && Array.isArray(response.data)) {
          // Paginated response with data array
          shoeHeightsData = response.data;
        } else if ((response as any).shoeHeights && Array.isArray((response as any).shoeHeights)) {
          // Response with shoeHeights array (camelCase)
          shoeHeightsData = (response as any).shoeHeights;
        } else if ((response as any).shoeheights && Array.isArray((response as any).shoeheights)) {
          // Response with shoeheights array (lowercase)
          shoeHeightsData = (response as any).shoeheights;
        } else if ((response as any).shoeHeight && typeof (response as any).shoeHeight === 'object') {
          // Single shoeHeight response (like after creation)
          shoeHeightsData = [(response as any).shoeHeight];
        } else if (Array.isArray(response)) {
          // Direct array response
          shoeHeightsData = response;
        }
        
        console.log("Processed Shoe Heights Data:", shoeHeightsData); // Debug log
        // Filter out any invalid shoeHeight objects
        const validShoeHeights = shoeHeightsData.filter((shoeHeight: any) => shoeHeight && typeof shoeHeight === 'object');
        setShoeHeights(validShoeHeights);
      }
    } catch (error) {
      console.error("Error fetching shoe heights:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingShoeHeight) {
        const response = await AttributeService.updateShoeHeight(editingShoeHeight._id, formData);
        console.log("Update response:", response); // Debug log
        if (response.success) {
          // Handle different response structures
          const updatedShoeHeight = response.data || (response as any).shoeHeight || (response as any).shoeheight;
          if (updatedShoeHeight) {
            setShoeHeights(shoeHeights.map(sh => sh._id === editingShoeHeight._id ? updatedShoeHeight : sh));
          }
        }
      } else {
        const response = await AttributeService.createShoeHeight(formData);
        console.log("Create response:", response); // Debug log
        if (response.success) {
          // Handle different response structures
          const newShoeHeight = response.data || (response as any).shoeHeight || (response as any).shoeheight;
          if (newShoeHeight) {
            setShoeHeights([...shoeHeights, newShoeHeight]);
          }
        }
      }
      resetForm();
    } catch (error) {
      console.error("Error saving shoe height:", error);
    }
  };

  const handleEdit = (shoeHeight: ShoeHeight) => {
    setEditingShoeHeight(shoeHeight);
    setFormData({
      name: shoeHeight.name,
      slug: shoeHeight.slug,
      description: shoeHeight.description || "",
      isActive: shoeHeight.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (shoeHeightId: string) => {
    if (!confirm("Are you sure you want to delete this shoe height?")) return;
    
    try {
      const response = await AttributeService.deleteShoeHeight(shoeHeightId);
      console.log("Delete response:", response); // Debug log
      if (response.success) {
        setShoeHeights(shoeHeights.filter(sh => sh._id !== shoeHeightId));
      }
    } catch (error) {
      console.error("Error deleting shoe height:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      isActive: true
    });
    setEditingShoeHeight(null);
    setShowForm(false);
  };

  const getShoeHeightColor = (shoeHeightName: string) => {
    const name = shoeHeightName.toLowerCase();
    if (name.includes('flat') || name.includes('zero')) return 'bg-green-100 text-green-800';
    if (name.includes('low') || name.includes('1') || name.includes('2')) return 'bg-blue-100 text-blue-800';
    if (name.includes('medium') || name.includes('3') || name.includes('4')) return 'bg-yellow-100 text-yellow-800';
    if (name.includes('high') || name.includes('5') || name.includes('6')) return 'bg-orange-100 text-orange-800';
    if (name.includes('very high') || name.includes('7') || name.includes('8') || name.includes('9')) return 'bg-red-100 text-red-800';
    if (name.includes('platform') || name.includes('wedge')) return 'bg-purple-100 text-purple-800';
    if (name.includes('stiletto') || name.includes('pump')) return 'bg-pink-100 text-pink-800';
    if (name.includes('boot') || name.includes('ankle')) return 'bg-indigo-100 text-indigo-800';
    if (name.includes('knee') || name.includes('thigh')) return 'bg-gray-100 text-gray-800';
    return 'bg-cyan-100 text-cyan-800';
  };

  const getShoeHeightIcon = (shoeHeightName: string) => {
    const name = shoeHeightName.toLowerCase();
    if (name.includes('flat') || name.includes('zero')) return '👟';
    if (name.includes('low') || name.includes('1') || name.includes('2')) return '👡';
    if (name.includes('medium') || name.includes('3') || name.includes('4')) return '👠';
    if (name.includes('high') || name.includes('5') || name.includes('6')) return '👠';
    if (name.includes('very high') || name.includes('7') || name.includes('8') || name.includes('9')) return '👠';
    if (name.includes('platform') || name.includes('wedge')) return '👢';
    if (name.includes('stiletto') || name.includes('pump')) return '👠';
    if (name.includes('boot') || name.includes('ankle')) return '👢';
    if (name.includes('knee') || name.includes('thigh')) return '👢';
    return '👟';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Shoe Heights</h1>
        </div>
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shoe Heights</h1>
          <p className="text-gray-600">Manage shoe height categories (flats, low heels, high heels, etc.)</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Shoe Height
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingShoeHeight ? "Edit Shoe Height" : "Add New Shoe Height"}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Flat, Low Heel, High Heel, Platform, Stiletto"
                  />
                </div>

                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                    Slug *
                  </label>
                  <input
                    type="text"
                    id="slug"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., flat, low-heel, high-heel, platform, stiletto"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional description for this shoe height category"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
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
                    {editingShoeHeight ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Shoe Heights List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shoeHeights.map((shoeHeight) => {
              // Safety check for shoeHeight object
              if (!shoeHeight || !shoeHeight._id) {
                console.warn("Invalid shoeHeight object:", shoeHeight);
                return null;
              }
              
              return (
              <div key={shoeHeight._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                      <AcademicCapIcon className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{shoeHeight.name || 'Unnamed Shoe Height'}</h3>
                      <p className="text-xs text-gray-500">Shoe height category</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(shoeHeight)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Shoe Height"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(shoeHeight._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Shoe Height"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {shoeHeight.description && (
                  <p className="text-xs text-gray-500 mt-2">{shoeHeight.description}</p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getShoeHeightIcon(shoeHeight.name || '')}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getShoeHeightColor(shoeHeight.name || '')}`}>
                      {shoeHeight.name || 'Unknown'}
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    (shoeHeight.isActive !== false) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {(shoeHeight.isActive !== false) ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              );
            })}
          </div>
          
          {shoeHeights.length === 0 && (
            <div className="text-center py-8">
              <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No shoe heights</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new shoe height category.</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AcademicCapIcon className="h-5 w-5 text-amber-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">
              Shoe Height Categories
            </h3>
            <div className="mt-2 text-sm text-amber-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Shoe height categories help customers find footwear with specific heel heights</li>
                <li>Common heights include Flat, Low Heel, Medium Heel, High Heel, Platform, Stiletto, etc.</li>
                <li>Essential for shoe retailers, fashion stores, and footwear businesses</li>
                <li>Use clear, descriptive names that customers can easily understand</li>
                <li>Consider comfort levels and occasion appropriateness when categorizing</li>
                <li>Shoe heights can be combined with styles and occasions for advanced filtering</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Shoe Height Suggestions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AcademicCapIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800">
              Popular Shoe Height Suggestions
            </h3>
            <div className="mt-2 text-sm text-gray-600">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['Flat', 'Low Heel', 'Medium Heel', 'High Heel', 'Platform', 'Stiletto', 'Wedge', 'Boot'].map((suggestion) => (
                  <span key={suggestion} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-700">
                    {suggestion}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shoe Height Examples */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AcademicCapIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800">
              Shoe Height Examples & Visual Codes
            </h3>
            <div className="mt-2 text-sm text-gray-600">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: 'Flat', icon: '👟', color: 'bg-green-100 text-green-800' },
                  { name: 'Low Heel', icon: '👡', color: 'bg-blue-100 text-blue-800' },
                  { name: 'Medium Heel', icon: '👠', color: 'bg-yellow-100 text-yellow-800' },
                  { name: 'High Heel', icon: '👠', color: 'bg-orange-100 text-orange-800' },
                  { name: 'Very High Heel', icon: '👠', color: 'bg-red-100 text-red-800' },
                  { name: 'Platform', icon: '👢', color: 'bg-purple-100 text-purple-800' },
                  { name: 'Stiletto', icon: '👠', color: 'bg-pink-100 text-pink-800' },
                  { name: 'Boot', icon: '👢', color: 'bg-indigo-100 text-indigo-800' }
                ].map((shoeHeight) => (
                  <div key={shoeHeight.name} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <span className="text-lg">{shoeHeight.icon}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${shoeHeight.color}`}>
                      {shoeHeight.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Height Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AcademicCapIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Shoe Height Guide
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Height Categories:</h4>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li><strong>Flat (0-0.5")</strong> - Sneakers, flats, sandals</li>
                    <li><strong>Low Heel (0.5-2")</strong> - Comfortable everyday shoes</li>
                    <li><strong>Medium Heel (2-3")</strong> - Business and casual wear</li>
                    <li><strong>High Heel (3-4")</strong> - Formal and evening wear</li>
                    <li><strong>Very High Heel (4"+</strong> - Special occasions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium">Special Types:</h4>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li><strong>Platform</strong> - Thick sole with heel</li>
                    <li><strong>Wedge</strong> - Solid heel from back to front</li>
                    <li><strong>Stiletto</strong> - Thin, high heel</li>
                    <li><strong>Block Heel</strong> - Wide, stable heel</li>
                    <li><strong>Kitten Heel</strong> - Short, thin heel</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
