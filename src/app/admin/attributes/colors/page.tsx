"use client";

import { useState, useEffect } from "react";
import { Color } from "@/types";
import { AttributeService } from "@/services/v2";
import { PlusIcon, PencilIcon, TrashIcon, SwatchIcon } from "@heroicons/react/24/outline";

export default function ColorsPage() {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    hexCode: "#000000",
    rgbCode: "rgb(0, 0, 0)",
    isActive: true
  });

  useEffect(() => {
    fetchColors();
  }, []);

  const fetchColors = async () => {
    try {
      setLoading(true);
      const response = await AttributeService.getColors({ limit: 100 });
      console.log("Colors API Response:", response); // Debug log
      if (response.success) {
        // Handle different response structures
        let colorsData: Color[] = [];
        
        if (response.data && Array.isArray(response.data)) {
          // Paginated response with data array
          colorsData = response.data;
        } else if ((response as any).colors && Array.isArray((response as any).colors)) {
          // Response with colors array
          colorsData = (response as any).colors;
        } else if ((response as any).color && typeof (response as any).color === 'object') {
          // Single color response (like after creation)
          colorsData = [(response as any).color];
        } else if (Array.isArray(response)) {
          // Direct array response
          colorsData = response;
        }
        
        console.log("Processed Colors Data:", colorsData); // Debug log
        // Filter out any invalid color objects
        const validColors = colorsData.filter(color => color && typeof color === 'object');
        setColors(validColors);
      }
    } catch (error) {
      console.error("Error fetching colors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingColor) {
        const response = await AttributeService.updateColor(editingColor._id, formData);
        console.log("Update response:", response); // Debug log
        if (response.success) {
          // Handle different response structures
          const updatedColor = response.data || (response as any).color;
          if (updatedColor) {
            setColors(colors.map(c => c._id === editingColor._id ? updatedColor : c));
          }
        }
      } else {
        const response = await AttributeService.createColor(formData);
        console.log("Create response:", response); // Debug log
        if (response.success) {
          // Handle different response structures
          const newColor = response.data || (response as any).color;
          if (newColor) {
            setColors([...colors, newColor]);
          }
        }
      }
      resetForm();
    } catch (error) {
      console.error("Error saving color:", error);
    }
  };

  const handleEdit = (color: Color) => {
    setEditingColor(color);
    setFormData({
      name: color.name,
      slug: color.slug,
      description: color.description || "",
      hexCode: color.hexCode,
      rgbCode: color.rgbCode,
      isActive: color.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (colorId: string) => {
    if (!confirm("Are you sure you want to delete this color?")) return;
    
    try {
      const response = await AttributeService.deleteColor(colorId);
      console.log("Delete response:", response); // Debug log
      if (response.success) {
        setColors(colors.filter(c => c._id !== colorId));
      }
    } catch (error) {
      console.error("Error deleting color:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      hexCode: "#000000",
      rgbCode: "rgb(0, 0, 0)",
      isActive: true
    });
    setEditingColor(null);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Colors</h1>
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
          <h1 className="text-3xl font-bold text-gray-900">Colors</h1>
          <p className="text-gray-600">Manage product colors with hex codes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Color
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingColor ? "Edit Color" : "Add New Color"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hex Code</label>
                    <div className="flex">
                      <input
                        type="color"
                        value={formData.hexCode}
                        onChange={(e) => {
                          const hex = e.target.value;
                          const rgb = hexToRgb(hex);
                          setFormData(prev => ({
                            ...prev,
                            hexCode: hex,
                            rgbCode: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
                          }));
                        }}
                        className="mt-1 h-10 w-16 border border-gray-300 rounded-l-md"
                      />
                      <input
                        type="text"
                        value={formData.hexCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, hexCode: e.target.value }))}
                        className="mt-1 flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">RGB Code</label>
                    <input
                      type="text"
                      value={formData.rgbCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, rgbCode: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="rgb(0, 0, 0)"
                    />
                  </div>
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
                    {editingColor ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Colors List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colors.map((color) => {
              // Safety check for color object
              if (!color || !color._id) {
                console.warn("Invalid color object:", color);
                return null;
              }
              
              return (
              <div key={color._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-8 h-8 rounded-full border border-gray-300 mr-3"
                      style={{ backgroundColor: color.hexCode || '#000000' }}
                    ></div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{color.name || 'Unnamed Color'}</h3>
                      <p className="text-xs text-gray-500">{color.hexCode || 'No hex code'}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(color)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Color"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(color._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Color"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {color.description && (
                  <p className="text-xs text-gray-500 mt-2">{color.description}</p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    (color.isActive !== false) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {(color.isActive !== false) ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-gray-400">{color.rgbCode || 'No RGB code'}</span>
                </div>
              </div>
              );
            })}
          </div>
          
          {colors.length === 0 && (
            <div className="text-center py-8">
              <SwatchIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No colors</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new color.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}
