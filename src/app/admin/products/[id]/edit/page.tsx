"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Category, 
  Brand, 
  Product, 
  ProductVariant,
  Color,
  Size,
  Material,
  Gender,
  Season,
  Style,
  Pattern,
  ShoeHeight,
  Fit,
  Occasion,
  CollarType
} from "@/types";
import { 
  CategoryService, 
  BrandService, 
  ProductService,
  AttributeService 
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
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [genders, setGenders] = useState<Gender[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [shoeHeights, setShoeHeights] = useState<ShoeHeight[]>([]);
  const [fits, setFits] = useState<Fit[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [collarTypes, setCollarTypes] = useState<CollarType[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    sku: "",
    productType: "simple" as "simple" | "variable" | "grouped" | "virtual" | "downloadable",
    categoryId: "",
    brandId: "",
    genderId: "",
    seasonId: "",
    styleId: "",
    materialIds: [] as string[],
    patternId: "",
    shoeHeightId: "",
    fitId: "",
    occasionIds: [] as string[],
    collarTypeId: "",
    pricing: {
      basePrice: "",
      salePrice: "",
      costPrice: "",
      currency: "USD"
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
    tags: [] as string[],
  });

  const fetchAllData = async () => {
    try {
      const [
        categoriesRes,
        brandsRes,
        colorsRes,
        sizesRes,
        materialsRes,
        gendersRes,
        seasonsRes,
        stylesRes,
        patternsRes,
        shoeHeightsRes,
        fitsRes,
        occasionsRes,
        collarTypesRes
      ] = await Promise.all([
        CategoryService.getCategories({ limit: 100 }),
        BrandService.getBrands({ limit: 100 }),
        AttributeService.getColors({ limit: 100 }),
        AttributeService.getSizes({ limit: 100 }),
        AttributeService.getMaterials({ limit: 100 }),
        AttributeService.getGenders({ limit: 100 }),
        AttributeService.getSeasons({ limit: 100 }),
        AttributeService.getStyles({ limit: 100 }),
        AttributeService.getPatterns({ limit: 100 }),
        AttributeService.getShoeHeights({ limit: 100 }),
        AttributeService.getFits({ limit: 100 }),
        AttributeService.getOccasions({ limit: 100 }),
        AttributeService.getCollarTypes({ limit: 100 })
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
      setColors(extractData(colorsRes, 'colors'));
      setSizes(extractData(sizesRes, 'sizes'));
      setMaterials(extractData(materialsRes, 'materials'));
      setGenders(extractData(gendersRes, 'genders'));
      setSeasons(extractData(seasonsRes, 'seasons'));
      setStyles(extractData(stylesRes, 'styles'));
      setPatterns(extractData(patternsRes, 'patterns'));
      setShoeHeights(extractData(shoeHeightsRes, 'shoeHeights'));
      setFits(extractData(fitsRes, 'fits'));
      setOccasions(extractData(occasionsRes, 'occasions'));
      setCollarTypes(extractData(collarTypesRes, 'collarTypes'));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await ProductService.getProductById(productId);
      console.log("Product API Response:", response);

      if (response.success && response.product) {
        const product = response.product;
        console.log("Product data:", product);

        // Map the API response to form data
        setFormData({
          name: product.name || "",
          slug: product.slug || "",
          description: product.description || "",
          shortDescription: product.shortDescription || "",
          sku: product.sku || "",
          productType: product.productType || "simple",
          categoryId: typeof product.categoryId === 'object' ? product.categoryId._id : product.categoryId || "",
          brandId: typeof product.brandId === 'object' ? product.brandId._id : product.brandId || "",
          genderId: typeof product.genderId === 'object' ? product.genderId._id : product.genderId || "",
          seasonId: typeof product.seasonId === 'object' ? product.seasonId._id : product.seasonId || "",
          styleId: typeof product.styleId === 'object' ? product.styleId._id : product.styleId || "",
          materialIds: Array.isArray(product.materialIds) ? product.materialIds.map((material: any) => 
            typeof material === 'object' ? material._id : material
          ) : [],
          patternId: typeof product.patternId === 'object' ? product.patternId._id : product.patternId || "",
          shoeHeightId: typeof product.shoeHeightId === 'object' ? product.shoeHeightId._id : product.shoeHeightId || "",
          fitId: typeof product.fitId === 'object' ? product.fitId._id : product.fitId || "",
          occasionIds: Array.isArray(product.occasionIds) ? product.occasionIds.map((occasion: any) => 
            typeof occasion === 'object' ? occasion._id : occasion
          ) : [],
          collarTypeId: typeof product.collarTypeId === 'object' ? product.collarTypeId._id : product.collarTypeId || "",
          pricing: {
            basePrice: product.pricing?.basePrice?.toString() || "",
            salePrice: product.pricing?.salePrice?.toString() || "",
            costPrice: product.pricing?.costPrice?.toString() || "",
            currency: product.pricing?.currency || "USD"
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
          tags: product.tags || []
        });
        
        setExistingImages(product.images || []);
        
        // Fetch variants if product type is variable
        if (product.productType === 'variable') {
          try {
            const variantsResponse = await ProductService.getProductVariants(productId);
            console.log("Variants API Response:", variantsResponse);
            if (variantsResponse.success) {
              // Handle different response structures
              let variantsData: any[] = [];
              if (variantsResponse.data && Array.isArray(variantsResponse.data)) {
                variantsData = variantsResponse.data;
              } else if ((variantsResponse as any).variants && Array.isArray((variantsResponse as any).variants)) {
                variantsData = (variantsResponse as any).variants;
              } else if ((variantsResponse as any).variant && typeof (variantsResponse as any).variant === 'object') {
                variantsData = [(variantsResponse as any).variant];
              }
              // Process variants to separate existing images from new images
              const processedVariants = variantsData.map((variant: any) => ({
                ...variant,
                existingImages: variant.images || [],
                newImages: []
              }));
              setVariants(processedVariants);
              console.log("Processed variants data:", processedVariants);
            } else {
              console.log("No variants found or error:", variantsResponse.error);
              setVariants([]);
            }
          } catch (variantError) {
            console.error("Error fetching variants:", variantError);
            setVariants([]);
          }
        } else {
          setVariants([]);
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

  // Clear variants when product type changes from variable to something else
  useEffect(() => {
    if (formData.productType !== 'variable') {
      setVariants([]);
    }
  }, [formData.productType]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };

  const removeExistingImage = (imageIndex: number) => {
    setExistingImages(existingImages.filter((_, index) => index !== imageIndex));
  };

  const addVariant = () => {
    const newVariant = {
      sku: "",
      colorId: undefined,
      sizeId: undefined,
      genderId: undefined,
      pricing: {
        basePrice: parseFloat(formData.pricing.basePrice) || 0,
        salePrice: formData.pricing.salePrice ? parseFloat(formData.pricing.salePrice) : undefined,
        costPrice: formData.pricing.costPrice ? parseFloat(formData.pricing.costPrice) : undefined,
        currency: formData.pricing.currency
      },
      inventory: {
        stockQuantity: parseInt(formData.inventory.stockQuantity) || 0,
        stockStatus: formData.inventory.stockStatus
      },
      existingImages: [],
      newImages: [],
      isActive: true
    };
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const updatedVariants = [...variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setVariants(updatedVariants);
  };

  const updateVariantPricing = (index: number, field: string, value: any) => {
    const updatedVariants = [...variants];
    updatedVariants[index].pricing = { ...updatedVariants[index].pricing, [field]: value };
    setVariants(updatedVariants);
  };

  const updateVariantInventory = (index: number, field: string, value: any) => {
    const updatedVariants = [...variants];
    updatedVariants[index].inventory = { ...updatedVariants[index].inventory, [field]: value };
    setVariants(updatedVariants);
  };

  const handleVariantImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const updatedVariants = [...variants];
      // For existing variants, we need to handle both existing images and new files
      const newFiles = Array.from(e.target.files);
      updatedVariants[index].newImages = newFiles;
      setVariants(updatedVariants);
    }
  };

  const removeVariantImage = (variantIndex: number, imageIndex: number, isExisting: boolean = false) => {
    const updatedVariants = [...variants];
    if (isExisting) {
      // Remove from existing images
      updatedVariants[variantIndex].existingImages = updatedVariants[variantIndex].existingImages.filter((_: any, i: number) => i !== imageIndex);
    } else {
      // Remove from new images
      updatedVariants[variantIndex].newImages = updatedVariants[variantIndex].newImages.filter((_: File, i: number) => i !== imageIndex);
    }
    setVariants(updatedVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Prepare product data based on product type
      const productData = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        shortDescription: formData.shortDescription,
        sku: formData.sku,
        productType: formData.productType,
        categoryId: formData.categoryId,
        brandId: formData.brandId || undefined,
        genderId: formData.genderId || undefined,
        seasonId: formData.seasonId || undefined,
        styleId: formData.styleId || undefined,
        materialIds: formData.materialIds,
        patternId: formData.patternId || undefined,
        shoeHeightId: formData.shoeHeightId || undefined,
        fitId: formData.fitId || undefined,
        occasionIds: formData.occasionIds,
        collarTypeId: formData.collarTypeId || undefined,
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
        tags: formData.tags,
        images: [], // Will be handled separately
        views: 0,
        salesCount: 0,
        rating: { average: 0, count: 0 }
      };

      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add basic fields
      formDataToSend.append('name', productData.name);
      formDataToSend.append('slug', productData.slug);
      formDataToSend.append('description', productData.description);
      if (productData.shortDescription) {
        formDataToSend.append('shortDescription', productData.shortDescription);
      }
      formDataToSend.append('sku', productData.sku);
      formDataToSend.append('productType', productData.productType);
      formDataToSend.append('categoryId', productData.categoryId);
      
      if (productData.brandId) {
        formDataToSend.append('brandId', productData.brandId);
      }
      if (productData.genderId) {
        formDataToSend.append('genderId', productData.genderId);
      }
      if (productData.seasonId) {
        formDataToSend.append('seasonId', productData.seasonId);
      }
      if (productData.styleId) {
        formDataToSend.append('styleId', productData.styleId);
      }
      if (productData.patternId) {
        formDataToSend.append('patternId', productData.patternId);
      }
      if (productData.shoeHeightId) {
        formDataToSend.append('shoeHeightId', productData.shoeHeightId);
      }
      if (productData.fitId) {
        formDataToSend.append('fitId', productData.fitId);
      }
      if (productData.collarTypeId) {
        formDataToSend.append('collarTypeId', productData.collarTypeId);
      }
      
      // Add arrays - only if they have values
      if (productData.materialIds && productData.materialIds.length > 0) {
        productData.materialIds.forEach(materialId => {
          formDataToSend.append('materialIds[]', materialId);
        });
      }
      if (productData.occasionIds && productData.occasionIds.length > 0) {
        productData.occasionIds.forEach(occasionId => {
          formDataToSend.append('occasionIds[]', occasionId);
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
      
      // Add tags if provided
      if (productData.tags && productData.tags.length > 0) {
        productData.tags.forEach(tag => {
          formDataToSend.append('tags[]', tag);
        });
      }

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

      // Update product using v2 service with FormData
      const response = await ProductService.updateProductWithImages(productId, formDataToSend);
      console.log("Product update response:", response);

      if (response.success) {
        console.log("Product updated successfully:", response.data);
        
        // Handle variants separately for variable products
        if (formData.productType === 'variable' && variants.length > 0) {
          console.log("Updating variants for product:", productId);
          console.log("Variants to update:", variants);
          
          try {
            // For now, we'll create new variants (in a real implementation, you'd want to update existing ones)
            // This is a simplified approach - in production you'd want to:
            // 1. Compare existing variants with new ones
            // 2. Update existing variants
            // 3. Create new variants
            // 4. Delete removed variants
            
            for (const variant of variants) {
              const variantFormData = new FormData();
              
              // Add variant fields
              variantFormData.append('sku', variant.sku || '');
              if (variant.colorId) variantFormData.append('colorId', variant.colorId);
              if (variant.sizeId) variantFormData.append('sizeId', variant.sizeId);
              if (variant.genderId) variantFormData.append('genderId', variant.genderId);
              
              // Add pricing
              if (variant.pricing) {
                variantFormData.append('pricing[basePrice]', variant.pricing.basePrice?.toString() || '0');
                if (variant.pricing.salePrice) {
                  variantFormData.append('pricing[salePrice]', variant.pricing.salePrice.toString());
                }
                if (variant.pricing.costPrice) {
                  variantFormData.append('pricing[costPrice]', variant.pricing.costPrice.toString());
                }
                variantFormData.append('pricing[currency]', variant.pricing.currency || 'USD');
              }
              
              // Add inventory
              if (variant.inventory) {
                variantFormData.append('inventory[stockQuantity]', variant.inventory.stockQuantity?.toString() || '0');
                variantFormData.append('inventory[stockStatus]', variant.inventory.stockStatus || 'in_stock');
              }
              
              // Add new variant images if any
              if (variant.newImages && variant.newImages.length > 0) {
                variant.newImages.forEach((image: File) => {
                  variantFormData.append('images', image);
                });
              }
              
              // Create the variant (or update if it has an _id)
              if (variant._id) {
                // Update existing variant
                const variantResponse = await ProductService.updateProductVariantWithImages(variant._id, variantFormData);
                console.log("Variant update response:", variantResponse);
              } else {
                // Create new variant
                const variantResponse = await ProductService.createProductVariantWithImages(productId, variantFormData);
                console.log("Variant creation response:", variantResponse);
              }
            }
          } catch (variantError) {
            console.error("Error updating variants:", variantError);
            // Don't fail the entire operation if variants fail
          }
        }
        
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

  const getProductTypeDescription = (type: string) => {
    switch (type) {
      case 'simple':
        return 'A single product with no variations (e.g., a basic t-shirt)';
      case 'variable':
        return 'A product with variations like size, color, etc. (e.g., t-shirt in different sizes and colors)';
      case 'grouped':
        return 'A collection of related products sold together (e.g., a gift set)';
      case 'virtual':
        return 'A digital product that doesn\'t require shipping (e.g., software, e-book)';
      case 'downloadable':
        return 'A product that can be downloaded (e.g., music, software, documents)';
      default:
        return '';
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

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Product Type *
                  </label>
                  <select
                    required
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value as any })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="simple">Simple</option>
                    <option value="variable">Variable</option>
                    <option value="grouped">Grouped</option>
                    <option value="virtual">Virtual</option>
                    <option value="downloadable">Downloadable</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">{getProductTypeDescription(formData.productType)}</p>
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

            {/* Product Attributes */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Attributes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    value={formData.genderId}
                    onChange={(e) => setFormData({ ...formData, genderId: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select gender</option>
                    {genders.map((gender) => (
                      <option key={gender._id} value={gender._id}>
                        {gender.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Season
                  </label>
                  <select
                    value={formData.seasonId}
                    onChange={(e) => setFormData({ ...formData, seasonId: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select season</option>
                    {seasons.map((season) => (
                      <option key={season._id} value={season._id}>
                        {season.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Style
                  </label>
                  <select
                    value={formData.styleId}
                    onChange={(e) => setFormData({ ...formData, styleId: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select style</option>
                    {styles.map((style) => (
                      <option key={style._id} value={style._id}>
                        {style.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Pattern
                  </label>
                  <select
                    value={formData.patternId}
                    onChange={(e) => setFormData({ ...formData, patternId: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select pattern</option>
                    {patterns.map((pattern) => (
                      <option key={pattern._id} value={pattern._id}>
                        {pattern.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Shoe Height
                  </label>
                  <select
                    value={formData.shoeHeightId}
                    onChange={(e) => setFormData({ ...formData, shoeHeightId: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select shoe height</option>
                    {shoeHeights.map((height) => (
                      <option key={height._id} value={height._id}>
                        {height.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fit
                  </label>
                  <select
                    value={formData.fitId}
                    onChange={(e) => setFormData({ ...formData, fitId: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select fit</option>
                    {fits.map((fit) => (
                      <option key={fit._id} value={fit._id}>
                        {fit.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700">
                  Materials
                </label>
                <div className="mt-2 space-y-2">
                  {materials.map((material) => (
                    <label key={material._id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.materialIds.includes(material._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              materialIds: [...formData.materialIds, material._id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              materialIds: formData.materialIds.filter(id => id !== material._id)
                            });
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{material.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700">
                  Occasions
                </label>
                <div className="mt-2 space-y-2">
                  {occasions.map((occasion) => (
                    <label key={occasion._id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.occasionIds.includes(occasion._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              occasionIds: [...formData.occasionIds, occasion._id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              occasionIds: formData.occasionIds.filter(id => id !== occasion._id)
                            });
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{occasion.name}</span>
                    </label>
                  ))}
                </div>
              </div>
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

            {/* Product Variants (for variable products) */}
            {formData.productType === 'variable' && (
              <div className="border-b border-gray-200 pb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Product Variants</h3>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Variant
                  </button>
                </div>

                {variants.map((variant, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium text-gray-900">Variant {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">SKU</label>
                        <input
                          type="text"
                          value={variant.sku || ''}
                          onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Variant SKU"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Color</label>
                        <select
                          value={typeof variant.colorId === 'string' ? variant.colorId : variant.colorId?._id || ''}
                          onChange={(e) => updateVariant(index, 'colorId', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="">Select color</option>
                          {colors.map((color) => (
                            <option key={color._id} value={color._id}>
                              {color.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Size</label>
                        <select
                          value={typeof variant.sizeId === 'string' ? variant.sizeId : variant.sizeId?._id || ''}
                          onChange={(e) => updateVariant(index, 'sizeId', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="">Select size</option>
                          {sizes.map((size) => (
                            <option key={size._id} value={size._id}>
                              {size.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={variant.pricing?.basePrice || ''}
                          onChange={(e) => updateVariantPricing(index, 'basePrice', parseFloat(e.target.value))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                        <input
                          type="number"
                          value={variant.inventory?.stockQuantity || ''}
                          onChange={(e) => updateVariantInventory(index, 'stockQuantity', parseInt(e.target.value))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Variant Images */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Variant Images
                      </label>
                      
                      {/* Existing Images */}
                      {variant.existingImages && variant.existingImages.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-600 mb-2">Existing Images:</h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {variant.existingImages.map((image: any, imageIndex: number) => (
                              <div key={`existing-${imageIndex}`} className="relative">
                                <img
                                  src={image.url}
                                  alt={image.alt || `Variant ${index + 1} Image ${imageIndex + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border border-gray-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeVariantImage(index, imageIndex, true)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                  <XMarkIcon className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* New Images Upload */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-600 mb-2">Add New Images:</h5>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleVariantImageChange(index, e)}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {variant.newImages && variant.newImages.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {variant.newImages.map((image: File, imageIndex: number) => (
                              <div key={`new-${imageIndex}`} className="relative">
                                <img
                                  src={URL.createObjectURL(image)}
                                  alt={`Variant ${index + 1} New Image ${imageIndex + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border border-gray-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeVariantImage(index, imageIndex, false)}
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
                  </div>
                ))}
              </div>
            )}

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