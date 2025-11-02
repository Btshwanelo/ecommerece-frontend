"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Category, 
  Brand, 
  Product
} from "@/types";
import { 
  CategoryService, 
  BrandService, 
  ProductService
} from "@/services/v2";
import { PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  // V3 supports sizes array on the product itself
  const [productSizes, setProductSizes] = useState<Array<{name: string; stockQuantity: number; stockStatus: string}>>([]);
  // V3 product form data - only fields supported by v3
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    sku: "",
    categoryId: "",
    brandId: "",
    gender: "" as "" | "male" | "female" | "unisex", // V3 uses enum, not ID
    pricing: {
      basePrice: "",
      salePrice: "",
      costPrice: "",
      currency: "R" // V3 defaults to "R"
    },
    inventory: {
      trackInventory: true,
      stockQuantity: "",
      stockStatus: "in_stock" as "in_stock" | "out_of_stock" | "backorder",
      lowStockThreshold: "",
      allowBackorders: false
    },
    dimensions: {
      length: "",
      width: "",
      height: "",
      weight: "",
      unit: "cm"
    },
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: [] as string[]
    },
    status: "draft" as "draft" | "published" | "archived",
    visibility: "public" as "public" | "private" | "hidden",
  });

  // Fetch only v3-supported data (categories and brands)
  const fetchAllData = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        CategoryService.getCategories({ limit: 100 }),
        BrandService.getBrands({ limit: 100 }),
      ]);

      // Handle different response structures
      const extractData = (response: any, key: string) => {
        if (response.success) {
          if (response.data && Array.isArray(response.data)) {
            return response.data;
          } else if (response[key] && Array.isArray(response[key])) {
            return response[key];
          }
        }
        return [];
      };

      setCategories(extractData(categoriesRes, 'categories'));
      setBrands(extractData(brandsRes, 'brands'));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await ProductService.getProductById(productId);
      console.log("Product API Response:", response);

      if (response.success && response.product) {
        const product = response.product as any; // V3 product structure may differ from v2
        console.log("Product data:", product);

        // Map the v3 API response to form data
        setFormData({
          name: product.name || "",
          slug: product.slug || "",
          description: product.description || "",
          shortDescription: product.shortDescription || "",
          sku: product.sku || "",
          categoryId: typeof product.categoryId === 'object' ? product.categoryId._id : product.categoryId || "",
          brandId: typeof product.brandId === 'object' ? product.brandId._id : product.brandId || "",
          gender: product.gender || "", // V3 uses enum string, not ID
          pricing: {
            basePrice: product.pricing?.basePrice?.toString() || "",
            salePrice: product.pricing?.salePrice?.toString() || "",
            costPrice: product.pricing?.costPrice?.toString() || "",
            currency: product.pricing?.currency || "R"
          },
          inventory: {
            trackInventory: product.inventory?.trackInventory ?? true,
            stockQuantity: product.inventory?.stockQuantity?.toString() || "",
            stockStatus: product.inventory?.stockStatus || "in_stock",
            lowStockThreshold: product.inventory?.lowStockThreshold?.toString() || "",
            allowBackorders: product.inventory?.allowBackorders ?? false
          },
          dimensions: {
            length: product.dimensions?.length?.toString() || "",
            width: product.dimensions?.width?.toString() || "",
            height: product.dimensions?.height?.toString() || "",
            weight: product.dimensions?.weight?.toString() || "",
            unit: product.dimensions?.unit || "cm"
          },
          seo: {
            metaTitle: product.seo?.metaTitle || "",
            metaDescription: product.seo?.metaDescription || "",
            keywords: product.seo?.keywords || []
          },
          status: product.status || "draft",
          visibility: product.visibility || "public",
        });
        
        setExistingImages(product.images || []);
        
        // V3 uses sizes array on the product itself
        if (product.sizes && Array.isArray(product.sizes)) {
          setProductSizes(product.sizes.map((size: any) => ({
            name: size.name || "",
            stockQuantity: size.stockQuantity || 0,
            stockStatus: size.stockStatus || "in_stock"
          })));
        } else {
          setProductSizes([]);
        }
      } else {
        console.error("Failed to fetch product:", response.error);
        alert("Failed to fetch product");
        router.push("/admin/products");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      alert("Failed to fetch product");
      router.push("/admin/products");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAllData(), fetchProduct()]);
      setLoading(false);
    };
    loadData();
  }, [productId]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };

  const removeExistingImage = (imageIndex: number) => {
    setExistingImages(existingImages.filter((_, index) => index !== imageIndex));
  };

  // V3 supports sizes array on the product itself
  const addSize = () => {
    setProductSizes([...productSizes, { name: "", stockQuantity: 0, stockStatus: "in_stock" }]);
  };

  const removeSize = (index: number) => {
    setProductSizes(productSizes.filter((_, i) => i !== index));
  };

  const updateSize = (index: number, field: string, value: any) => {
    const updatedSizes = [...productSizes];
    updatedSizes[index] = { ...updatedSizes[index], [field]: value };
    setProductSizes(updatedSizes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Prepare product data - only v3-supported fields
      const productData = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        shortDescription: formData.shortDescription,
        sku: formData.sku,
        categoryId: formData.categoryId,
        brandId: formData.brandId || undefined,
        gender: formData.gender || undefined, // V3 uses enum string, not ID
        sizes: productSizes.length > 0 ? productSizes.map(size => ({
          name: size.name,
          stockQuantity: size.stockQuantity || 0,
          stockStatus: size.stockStatus || "in_stock"
        })) : undefined,
        pricing: {
          basePrice: parseFloat(formData.pricing.basePrice),
          salePrice: formData.pricing.salePrice ? parseFloat(formData.pricing.salePrice) : undefined,
          costPrice: formData.pricing.costPrice ? parseFloat(formData.pricing.costPrice) : undefined,
          currency: formData.pricing.currency
        },
        inventory: {
          trackInventory: formData.inventory.trackInventory,
          stockQuantity: parseInt(formData.inventory.stockQuantity) || 0,
          stockStatus: formData.inventory.stockStatus,
          lowStockThreshold: parseInt(formData.inventory.lowStockThreshold) || 0,
          allowBackorders: formData.inventory.allowBackorders
        },
        dimensions: formData.dimensions.length && formData.dimensions.width && formData.dimensions.height && formData.dimensions.weight ? {
          length: parseFloat(formData.dimensions.length),
          width: parseFloat(formData.dimensions.width),
          height: parseFloat(formData.dimensions.height),
          weight: parseFloat(formData.dimensions.weight),
          unit: formData.dimensions.unit
        } : undefined,
        seo: formData.seo.metaTitle ? {
          metaTitle: formData.seo.metaTitle,
          metaDescription: formData.seo.metaDescription,
          keywords: formData.seo.keywords
        } : undefined,
        status: formData.status,
        visibility: formData.visibility,
      };

      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add basic fields - only v3-supported fields
      formDataToSend.append('name', productData.name);
      formDataToSend.append('slug', productData.slug);
      formDataToSend.append('description', productData.description);
      if (productData.shortDescription) {
        formDataToSend.append('shortDescription', productData.shortDescription);
      }
      formDataToSend.append('sku', productData.sku);
      formDataToSend.append('categoryId', productData.categoryId);
      
      if (productData.brandId) {
        formDataToSend.append('brandId', productData.brandId);
      }
      if (productData.gender) {
        formDataToSend.append('gender', productData.gender); // V3 uses enum string, not ID
      }
      
      // Add sizes array if provided
      if (productData.sizes && productData.sizes.length > 0) {
        productData.sizes.forEach((size, index) => {
          formDataToSend.append(`sizes[${index}][name]`, size.name);
          formDataToSend.append(`sizes[${index}][stockQuantity]`, size.stockQuantity.toString());
          formDataToSend.append(`sizes[${index}][stockStatus]`, size.stockStatus);
        });
      }
      
      // Add pricing
      formDataToSend.append('pricing[basePrice]', productData.pricing.basePrice.toString());
      if (productData.pricing.salePrice) {
        formDataToSend.append('pricing[salePrice]', productData.pricing.salePrice.toString());
      }
      if (productData.pricing.costPrice) {
        formDataToSend.append('pricing[costPrice]', productData.pricing.costPrice.toString());
      }
      formDataToSend.append('pricing[currency]', productData.pricing.currency);
      
      // Add inventory
      formDataToSend.append('inventory[trackInventory]', productData.inventory.trackInventory.toString());
      formDataToSend.append('inventory[stockQuantity]', productData.inventory.stockQuantity.toString());
      formDataToSend.append('inventory[stockStatus]', productData.inventory.stockStatus);
      formDataToSend.append('inventory[lowStockThreshold]', productData.inventory.lowStockThreshold.toString());
      formDataToSend.append('inventory[allowBackorders]', productData.inventory.allowBackorders.toString());
      
      // Add dimensions if provided
      if (productData.dimensions) {
        formDataToSend.append('dimensions[length]', productData.dimensions.length.toString());
        formDataToSend.append('dimensions[width]', productData.dimensions.width.toString());
        formDataToSend.append('dimensions[height]', productData.dimensions.height.toString());
        formDataToSend.append('dimensions[weight]', productData.dimensions.weight.toString());
        formDataToSend.append('dimensions[unit]', productData.dimensions.unit);
      }
      
      // Add SEO if provided
      if (productData.seo) {
        formDataToSend.append('seo[metaTitle]', productData.seo.metaTitle);
        formDataToSend.append('seo[metaDescription]', productData.seo.metaDescription);
        if (productData.seo.keywords && productData.seo.keywords.length > 0) {
          productData.seo.keywords.forEach(keyword => {
            formDataToSend.append('seo[keywords][]', keyword);
          });
        }
      }
      
      // Add status and visibility
      formDataToSend.append('status', productData.status);
      formDataToSend.append('visibility', productData.visibility);

      // Add new images
      selectedImages.forEach((image, index) => {
        formDataToSend.append("images", image);
        console.log(`Added new image ${index + 1}:`, image.name, image.size, image.type);
      });

      // Debug: Log FormData contents
      console.log("FormData contents:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      // Update product using v3 API (ProductService.updateProductWithImages uses endpoints.products.update which points to /api/v3/products/:id)
      const response = await ProductService.updateProductWithImages(productId, formDataToSend);
      console.log("Product update response:", response);

      // V3 API returns { success: true, product } in response.data
      const responseData = response as any;
      if (responseData.success || responseData.product) {
        console.log("Product updated successfully:", response);
        
        // V3 doesn't support variants - sizes are handled via the sizes array on the product
        router.push("/admin/products");
      } else {
        console.error("Product update failed:", response.error);
        alert(`Failed to update product: ${response.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading product data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter SKU"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="product-slug (auto-generated if empty)"
                  />
                </div>

              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700">
                  Short Description
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Brief product description"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Detailed product description"
                />
              </div>
            </div>

            {/* Category and Brand */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Category & Brand</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Brand
                  </label>
                  <select
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select a brand</option>
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Product Attributes - V3 only supports gender as enum */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Attributes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Product Sizes - V3 supports sizes array */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Product Sizes</h3>
                <button
                  type="button"
                  onClick={addSize}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Size
                </button>
              </div>

              {productSizes.map((size, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-900">Size {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeSize(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Size Name</label>
                      <input
                        type="text"
                        value={size.name}
                        onChange={(e) => updateSize(index, 'name', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="e.g., S, M, L, XL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                      <input
                        type="number"
                        value={size.stockQuantity}
                        onChange={(e) => updateSize(index, 'stockQuantity', parseInt(e.target.value) || 0)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Stock Status</label>
                      <select
                        value={size.stockStatus}
                        onChange={(e) => updateSize(index, 'stockStatus', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="backorder">Backorder</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Base Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.pricing.basePrice}
                    onChange={(e) => setFormData({
                      ...formData,
                      pricing: { ...formData.pricing, basePrice: e.target.value }
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sale Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pricing.salePrice}
                    onChange={(e) => setFormData({
                      ...formData,
                      pricing: { ...formData.pricing, salePrice: e.target.value }
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Cost Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pricing.costPrice}
                    onChange={(e) => setFormData({
                      ...formData,
                      pricing: { ...formData.pricing, costPrice: e.target.value }
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.inventory.stockQuantity}
                    onChange={(e) => setFormData({
                      ...formData,
                      inventory: { ...formData.inventory, stockQuantity: e.target.value }
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Stock Status
                  </label>
                  <select
                    value={formData.inventory.stockStatus}
                    onChange={(e) => setFormData({
                      ...formData,
                      inventory: { ...formData.inventory, stockStatus: e.target.value as any }
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="backorder">Backorder</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.inventory.trackInventory}
                    onChange={(e) => setFormData({
                      ...formData,
                      inventory: { ...formData.inventory, trackInventory: e.target.checked }
                    })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Track Inventory</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.inventory.allowBackorders}
                    onChange={(e) => setFormData({
                      ...formData,
                      inventory: { ...formData.inventory, allowBackorders: e.target.checked }
                    })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Allow Backorders</span>
                </label>
              </div>
            </div>


            {/* Images */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Current Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image.url}
                          alt={image.alt || `Product image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* New Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add New Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Status and Visibility */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Status & Visibility</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Visibility
                  </label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push("/admin/products")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? "Updating..." : "Update Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}