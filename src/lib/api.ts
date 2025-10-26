import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Disable credentials by default to avoid CORS issues on public endpoints
  withCredentials: false,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // Only add auth token for protected endpoints
    const url = config.url || "";
    const fullUrl = `${config.baseURL}${url}`;
    const method = config.method?.toLowerCase() || "get";

    // Define public endpoints (read-only operations)
    const isPublicReadEndpoint =
      method === "get" &&
      (url.includes("/products") ||
        url.includes("/categories") ||
        url.includes("/brands") ||
        url.includes("/attributes") ||
        url.includes("/delivery/available") ||
        url.includes("/cart"));

    // All write operations (POST, PUT, DELETE) require authentication
    const isWriteOperation =
      method === "post" || method === "put" || method === "delete";
    const isPublicEndpoint = isPublicReadEndpoint && !isWriteOperation;

    console.log("API Request:", {
      url,
      fullUrl,
      isPublicEndpoint,
      hasToken: !!token,
      baseURL: config.baseURL,
    });

    // Only send cookies/credentials for protected endpoints
    config.withCredentials = !isPublicEndpoint;

    if (token && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Added auth token for protected endpoint");
    } else if (isPublicEndpoint) {
      console.log("Skipping auth token for public endpoint");
    }

    // If the data is FormData, remove the default Content-Type header
    // to let Axios set it automatically with the proper boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const fullUrl = `${error.config?.baseURL}${url}`;
    const method = error.config?.method?.toLowerCase() || "get";

    // Enhanced error logging with better context
    console.log("API Response Error:", {
      status,
      url,
      fullUrl,
      method,
      message: error.message,
      data: error.response?.data,
      timestamp: new Date().toISOString(),
    });

    // Handle different error types
    if (status === 401) {
      // Handle unauthorized access - only redirect for protected endpoints
      if (typeof window !== "undefined") {
        // Define public endpoints that should never trigger login redirect
        const isPublicReadEndpoint =
          method === "get" &&
          (url.includes("/products") ||
            url.includes("/categories") ||
            url.includes("/brands") ||
            url.includes("/attributes") ||
            url.includes("/delivery/available") ||
            url.includes("/cart"));
        const isWriteOperation =
          method === "post" || method === "put" || method === "delete";
        const isPublicEndpoint = isPublicReadEndpoint && !isWriteOperation;

        // Define protected endpoints that should trigger login redirect
        const isProtectedEndpoint =
          url.includes("/users") ||
          url.includes("/orders") ||
          url.includes("/cart") ||
          url.includes("/admin");

        console.log("401 Error:", {
          url,
          isPublicEndpoint,
          isProtectedEndpoint,
        });

        // Only redirect if it's a protected endpoint AND not a public endpoint
        if (isProtectedEndpoint && !isPublicEndpoint) {
          console.log("Redirecting to login for protected endpoint");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/auth/login";
        } else {
          console.log("Not redirecting - public endpoint or not protected");
        }
      }
    } else if (status === 404) {
      // Handle 404 errors gracefully - don't break the app
      console.warn("Resource not found (404):", {
        url,
        fullUrl,
        method,
        error: error.response?.data?.error || "Resource not found",
      });
      
      // For 404s, return a structured response instead of throwing
      // This prevents Next.js from treating it as an unhandled error
      const mockResponse = {
        data: {
          success: false,
          error: error.response?.data?.error || "Resource not found",
          data: null,
        },
        status: 404,
        statusText: "Not Found",
        headers: error.response?.headers || {},
        config: error.config,
      };
      
      return Promise.resolve(mockResponse);
    } else if (status >= 500) {
      // Handle server errors
      console.error("Server error:", {
        status,
        url,
        fullUrl,
        error: error.response?.data?.error || "Internal server error",
      });
    } else if (status >= 400) {
      // Handle other client errors
      console.warn("Client error:", {
        status,
        url,
        fullUrl,
        error: error.response?.data?.error || "Bad request",
      });
    }

    // Always reject the promise, but with enhanced error information
    const enhancedError = {
      ...error,
      status,
      url,
      fullUrl,
      method,
      isNotFound: status === 404,
      isUnauthorized: status === 401,
      isServerError: status >= 500,
      isClientError: status >= 400 && status < 500,
    };

    return Promise.reject(enhancedError);
  }
);

// API endpoints
export const endpoints = {
  auth: {
    login: "/users/login",
    register: "/users/register",
    profile: "/users/profile",
    changePassword: "/users/change-password",
  },
  products: {
    list: "/products",
    detail: (id: string) => `/products/${id}`,
    bySlug: (slug: string) => `/products/slug/${slug}`,
    search: "/products/search",
    create: "/products",
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`,
    trending: "/products/trending",
    new: "/products/new",
    variants: (productId: string) => `/products/${productId}/variants`,
    createVariant: (productId: string) => `/products/${productId}/variants`,
    updateVariant: (variantId: string) => `/products/variants/${variantId}`,
    deleteVariant: (variantId: string) => `/products/variants/${variantId}`,
    categoryFilters: (categoryId: string) =>
      `/products/category/${categoryId}/filters`,
  },
  categories: {
    list: "/categories",
    tree: "/categories/tree",
    detail: (id: string) => `/categories/${id}`,
    bySlug: (slug: string) => `/categories/slug/${slug}`,
    breadcrumb: (id: string) => `/categories/${id}/breadcrumb`,
    create: "/categories",
    update: (id: string) => `/categories/${id}`,
    delete: (id: string) => `/categories/${id}`,
  },
  brands: {
    list: "/brands",
    detail: (id: string) => `/brands/${id}`,
    bySlug: (slug: string) => `/brands/slug/${slug}`,
    create: "/brands",
    update: (id: string) => `/brands/${id}`,
    delete: (id: string) => `/brands/${id}`,
  },
  attributes: {
    colors: {
      list: "/attributes/colors",
      detail: (id: string) => `/attributes/colors/${id}`,
      bySlug: (slug: string) => `/attributes/colors/slug/${slug}`,
      create: "/attributes/colors",
      update: (id: string) => `/attributes/colors/${id}`,
      delete: (id: string) => `/attributes/colors/${id}`,
    },
    sizes: {
      list: "/attributes/sizes",
      detail: (id: string) => `/attributes/sizes/${id}`,
      bySlug: (slug: string) => `/attributes/sizes/slug/${slug}`,
      create: "/attributes/sizes",
      update: (id: string) => `/attributes/sizes/${id}`,
      delete: (id: string) => `/attributes/sizes/${id}`,
    },
    materials: {
      list: "/attributes/materials",
      detail: (id: string) => `/attributes/materials/${id}`,
      bySlug: (slug: string) => `/attributes/materials/slug/${slug}`,
      create: "/attributes/materials",
      update: (id: string) => `/attributes/materials/${id}`,
      delete: (id: string) => `/attributes/materials/${id}`,
    },
    genders: {
      list: "/attributes/genders",
      detail: (id: string) => `/attributes/genders/${id}`,
      bySlug: (slug: string) => `/attributes/genders/slug/${slug}`,
      create: "/attributes/genders",
      update: (id: string) => `/attributes/genders/${id}`,
      delete: (id: string) => `/attributes/genders/${id}`,
    },
    seasons: {
      list: "/attributes/seasons",
      detail: (id: string) => `/attributes/seasons/${id}`,
      bySlug: (slug: string) => `/attributes/seasons/slug/${slug}`,
      create: "/attributes/seasons",
      update: (id: string) => `/attributes/seasons/${id}`,
      delete: (id: string) => `/attributes/seasons/${id}`,
    },
    styles: {
      list: "/attributes/styles",
      detail: (id: string) => `/attributes/styles/${id}`,
      bySlug: (slug: string) => `/attributes/styles/slug/${slug}`,
      byCategory: (categoryId: string) =>
        `/attributes/styles/category/${categoryId}`,
      create: "/attributes/styles",
      update: (id: string) => `/attributes/styles/${id}`,
      delete: (id: string) => `/attributes/styles/${id}`,
    },
    patterns: {
      list: "/attributes/patterns",
      detail: (id: string) => `/attributes/patterns/${id}`,
      bySlug: (slug: string) => `/attributes/patterns/slug/${slug}`,
      create: "/attributes/patterns",
      update: (id: string) => `/attributes/patterns/${id}`,
      delete: (id: string) => `/attributes/patterns/${id}`,
    },
    shoeHeights: {
      list: "/attributes/shoe-heights",
      detail: (id: string) => `/attributes/shoe-heights/${id}`,
      bySlug: (slug: string) => `/attributes/shoe-heights/slug/${slug}`,
      byCategory: (categoryId: string) =>
        `/attributes/shoe-heights/category/${categoryId}`,
      create: "/attributes/shoe-heights",
      update: (id: string) => `/attributes/shoe-heights/${id}`,
      delete: (id: string) => `/attributes/shoe-heights/${id}`,
    },
    fits: {
      list: "/attributes/fits",
      detail: (id: string) => `/attributes/fits/${id}`,
      bySlug: (slug: string) => `/attributes/fits/slug/${slug}`,
      byCategory: (categoryId: string) =>
        `/attributes/fits/category/${categoryId}`,
      create: "/attributes/fits",
      update: (id: string) => `/attributes/fits/${id}`,
      delete: (id: string) => `/attributes/fits/${id}`,
    },
    occasions: {
      list: "/attributes/occasions",
      detail: (id: string) => `/attributes/occasions/${id}`,
      bySlug: (slug: string) => `/attributes/occasions/slug/${slug}`,
      create: "/attributes/occasions",
      update: (id: string) => `/attributes/occasions/${id}`,
      delete: (id: string) => `/attributes/occasions/${id}`,
    },
    collarTypes: {
      list: "/attributes/collar-types",
      detail: (id: string) => `/attributes/collar-types/${id}`,
      bySlug: (slug: string) => `/attributes/collar-types/slug/${slug}`,
      byCategory: (categoryId: string) =>
        `/attributes/collar-types/category/${categoryId}`,
      create: "/attributes/collar-types",
      update: (id: string) => `/attributes/collar-types/${id}`,
      delete: (id: string) => `/attributes/collar-types/${id}`,
    },
    allForCategory: (categoryId: string) =>
      `/attributes/category/${categoryId}/all`,
  },
  cart: {
    get: "/cart",
    add: "/cart/add",
    updateItem: (itemId: string) => `/cart/items/${itemId}`,
    removeItem: (itemId: string) => `/cart/items/${itemId}`,
    clear: "/cart/clear",
    applyCoupon: "/cart/coupon",
    removeCoupon: "/cart/coupon",
    merge: "/cart/merge",
  },
  orders: {
    list: "/orders",
    detail: (id: string) => `/orders/${id}`,
    initiateCheckout: "/orders/checkout/initiate",
    completeCheckout: "/orders/checkout/complete",
  },
  users: {
    list: "/users",
    detail: (id: string) => `/users/${id}`,
    create: "/users",
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
    addresses: "/users/addresses",
    addressDetail: (id: string) => `/users/addresses/${id}`,
    createAddress: "/users/addresses",
    updateAddress: (id: string) => `/users/addresses/${id}`,
    deleteAddress: (id: string) => `/users/addresses/${id}`,
  },
  delivery: {
    list: "/delivery",
    available: "/delivery/available",
    create: "/delivery",
    update: (id: string) => `/delivery/${id}`,
    delete: (id: string) => `/delivery/${id}`,
  },
};

export default api;
