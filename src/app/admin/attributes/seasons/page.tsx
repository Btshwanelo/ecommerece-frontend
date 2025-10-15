"use client";

import { useState, useEffect } from "react";
import { Season } from "@/types";
import { AttributeService } from "@/services/v2";
import { PlusIcon, PencilIcon, TrashIcon, SunIcon } from "@heroicons/react/24/outline";

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true
  });

  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    try {
      setLoading(true);
      const response = await AttributeService.getSeasons({ limit: 100 });
      console.log("Seasons API Response:", response); // Debug log
      if (response.success) {
        // Handle different response structures
        let seasonsData: any[] = [];
        
        if (response.data && Array.isArray(response.data)) {
          // Paginated response with data array
          seasonsData = response.data;
        } else if ((response as any).seasons && Array.isArray((response as any).seasons)) {
          // Response with seasons array
          seasonsData = (response as any).seasons;
        } else if ((response as any).season && typeof (response as any).season === 'object') {
          // Single season response (like after creation)
          seasonsData = [(response as any).season];
        } else if (Array.isArray(response)) {
          // Direct array response
          seasonsData = response;
        }
        
        console.log("Processed Seasons Data:", seasonsData); // Debug log
        // Filter out any invalid season objects
        const validSeasons = seasonsData.filter((season: any) => season && typeof season === 'object');
        setSeasons(validSeasons);
      }
    } catch (error) {
      console.error("Error fetching seasons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSeason) {
        const response = await AttributeService.updateSeason(editingSeason._id, formData);
        console.log("Update response:", response); // Debug log
        if (response.success) {
          // Handle different response structures
          const updatedSeason = response.data || (response as any).season;
          if (updatedSeason) {
            setSeasons(seasons.map(s => s._id === editingSeason._id ? updatedSeason : s));
          }
        }
      } else {
        const response = await AttributeService.createSeason(formData);
        console.log("Create response:", response); // Debug log
        if (response.success) {
          // Handle different response structures
          const newSeason = response.data || (response as any).season;
          if (newSeason) {
            setSeasons([...seasons, newSeason]);
          }
        }
      }
      resetForm();
    } catch (error) {
      console.error("Error saving season:", error);
    }
  };

  const handleEdit = (season: Season) => {
    setEditingSeason(season);
    setFormData({
      name: season.name,
      slug: season.slug,
      description: season.description || "",
      isActive: season.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (seasonId: string) => {
    if (!confirm("Are you sure you want to delete this season?")) return;
    
    try {
      const response = await AttributeService.deleteSeason(seasonId);
      console.log("Delete response:", response); // Debug log
      if (response.success) {
        setSeasons(seasons.filter(s => s._id !== seasonId));
      }
    } catch (error) {
      console.error("Error deleting season:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      isActive: true
    });
    setEditingSeason(null);
    setShowForm(false);
  };

  const getSeasonColor = (seasonName: string) => {
    const name = seasonName.toLowerCase();
    if (name.includes('spring')) return 'bg-green-100 text-green-800';
    if (name.includes('summer')) return 'bg-yellow-100 text-yellow-800';
    if (name.includes('autumn') || name.includes('fall')) return 'bg-orange-100 text-orange-800';
    if (name.includes('winter')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Seasons</h1>
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
          <h1 className="text-3xl font-bold text-gray-900">Seasons</h1>
          <p className="text-gray-600">Manage seasonal appropriateness for products</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Season
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingSeason ? "Edit Season" : "Add New Season"}
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
                    placeholder="e.g., Spring, Summer, Fall, Winter"
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
                    placeholder="e.g., spring, summer, fall, winter"
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
                    placeholder="Optional description for this season"
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
                    {editingSeason ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Seasons List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {seasons.map((season) => {
              // Safety check for season object
              if (!season || !season._id) {
                console.warn("Invalid season object:", season);
                return null;
              }
              
              return (
              <div key={season._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <SunIcon className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{season.name || 'Unnamed Season'}</h3>
                      <p className="text-xs text-gray-500">Seasonal category</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(season)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Season"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(season._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Season"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {season.description && (
                  <p className="text-xs text-gray-500 mt-2">{season.description}</p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeasonColor(season.name || '')}`}>
                    {season.name || 'Unknown'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    (season.isActive !== false) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {(season.isActive !== false) ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              );
            })}
          </div>
          
          {seasons.length === 0 && (
            <div className="text-center py-8">
              <SunIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No seasons</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new season category.</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <SunIcon className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Seasonal Categories
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Seasonal categories help customers find products appropriate for specific times of year</li>
                <li>Common categories include Spring, Summer, Fall/Autumn, Winter, and All-Season</li>
                <li>Products can be assigned to multiple seasons if they're suitable year-round</li>
                <li>Consider regional variations when setting up seasonal categories</li>
                <li>Use seasonal categories for inventory planning and marketing campaigns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


