"use client";

import { useState, useEffect } from "react";
import { Fit } from "@/types";
import { AttributeService } from "@/services/v2";
import { PlusIcon, PencilIcon, TrashIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";

export default function FitsPage() {
  const [fits, setFits] = useState<Fit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFit, setEditingFit] = useState<Fit | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true
  });

  useEffect(() => {
    fetchFits();
  }, []);

  const fetchFits = async () => {
    try {
      setLoading(true);
      const response = await AttributeService.getFits({ limit: 100 });
      console.log("Fits API Response:", response); // Debug log
      if (response.success) {
        // Handle different response structures
        let fitsData: any[] = [];
        
        if (response.data && Array.isArray(response.data)) {
          // Paginated response with data array
          fitsData = response.data;
        } else if ((response as any).fits && Array.isArray((response as any).fits)) {
          // Response with fits array (camelCase)
          fitsData = (response as any).fits;
        } else if ((response as any).fit && typeof (response as any).fit === 'object') {
          // Single fit response (like after creation)
          fitsData = [(response as any).fit];
        } else if (Array.isArray(response)) {
          // Direct array response
          fitsData = response;
        }
        
        console.log("Processed Fits Data:", fitsData); // Debug log
        // Filter out any invalid fit objects
        const validFits = fitsData.filter((fit: any) => fit && typeof fit === 'object');
        setFits(validFits);
      }
    } catch (error) {
      console.error("Error fetching fits:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFit) {
        const response = await AttributeService.updateFit(editingFit._id, formData);
        console.log("Update response:", response); // Debug log
        if (response.success) {
          // Handle different response structures
          const updatedFit = response.data || (response as any).fit;
          if (updatedFit) {
            setFits(fits.map(f => f._id === editingFit._id ? updatedFit : f));
          }
        }
      } else {
        const response = await AttributeService.createFit(formData);
        console.log("Create response:", response); // Debug log
        if (response.success) {
          // Handle different response structures
          const newFit = response.data || (response as any).fit;
          if (newFit) {
            setFits([...fits, newFit]);
          }
        }
      }
      resetForm();
    } catch (error) {
      console.error("Error saving fit:", error);
    }
  };

  const handleEdit = (fit: Fit) => {
    setEditingFit(fit);
    setFormData({
      name: fit.name,
      slug: fit.slug,
      description: fit.description || "",
      isActive: fit.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (fitId: string) => {
    if (!confirm("Are you sure you want to delete this fit?")) return;
    
    try {
      const response = await AttributeService.deleteFit(fitId);
      console.log("Delete response:", response); // Debug log
      if (response.success) {
        setFits(fits.filter(f => f._id !== fitId));
      }
    } catch (error) {
      console.error("Error deleting fit:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      isActive: true
    });
    setEditingFit(null);
    setShowForm(false);
  };

  const getFitColor = (fitName: string) => {
    const name = fitName.toLowerCase();
    if (name.includes('slim') || name.includes('tight')) return 'bg-red-100 text-red-800';
    if (name.includes('regular') || name.includes('standard')) return 'bg-blue-100 text-blue-800';
    if (name.includes('loose') || name.includes('relaxed')) return 'bg-green-100 text-green-800';
    if (name.includes('oversized') || name.includes('baggy')) return 'bg-purple-100 text-purple-800';
    if (name.includes('fitted') || name.includes('tailored')) return 'bg-pink-100 text-pink-800';
    if (name.includes('comfort') || name.includes('easy')) return 'bg-yellow-100 text-yellow-800';
    if (name.includes('athletic') || name.includes('performance')) return 'bg-orange-100 text-orange-800';
    if (name.includes('classic') || name.includes('traditional')) return 'bg-indigo-100 text-indigo-800';
    if (name.includes('modern') || name.includes('contemporary')) return 'bg-teal-100 text-teal-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getFitIcon = (fitName: string) => {
    const name = fitName.toLowerCase();
    if (name.includes('slim') || name.includes('tight')) return '📏';
    if (name.includes('regular') || name.includes('standard')) return '📐';
    if (name.includes('loose') || name.includes('relaxed')) return '📏';
    if (name.includes('oversized') || name.includes('baggy')) return '📏';
    if (name.includes('fitted') || name.includes('tailored')) return '✂️';
    if (name.includes('comfort') || name.includes('easy')) return '😌';
    if (name.includes('athletic') || name.includes('performance')) return '🏃';
    if (name.includes('classic') || name.includes('traditional')) return '👔';
    if (name.includes('modern') || name.includes('contemporary')) return '✨';
    return '📏';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Fits</h1>
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
          <h1 className="text-3xl font-bold text-gray-900">Fits</h1>
          <p className="text-gray-600">Manage product fit categories (slim, regular, loose, etc.)</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Fit
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingFit ? "Edit Fit" : "Add New Fit"}
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
                    placeholder="e.g., Slim, Regular, Loose, Oversized, Fitted"
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
                    placeholder="e.g., slim, regular, loose, oversized, fitted"
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
                    placeholder="Optional description for this fit category"
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
                    {editingFit ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Fits List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fits.map((fit) => {
              // Safety check for fit object
              if (!fit || !fit._id) {
                console.warn("Invalid fit object:", fit);
                return null;
              }
              
              return (
              <div key={fit._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                      <AdjustmentsHorizontalIcon className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{fit.name || 'Unnamed Fit'}</h3>
                      <p className="text-xs text-gray-500">Product fit category</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(fit)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Fit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(fit._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Fit"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {fit.description && (
                  <p className="text-xs text-gray-500 mt-2">{fit.description}</p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getFitIcon(fit.name || '')}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFitColor(fit.name || '')}`}>
                      {fit.name || 'Unknown'}
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    (fit.isActive !== false) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {(fit.isActive !== false) ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              );
            })}
          </div>
          
          {fits.length === 0 && (
            <div className="text-center py-8">
              <AdjustmentsHorizontalIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No fits</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new fit category.</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-emerald-800">
              Fit Categories
            </h3>
            <div className="mt-2 text-sm text-emerald-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Fit categories help customers find products that match their preferred fit and comfort level</li>
                <li>Common fits include Slim, Regular, Loose, Oversized, Fitted, Comfort, Athletic, etc.</li>
                <li>Essential for clothing, footwear, and accessories that come in different fits</li>
                <li>Use clear, descriptive names that customers can easily understand</li>
                <li>Consider body types and comfort preferences when categorizing fits</li>
                <li>Fits can be combined with sizes and styles for advanced filtering</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Fit Suggestions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800">
              Popular Fit Suggestions
            </h3>
            <div className="mt-2 text-sm text-gray-600">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['Slim', 'Regular', 'Loose', 'Oversized', 'Fitted', 'Comfort', 'Athletic', 'Classic'].map((suggestion) => (
                  <span key={suggestion} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-700">
                    {suggestion}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fit Examples */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800">
              Fit Examples & Visual Codes
            </h3>
            <div className="mt-2 text-sm text-gray-600">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: 'Slim', icon: '📏', color: 'bg-red-100 text-red-800' },
                  { name: 'Regular', icon: '📐', color: 'bg-blue-100 text-blue-800' },
                  { name: 'Loose', icon: '📏', color: 'bg-green-100 text-green-800' },
                  { name: 'Oversized', icon: '📏', color: 'bg-purple-100 text-purple-800' },
                  { name: 'Fitted', icon: '✂️', color: 'bg-pink-100 text-pink-800' },
                  { name: 'Comfort', icon: '😌', color: 'bg-yellow-100 text-yellow-800' },
                  { name: 'Athletic', icon: '🏃', color: 'bg-orange-100 text-orange-800' },
                  { name: 'Classic', icon: '👔', color: 'bg-indigo-100 text-indigo-800' }
                ].map((fit) => (
                  <div key={fit.name} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <span className="text-lg">{fit.icon}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${fit.color}`}>
                      {fit.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fit Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Fit Guide
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Fit Categories:</h4>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li><strong>Slim</strong> - Close-fitting, tapered silhouette</li>
                    <li><strong>Regular</strong> - Standard fit, balanced proportions</li>
                    <li><strong>Loose</strong> - Relaxed fit, extra room</li>
                    <li><strong>Oversized</strong> - Intentionally large, baggy style</li>
                    <li><strong>Fitted</strong> - Tailored, body-hugging fit</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium">Special Fits:</h4>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li><strong>Comfort</strong> - Easy, relaxed fit for comfort</li>
                    <li><strong>Athletic</strong> - Performance-oriented fit</li>
                    <li><strong>Classic</strong> - Traditional, timeless fit</li>
                    <li><strong>Modern</strong> - Contemporary, updated fit</li>
                    <li><strong>Tailored</strong> - Custom-fitted appearance</li>
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
