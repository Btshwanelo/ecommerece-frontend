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
    let url = config.url || "";
    const method = config.method?.toLowerCase() || "get";

    // Handle v2 endpoints: if URL starts with /api/v2, construct full URL from origin
    // This is needed because baseURL is /api/v3, and we need to override it for v2
    let fullUrl: string;
    if (url.startsWith("/api/v2")) {
      const baseURL = config.baseURL || "";
      // Extract origin from baseURL (e.g., http://localhost:6000 from http://localhost:6000/api/v3)
      const origin = baseURL.split("/api/")[0] || baseURL;
      fullUrl = `${origin}${url}`;
      // Override baseURL for this request - set to origin so axios doesn't double-concatenate
      config.baseURL = origin;
      // Update the URL to be relative to the new baseURL
      config.url = url;
    } else {
      fullUrl = `${config.baseURL || ""}${url}`;
    }

    // Define public endpoints - auth endpoints (login/register) should be public
    const isAuthEndpoint = url.includes("/users/login") || url.includes("/users/register");
    
    // Define public read-only endpoints (GET operations)
    const isPublicReadEndpoint =
      method === "get" &&
      (url.includes("/products") ||
        url.includes("/categories") ||
        url.includes("/brands") ||
        url.includes("/attributes") ||
        url.includes("/delivery/available") ||
        url.includes("/cart"));

    // All write operations (POST, PUT, DELETE) require authentication EXCEPT auth endpoints
    const isWriteOperation =
      method === "post" || method === "put" || method === "delete";
    const isPublicEndpoint = isAuthEndpoint || (isPublicReadEndpoint && !isWriteOperation);

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
    // Handle v2 endpoints - calculate fullUrl correctly
    let fullUrl: string;
    if (url.startsWith("/api/v2")) {
      const baseURL = error.config?.baseURL || "";
      const origin = baseURL.split("/api/")[0] || baseURL;
      fullUrl = `${origin}${url}`;
    } else {
      fullUrl = `${error.config?.baseURL || ""}${url}`;
    }
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
        // Define public endpoints - auth endpoints should never redirect
        const isAuthEndpoint = url.includes("/users/login") || url.includes("/users/register");
        
        // Define public read-only endpoints
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
        const isPublicEndpoint = isAuthEndpoint || (isPublicReadEndpoint && !isWriteOperation);

        // Define protected endpoints that should trigger login redirect
        // Exclude auth endpoints from protected endpoints check
        const isProtectedEndpoint =
          !isAuthEndpoint &&
          (url.includes("/users") ||
            url.includes("/orders") ||
            url.includes("/cart") ||
            url.includes("/admin"));

        console.log("401 Error:", {
          url,
          isAuthEndpoint,
          isPublicEndpoint,
          isProtectedEndpoint,
        });

        // Only redirect if it's a protected endpoint AND not a public endpoint
        // Never redirect for auth endpoints (login/register)
        // Don't redirect if we have a token (might be invalid but let component handle it)
        // Don't redirect if we're already on an admin page (might be a temporary auth issue)
        const hasToken = typeof window !== "undefined" && !!localStorage.getItem("token");
        const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
        const isOnAdminPage = currentPath.startsWith("/admin") || currentPath.startsWith("/auth/login");
        
        // Only redirect if:
        // 1. It's a protected endpoint
        // 2. Not a public endpoint
        // 3. Not an auth endpoint
        // 4. We don't have a token (no token means definitely not authenticated)
        // 5. We're not already on admin/auth page
        const shouldRedirect = isProtectedEndpoint && 
          !isPublicEndpoint && 
          !isAuthEndpoint && 
          !hasToken && 
          !isOnAdminPage;
        
        if (shouldRedirect) {
          console.log("Redirecting to login for protected endpoint - no token found");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/auth/login";
        } else {
          console.log("Not redirecting:", {
            isProtectedEndpoint,
            isPublicEndpoint,
            isAuthEndpoint,
            hasToken,
            isOnAdminPage,
            currentPath
          });
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

// API endpoints - Using v3 routes for admin functionality
// Note: baseURL already includes /api/v3, so v3 endpoints are relative paths
// v2 endpoints use full paths to override baseURL
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
    byCategorySlug: (categorySlug: string) =>
      `/products/category/slug/${categorySlug}`,
    search: "/products/search",
    create: "/products",
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`,
    trending: "/products/trending",
    new: "/products/new",
    // Variant endpoints not available in v3, using v2 (full path to override baseURL)
    variants: (productId: string) => `/api/v2/products/${productId}/variants`,
    createVariant: (productId: string) =>
      `/api/v2/products/${productId}/variants`,
    updateVariant: (variantId: string) =>
      `/api/v2/products/variants/${variantId}`,
    deleteVariant: (variantId: string) =>
      `/api/v2/products/variants/${variantId}`,
    // Category filters endpoint not available in v3, using v2 (full path to override baseURL)
    categoryFilters: (categoryId: string) =>
      `/api/v2/products/category/${categoryId}/filters`,
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
    // Attributes endpoints not available in v3, using v2
    colors: {
      list: "/api/v2/attributes/colors",
      detail: (id: string) => `/api/v2/attributes/colors/${id}`,
      bySlug: (slug: string) => `/api/v2/attributes/colors/slug/${slug}`,
      create: "/api/v2/attributes/colors",
      update: (id: string) => `/api/v2/attributes/colors/${id}`,
      delete: (id: string) => `/api/v2/attributes/colors/${id}`,
    },
    sizes: {
      list: "/api/v2/attributes/sizes",
      detail: (id: string) => `/api/v2/attributes/sizes/${id}`,
      bySlug: (slug: string) => `/api/v2/attributes/sizes/slug/${slug}`,
      create: "/api/v2/attributes/sizes",
      update: (id: string) => `/api/v2/attributes/sizes/${id}`,
      delete: (id: string) => `/api/v2/attributes/sizes/${id}`,
    },
    materials: {
      list: "/api/v2/attributes/materials",
      detail: (id: string) => `/api/v2/attributes/materials/${id}`,
      bySlug: (slug: string) => `/api/v2/attributes/materials/slug/${slug}`,
      create: "/api/v2/attributes/materials",
      update: (id: string) => `/api/v2/attributes/materials/${id}`,
      delete: (id: string) => `/api/v2/attributes/materials/${id}`,
    },
    genders: {
      list: "/api/v2/attributes/genders",
      detail: (id: string) => `/api/v2/attributes/genders/${id}`,
      bySlug: (slug: string) => `/api/v2/attributes/genders/slug/${slug}`,
      create: "/api/v2/attributes/genders",
      update: (id: string) => `/api/v2/attributes/genders/${id}`,
      delete: (id: string) => `/api/v2/attributes/genders/${id}`,
    },
    seasons: {
      list: "/api/v2/attributes/seasons",
      detail: (id: string) => `/api/v2/attributes/seasons/${id}`,
      bySlug: (slug: string) => `/api/v2/attributes/seasons/slug/${slug}`,
      create: "/api/v2/attributes/seasons",
      update: (id: string) => `/api/v2/attributes/seasons/${id}`,
      delete: (id: string) => `/api/v2/attributes/seasons/${id}`,
    },
    styles: {
      list: "/api/v2/attributes/styles",
      detail: (id: string) => `/api/v2/attributes/styles/${id}`,
      bySlug: (slug: string) => `/api/v2/attributes/styles/slug/${slug}`,
      byCategory: (categoryId: string) =>
        `/api/v2/attributes/styles/category/${categoryId}`,
      create: "/api/v2/attributes/styles",
      update: (id: string) => `/api/v2/attributes/styles/${id}`,
      delete: (id: string) => `/api/v2/attributes/styles/${id}`,
    },
    patterns: {
      list: "/api/v2/attributes/patterns",
      detail: (id: string) => `/api/v2/attributes/patterns/${id}`,
      bySlug: (slug: string) => `/api/v2/attributes/patterns/slug/${slug}`,
      create: "/api/v2/attributes/patterns",
      update: (id: string) => `/api/v2/attributes/patterns/${id}`,
      delete: (id: string) => `/api/v2/attributes/patterns/${id}`,
    },
    shoeHeights: {
      list: "/api/v2/attributes/shoe-heights",
      detail: (id: string) => `/api/v2/attributes/shoe-heights/${id}`,
      bySlug: (slug: string) => `/api/v2/attributes/shoe-heights/slug/${slug}`,
      byCategory: (categoryId: string) =>
        `/api/v2/attributes/shoe-heights/category/${categoryId}`,
      create: "/api/v2/attributes/shoe-heights",
      update: (id: string) => `/api/v2/attributes/shoe-heights/${id}`,
      delete: (id: string) => `/api/v2/attributes/shoe-heights/${id}`,
    },
    fits: {
      list: "/api/v2/attributes/fits",
      detail: (id: string) => `/api/v2/attributes/fits/${id}`,
      bySlug: (slug: string) => `/api/v2/attributes/fits/slug/${slug}`,
      byCategory: (categoryId: string) =>
        `/api/v2/attributes/fits/category/${categoryId}`,
      create: "/api/v2/attributes/fits",
      update: (id: string) => `/api/v2/attributes/fits/${id}`,
      delete: (id: string) => `/api/v2/attributes/fits/${id}`,
    },
    occasions: {
      list: "/api/v2/attributes/occasions",
      detail: (id: string) => `/api/v2/attributes/occasions/${id}`,
      bySlug: (slug: string) => `/api/v2/attributes/occasions/slug/${slug}`,
      create: "/api/v2/attributes/occasions",
      update: (id: string) => `/api/v2/attributes/occasions/${id}`,
      delete: (id: string) => `/api/v2/attributes/occasions/${id}`,
    },
    collarTypes: {
      list: "/api/v2/attributes/collar-types",
      detail: (id: string) => `/api/v2/attributes/collar-types/${id}`,
      bySlug: (slug: string) => `/api/v2/attributes/collar-types/slug/${slug}`,
      byCategory: (categoryId: string) =>
        `/api/v2/attributes/collar-types/category/${categoryId}`,
      create: "/api/v2/attributes/collar-types",
      update: (id: string) => `/api/v2/attributes/collar-types/${id}`,
      delete: (id: string) => `/api/v2/attributes/collar-types/${id}`,
    },
    allForCategory: (categoryId: string) =>
      `/api/v2/attributes/category/${categoryId}/all`,
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
    byNumber: (orderNumber: string) => `/orders/number/${orderNumber}`,
    updateStatus: (id: string) => `/orders/${id}/status`,
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
