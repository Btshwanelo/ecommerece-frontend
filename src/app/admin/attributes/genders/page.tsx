"use client";

import { useState, useEffect } from "react";
import { Gender } from "@/types";
import { AttributeService } from "@/services/v2";
import { PlusIcon, PencilIcon, TrashIcon, UserGroupIcon } from "@heroicons/react/24/outline";

export default function GendersPage() {
  const [genders, setGenders] = useState<Gender[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGender, setEditingGender] = useState<Gender | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true
  });

  useEffect(() => {
    fetchGenders();
  }, []);

  const fetchGenders = async () => {
    try {
      setLoading(true);
      const response = await AttributeService.getGenders({ limit: 100 });
      console.log("Genders API Response:", response); // Debug log
      if (response.success) {
        // Handle different response structures
        let gendersData: Gender[] = [];
        
        if (response.data && Array.isArray(response.data)) {
          // Paginated response with data array
          gendersData = response.data;
        } else if ((response as any).genders && Array.isArray((response as any).genders)) {
          // Response with genders array
          gendersData = (response as any).genders;
        } else if ((response as any).gender && typeof (response as any).gender === 'object') {
          // Single gender response (like after creation)
          gendersData = [(response as any).gender];
        } else if (Array.isArray(response)) {
          // Direct array response
          gendersData = response;
        }
        
        console.log("Processed Genders Data:", gendersData); // Debug log
        // Filter out any invalid gender objects
        const validGenders = gendersData.filter((gender: Gender) => gender && typeof gender === 'object');
        setGenders(validGenders);
      }
    } catch (error) {
      console.error("Error fetching genders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGender) {
        const response = await AttributeService.updateGender(editingGender._id, formData);
        console.log("Update response:", response); // Debug log
        if (response.success) {
          // Handle different response structures
          const updatedGender = response.data || (response as any).gender;
          if (updatedGender) {
            setGenders(genders.map(g => g._id === editingGender._id ? updatedGender : g));
          }
        }
      } else {
        const response = await AttributeService.createGender(formData);
        console.log("Create response:", response); // Debug log
        if (response.success) {
          // Handle different response structures
          const newGender = response.data || (response as any).gender;
          if (newGender) {
            setGenders([...genders, newGender]);
          }
        }
      }
      resetForm();
    } catch (error) {
      console.error("Error saving gender:", error);
    }
  };

  const handleEdit = (gender: Gender) => {
    setEditingGender(gender);
    setFormData({
      name: gender.name,
      slug: gender.slug,
      description: gender.description || "",
      isActive: gender.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (genderId: string) => {
    if (!confirm("Are you sure you want to delete this gender?")) return;
    
    try {
      const response = await AttributeService.deleteGender(genderId);
      console.log("Delete response:", response); // Debug log
      if (response.success) {
        setGenders(genders.filter(g => g._id !== genderId));
      }
    } catch (error) {
      console.error("Error deleting gender:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      isActive: true
    });
    setEditingGender(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Genders</h1>
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
          <h1 className="text-3xl font-bold text-gray-900">Genders</h1>
          <p className="text-gray-600">Manage target gender categories for products</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Gender
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingGender ? "Edit Gender" : "Add New Gender"}
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
                    placeholder="e.g., Men, Women, Unisex"
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
                    placeholder="e.g., men, women, unisex"
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
                    placeholder="Optional description for this gender category"
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
                    {editingGender ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Genders List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {genders.map((gender) => {
              // Safety check for gender object
              if (!gender || !gender._id) {
                console.warn("Invalid gender object:", gender);
                return null;
              }
              
              return (
              <div key={gender._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <UserGroupIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{gender.name || 'Unnamed Gender'}</h3>
                      <p className="text-xs text-gray-500">Target audience</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(gender)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Gender"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(gender._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Gender"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {gender.description && (
                  <p className="text-xs text-gray-500 mt-2">{gender.description}</p>
                )}
                <div className="mt-2 flex justify-end">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    (gender.isActive !== false) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {(gender.isActive !== false) ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              );
            })}
          </div>
          
          {genders.length === 0 && (
            <div className="text-center py-8">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No genders</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new gender category.</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <UserGroupIcon className="h-5 w-5 text-purple-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-purple-800">
              Gender Categories
            </h3>
            <div className="mt-2 text-sm text-purple-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Gender categories help customers find products designed for their target audience</li>
                <li>Common categories include Men, Women, Unisex, Kids, etc.</li>
                <li>Products can be assigned to multiple gender categories if applicable</li>
                <li>Use clear, inclusive naming conventions for better user experience</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


