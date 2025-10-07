"use client";

import { useState, useEffect } from "react";
import { Style } from "@/types";
import { AttributeService } from "@/services/v2";
import { PlusIcon, PencilIcon, TrashIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function StylesPage() {
  const [styles, setStyles] = useState<Style[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStyle, setEditingStyle] = useState<Style | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true
  });

  useEffect(() => {
    fetchStyles();
  }, []);

  const fetchStyles = async () => {
    try {
      setLoading(true);
      const response = await AttributeService.getStyles({ limit: 100 });
      console.log("Styles API Response:", response); // Debug log
      if (response.success) {
        // Handle different response structures
        let stylesData: any[] = [];
        
        if (response.data && Array.isArray(response.data)) {
          // Paginated response with data array
          stylesData = response.data;
        } else if ((response as any).styles && Array.isArray((response as any).styles)) {
          // Response with styles array
          stylesData = (response as any).styles;
        } else if ((response as any).style && typeof (response as any).style === 'object') {
          // Single style response (like after creation)
          stylesData = [(response as any).style];
        } else if (Array.isArray(response)) {
          // Direct array response
          stylesData = response;
        }
        
        console.log("Processed Styles Data:", stylesData); // Debug log
        // Filter out any invalid style objects
        const validStyles = stylesData.filter((style: any) => style && typeof style === 'object');
        setStyles(validStyles);
      }
    } catch (error) {
      console.error("Error fetching styles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStyle) {
        const response = await AttributeService.updateStyle(editingStyle._id, formData);
        console.log("Update response:", response); // Debug log
        if (response.success) {
          // Handle different response structures
          const updatedStyle = response.data || (response as any).style;
          if (updatedStyle) {
            setStyles(styles.map(s => s._id === editingStyle._id ? updatedStyle : s));
          }
        }
      } else {
        const response = await AttributeService.createStyle(formData);
        console.log("Create response:", response); // Debug log
        if (response.success) {
          // Handle different response structures
          const newStyle = response.data || (response as any).style;
          if (newStyle) {
            setStyles([...styles, newStyle]);
          }
        }
      }
      resetForm();
    } catch (error) {
      console.error("Error saving style:", error);
    }
  };

  const handleEdit = (style: Style) => {
    setEditingStyle(style);
    setFormData({
      name: style.name,
      slug: style.slug,
      description: style.description || "",
      isActive: style.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (styleId: string) => {
    if (!confirm("Are you sure you want to delete this style?")) return;
    
    try {
      const response = await AttributeService.deleteStyle(styleId);
      console.log("Delete response:", response); // Debug log
      if (response.success) {
        setStyles(styles.filter(s => s._id !== styleId));
      }
    } catch (error) {
      console.error("Error deleting style:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      isActive: true
    });
    setEditingStyle(null);
    setShowForm(false);
  };

  const getStyleColor = (styleName: string) => {
    const name = styleName.toLowerCase();
    if (name.includes('casual')) return 'bg-green-100 text-green-800';
    if (name.includes('formal') || name.includes('business')) return 'bg-blue-100 text-blue-800';
    if (name.includes('sport') || name.includes('athletic')) return 'bg-orange-100 text-orange-800';
    if (name.includes('elegant') || name.includes('luxury')) return 'bg-purple-100 text-purple-800';
    if (name.includes('vintage') || name.includes('retro')) return 'bg-yellow-100 text-yellow-800';
    if (name.includes('street') || name.includes('urban')) return 'bg-gray-100 text-gray-800';
    if (name.includes('bohemian') || name.includes('boho')) return 'bg-pink-100 text-pink-800';
    return 'bg-indigo-100 text-indigo-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Styles</h1>
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
          <h1 className="text-3xl font-bold text-gray-900">Styles</h1>
          <p className="text-gray-600">Manage product styles (casual, formal, athletic, etc.)</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Style
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingStyle ? "Edit Style" : "Add New Style"}
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
                    placeholder="e.g., Casual, Formal, Athletic, Vintage"
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
                    placeholder="e.g., casual, formal, athletic, vintage"
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
                    placeholder="Optional description for this style category"
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
                    {editingStyle ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Styles List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {styles.map((style) => {
              // Safety check for style object
              if (!style || !style._id) {
                console.warn("Invalid style object:", style);
                return null;
              }
              
              return (
              <div key={style._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                      <SparklesIcon className="h-4 w-4 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{style.name || 'Unnamed Style'}</h3>
                      <p className="text-xs text-gray-500">Product style</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(style)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Style"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(style._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Style"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {style.description && (
                  <p className="text-xs text-gray-500 mt-2">{style.description}</p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStyleColor(style.name || '')}`}>
                    {style.name || 'Unknown'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    (style.isActive !== false) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {(style.isActive !== false) ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              );
            })}
          </div>
          
          {styles.length === 0 && (
            <div className="text-center py-8">
              <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No styles</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new style category.</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <SparklesIcon className="h-5 w-5 text-pink-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-pink-800">
              Style Categories
            </h3>
            <div className="mt-2 text-sm text-pink-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Style categories help customers find products that match their personal taste and occasion</li>
                <li>Common styles include Casual, Formal, Athletic, Vintage, Streetwear, Bohemian, etc.</li>
                <li>Products can be assigned to multiple styles if they fit different categories</li>
                <li>Use clear, descriptive names that customers can easily understand</li>
                <li>Consider your target audience when defining style categories</li>
                <li>Styles can be used for filtering, recommendations, and marketing campaigns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Style Suggestions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <SparklesIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800">
              Popular Style Suggestions
            </h3>
            <div className="mt-2 text-sm text-gray-600">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['Casual', 'Formal', 'Athletic', 'Vintage', 'Streetwear', 'Bohemian', 'Business', 'Elegant'].map((suggestion) => (
                  <span key={suggestion} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-700">
                    {suggestion}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
