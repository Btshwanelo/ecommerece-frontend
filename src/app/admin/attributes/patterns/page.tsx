"use client";

import { useState, useEffect } from "react";
import { Pattern } from "@/types";
import { AttributeService } from "@/services/v2";
import { PlusIcon, PencilIcon, TrashIcon, SwatchIcon } from "@heroicons/react/24/outline";

export default function PatternsPage() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPattern, setEditingPattern] = useState<Pattern | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true
  });

  useEffect(() => {
    fetchPatterns();
  }, []);

  const fetchPatterns = async () => {
    try {
      setLoading(true);
      const response = await AttributeService.getPatterns({ limit: 100 });
      console.log("Patterns API Response:", response); // Debug log
      if (response.success) {
        // Handle different response structures
        let patternsData: any[] = [];
        
        if (response.data && Array.isArray(response.data)) {
          // Paginated response with data array
          patternsData = response.data;
        } else if ((response as any).patterns && Array.isArray((response as any).patterns)) {
          // Response with patterns array
          patternsData = (response as any).patterns;
        } else if ((response as any).pattern && typeof (response as any).pattern === 'object') {
          // Single pattern response (like after creation)
          patternsData = [(response as any).pattern];
        } else if (Array.isArray(response)) {
          // Direct array response
          patternsData = response;
        }
        
        console.log("Processed Patterns Data:", patternsData); // Debug log
        // Filter out any invalid pattern objects
        const validPatterns = patternsData.filter((pattern: any) => pattern && typeof pattern === 'object');
        setPatterns(validPatterns);
      }
    } catch (error) {
      console.error("Error fetching patterns:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPattern) {
        const response = await AttributeService.updatePattern(editingPattern._id, formData);
        console.log("Update response:", response); // Debug log
        if (response.success) {
          // Handle different response structures
          const updatedPattern = response.data || (response as any).pattern;
          if (updatedPattern) {
            setPatterns(patterns.map(p => p._id === editingPattern._id ? updatedPattern : p));
          }
        }
      } else {
        const response = await AttributeService.createPattern(formData);
        console.log("Create response:", response); // Debug log
        if (response.success) {
          // Handle different response structures
          const newPattern = response.data || (response as any).pattern;
          if (newPattern) {
            setPatterns([...patterns, newPattern]);
          }
        }
      }
      resetForm();
    } catch (error) {
      console.error("Error saving pattern:", error);
    }
  };

  const handleEdit = (pattern: Pattern) => {
    setEditingPattern(pattern);
    setFormData({
      name: pattern.name,
      slug: pattern.slug,
      description: pattern.description || "",
      isActive: pattern.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (patternId: string) => {
    if (!confirm("Are you sure you want to delete this pattern?")) return;
    
    try {
      const response = await AttributeService.deletePattern(patternId);
      console.log("Delete response:", response); // Debug log
      if (response.success) {
        setPatterns(patterns.filter(p => p._id !== patternId));
      }
    } catch (error) {
      console.error("Error deleting pattern:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      isActive: true
    });
    setEditingPattern(null);
    setShowForm(false);
  };

  const getPatternColor = (patternName: string) => {
    const name = patternName.toLowerCase();
    if (name.includes('striped') || name.includes('stripe')) return 'bg-blue-100 text-blue-800';
    if (name.includes('polka') || name.includes('dot')) return 'bg-pink-100 text-pink-800';
    if (name.includes('floral') || name.includes('flower')) return 'bg-green-100 text-green-800';
    if (name.includes('geometric') || name.includes('triangle') || name.includes('square')) return 'bg-purple-100 text-purple-800';
    if (name.includes('animal') || name.includes('leopard') || name.includes('zebra')) return 'bg-orange-100 text-orange-800';
    if (name.includes('plaid') || name.includes('tartan')) return 'bg-red-100 text-red-800';
    if (name.includes('paisley') || name.includes('swirl')) return 'bg-indigo-100 text-indigo-800';
    if (name.includes('solid') || name.includes('plain')) return 'bg-gray-100 text-gray-800';
    if (name.includes('checkered') || name.includes('check')) return 'bg-yellow-100 text-yellow-800';
    if (name.includes('abstract') || name.includes('artistic')) return 'bg-teal-100 text-teal-800';
    return 'bg-cyan-100 text-cyan-800';
  };

  const getPatternIcon = (patternName: string) => {
    const name = patternName.toLowerCase();
    if (name.includes('striped') || name.includes('stripe')) return '▬▬▬';
    if (name.includes('polka') || name.includes('dot')) return '●●●';
    if (name.includes('floral') || name.includes('flower')) return '❀❀❀';
    if (name.includes('geometric') || name.includes('triangle')) return '▲▲▲';
    if (name.includes('animal') || name.includes('leopard')) return '◉◉◉';
    if (name.includes('plaid') || name.includes('tartan')) return '▦▦▦';
    if (name.includes('paisley') || name.includes('swirl')) return '◐◑◒';
    if (name.includes('solid') || name.includes('plain')) return '■■■';
    if (name.includes('checkered') || name.includes('check')) return '▣▣▣';
    if (name.includes('abstract') || name.includes('artistic')) return '◈◈◈';
    return '◊◊◊';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Patterns</h1>
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
          <h1 className="text-3xl font-bold text-gray-900">Patterns</h1>
          <p className="text-gray-600">Manage product patterns (stripes, polka dots, floral, etc.)</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Pattern
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingPattern ? "Edit Pattern" : "Add New Pattern"}
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
                    placeholder="e.g., Striped, Polka Dots, Floral, Geometric"
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
                    placeholder="e.g., striped, polka-dots, floral, geometric"
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
                    placeholder="Optional description for this pattern type"
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
                    {editingPattern ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Patterns List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patterns.map((pattern) => {
              // Safety check for pattern object
              if (!pattern || !pattern._id) {
                console.warn("Invalid pattern object:", pattern);
                return null;
              }
              
              return (
              <div key={pattern._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center mr-3">
                      <SwatchIcon className="h-4 w-4 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{pattern.name || 'Unnamed Pattern'}</h3>
                      <p className="text-xs text-gray-500">Product pattern</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(pattern)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Pattern"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(pattern._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Pattern"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {pattern.description && (
                  <p className="text-xs text-gray-500 mt-2">{pattern.description}</p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-mono">{getPatternIcon(pattern.name || '')}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPatternColor(pattern.name || '')}`}>
                      {pattern.name || 'Unknown'}
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    (pattern.isActive !== false) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {(pattern.isActive !== false) ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              );
            })}
          </div>
          
          {patterns.length === 0 && (
            <div className="text-center py-8">
              <SwatchIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No patterns</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new pattern category.</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <SwatchIcon className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-cyan-800">
              Pattern Categories
            </h3>
            <div className="mt-2 text-sm text-cyan-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Pattern categories help customers find products with specific visual designs</li>
                <li>Common patterns include Stripes, Polka Dots, Floral, Geometric, Animal Prints, etc.</li>
                <li>Patterns are essential for fashion, home decor, and textile products</li>
                <li>Use clear, descriptive names that customers can easily recognize</li>
                <li>Consider seasonal trends when adding new pattern categories</li>
                <li>Patterns can be combined with colors and styles for advanced filtering</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Pattern Suggestions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <SwatchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800">
              Popular Pattern Suggestions
            </h3>
            <div className="mt-2 text-sm text-gray-600">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['Striped', 'Polka Dots', 'Floral', 'Geometric', 'Animal Print', 'Plaid', 'Paisley', 'Solid'].map((suggestion) => (
                  <span key={suggestion} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-700">
                    {suggestion}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pattern Examples */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <SwatchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800">
              Pattern Examples & Visual Codes
            </h3>
            <div className="mt-2 text-sm text-gray-600">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: 'Striped', icon: '▬▬▬', color: 'bg-blue-100 text-blue-800' },
                  { name: 'Polka Dots', icon: '●●●', color: 'bg-pink-100 text-pink-800' },
                  { name: 'Floral', icon: '❀❀❀', color: 'bg-green-100 text-green-800' },
                  { name: 'Geometric', icon: '▲▲▲', color: 'bg-purple-100 text-purple-800' },
                  { name: 'Animal Print', icon: '◉◉◉', color: 'bg-orange-100 text-orange-800' },
                  { name: 'Plaid', icon: '▦▦▦', color: 'bg-red-100 text-red-800' },
                  { name: 'Paisley', icon: '◐◑◒', color: 'bg-indigo-100 text-indigo-800' },
                  { name: 'Solid', icon: '■■■', color: 'bg-gray-100 text-gray-800' }
                ].map((pattern) => (
                  <div key={pattern.name} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <span className="text-lg font-mono">{pattern.icon}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${pattern.color}`}>
                      {pattern.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
