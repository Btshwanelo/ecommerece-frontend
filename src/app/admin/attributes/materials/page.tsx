"use client";

import { useState, useEffect } from "react";
import { Material } from "@/types";
import { AttributeService } from "@/services/v2";
import { PlusIcon, PencilIcon, TrashIcon, CubeIcon } from "@heroicons/react/24/outline";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    composition: [{ material: "", percentage: 100 }],
    isActive: true
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await AttributeService.getMaterials({ limit: 100 });
      console.log("Materials API Response:", response); // Debug log
      if (response.success) {
        // Handle different response structures
        let materialsData: any[] = [];
        
        if (response.data && Array.isArray(response.data)) {
          // Paginated response with data array
          materialsData = response.data;
        } else if ((response as any).materials && Array.isArray((response as any).materials)) {
          // Response with materials array
          materialsData = (response as any).materials;
        } else if ((response as any).material && typeof (response as any).material === 'object') {
          // Single material response (like after creation)
          materialsData = [(response as any).material];
        } else if (Array.isArray(response)) {
          // Direct array response
          materialsData = response;
        }
        
        console.log("Processed Materials Data:", materialsData); // Debug log
        // Filter out any invalid material objects
        const validMaterials = materialsData.filter((material: any) => material && typeof material === 'object');
        setMaterials(validMaterials);
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMaterial) {
        const response = await AttributeService.updateMaterial(editingMaterial._id, formData);
        console.log("Update response:", response); // Debug log
        if (response.success) {
          // Handle different response structures
          const updatedMaterial = response.data || (response as any).material;
          if (updatedMaterial) {
            setMaterials(materials.map(m => m._id === editingMaterial._id ? updatedMaterial : m));
          }
        }
      } else {
        const response = await AttributeService.createMaterial(formData);
        console.log("Create response:", response); // Debug log
        if (response.success) {
          // Handle different response structures
          const newMaterial = response.data || (response as any).material;
          if (newMaterial) {
            setMaterials([...materials, newMaterial]);
          }
        }
      }
      resetForm();
    } catch (error) {
      console.error("Error saving material:", error);
    }
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      slug: material.slug,
      description: material.description || "",
      composition: material.composition.length > 0 ? material.composition : [{ material: "", percentage: 100 }],
      isActive: material.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (materialId: string) => {
    if (!confirm("Are you sure you want to delete this material?")) return;
    
    try {
      const response = await AttributeService.deleteMaterial(materialId);
      console.log("Delete response:", response); // Debug log
      if (response.success) {
        setMaterials(materials.filter(m => m._id !== materialId));
      }
    } catch (error) {
      console.error("Error deleting material:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      composition: [{ material: "", percentage: 100 }],
      isActive: true
    });
    setEditingMaterial(null);
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

  const addCompositionItem = () => {
    setFormData(prev => ({
      ...prev,
      composition: [...prev.composition, { material: "", percentage: 0 }]
    }));
  };

  const removeCompositionItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      composition: prev.composition.filter((_, i) => i !== index)
    }));
  };

  const updateCompositionItem = (index: number, field: 'material' | 'percentage', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      composition: prev.composition.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Materials</h1>
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
          <h1 className="text-3xl font-bold text-gray-900">Materials</h1>
          <p className="text-gray-600">Manage product materials and composition</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Material
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingMaterial ? "Edit Material" : "Add New Material"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Cotton, Polyester, Leather"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Composition</label>
                  <div className="space-y-2">
                    {formData.composition.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={item.material}
                          onChange={(e) => updateCompositionItem(index, 'material', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Material name"
                        />
                        <input
                          type="number"
                          value={item.percentage}
                          onChange={(e) => updateCompositionItem(index, 'percentage', parseInt(e.target.value) || 0)}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="%"
                          min="0"
                          max="100"
                        />
                        <span className="text-sm text-gray-500">%</span>
                        {formData.composition.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCompositionItem(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addCompositionItem}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add composition item
                    </button>
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
                    {editingMaterial ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Materials List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map((material) => {
              // Safety check for material object
              if (!material || !material._id) {
                console.warn("Invalid material object:", material);
                return null;
              }
              
              return (
              <div key={material._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      <CubeIcon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{material.name || 'Unnamed Material'}</h3>
                      <p className="text-xs text-gray-500">{(material.composition || []).length} composition items</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(material)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Material"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(material._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Material"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {material.description && (
                  <p className="text-xs text-gray-500 mt-2">{material.description}</p>
                )}
                <div className="mt-2">
                  <div className="text-xs text-gray-600 mb-1">Composition:</div>
                  <div className="space-y-1">
                    {(material.composition || []).map((item, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-gray-700">{item.material || 'Unknown'}</span>
                        <span className="text-gray-500">{item.percentage || 0}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-2 flex justify-end">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    (material.isActive !== false) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {(material.isActive !== false) ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              );
            })}
          </div>
          
          {materials.length === 0 && (
            <div className="text-center py-8">
              <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No materials</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new material.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
