// Store Configuration
// Centralized configuration for store settings, branding, and theme

export interface StoreConfig {
  // Store Identity
  store: {
    name: string;
    tagline?: string;
    description?: string;
    website?: string;
    email: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };

  // Branding & Logos
  branding: {
    logo: {
      primary: string; // Main logo URL
      secondary?: string; // Alternative logo
      favicon?: string; // Favicon URL
      mobile?: string; // Mobile-optimized logo
    };
    colors: {
      primary: string; // Main brand color
      secondary: string; // Secondary brand color
      accent: string; // Accent color
      background: string; // Background color
      surface: string; // Surface/card background
      text: {
        primary: string; // Primary text color
        secondary: string; // Secondary text color
        muted: string; // Muted text color
      };
      border: string; // Border color
      success: string; // Success state color
      warning: string; // Warning state color
      error: string; // Error state color
    };
    fonts: {
      primary: string; // Primary font family
      secondary?: string; // Secondary font family
    };
  };

  // Currency & Pricing
  currency: {
    code: string; // ISO currency code (e.g., 'USD', 'ZAR', 'EUR')
    symbol: string; // Currency symbol (e.g., '$', 'R', '€')
    position: 'before' | 'after'; // Symbol position
    decimalPlaces: number; // Number of decimal places
    thousandsSeparator: string; // Thousands separator (e.g., ',', '.')
    decimalSeparator: string; // Decimal separator (e.g., '.', ',')
  };

  // Theme Settings
  theme: {
    mode: 'light' | 'dark' | 'auto'; // Theme mode
    borderRadius: string; // Border radius for components
    spacing: {
      xs: string; // Extra small spacing
      sm: string; // Small spacing
      md: string; // Medium spacing
      lg: string; // Large spacing
      xl: string; // Extra large spacing
    };
    shadows: {
      sm: string; // Small shadow
      md: string; // Medium shadow
      lg: string; // Large shadow
    };
  };

  // Features & Functionality
  features: {
    enableReviews: boolean;
    enableWishlist: boolean;
    enableCompare: boolean;
    enableNewsletter: boolean;
    enableSocialLogin: boolean;
    enableGuestCheckout: boolean;
    enableMultiLanguage: boolean;
    enableMultiCurrency: boolean;
  };

  // Social Media
  social: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };

  // SEO & Meta
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    defaultKeywords: string[];
    ogImage?: string; // Open Graph image
    twitterCard?: 'summary' | 'summary_large_image';
  };

  // Payment & Shipping
  payment: {
    methods: string[]; // Available payment methods
    defaultMethod?: string;
  };

  shipping: {
    freeShippingThreshold?: number; // Minimum amount for free shipping
    defaultShippingCost?: number;
    estimatedDeliveryDays: {
      min: number;
      max: number;
    };
  };

  // Analytics & Tracking
  analytics: {
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    facebookPixelId?: string;
  };
}

// Default store configuration
export const defaultStoreConfig: StoreConfig = {
  store: {
    name: "Fashion Store",
    tagline: "Your Style, Our Passion",
    description: "Discover the latest fashion trends and timeless classics",
    website: "https://fashionstore.com",
    email: "info@fashionstore.com",
    phone: "+1 (555) 123-4567",
    address: {
      street: "123 Fashion Street",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "United States"
    }
  },

  branding: {
    logo: {
      primary: "/logo.png",
      secondary: "/logo-white.png",
      favicon: "/favicon.ico",
      mobile: "/logo-mobile.png"
    },
    colors: {
      primary: "#3B82F6", // Blue
      secondary: "#1E40AF", // Darker blue
      accent: "#F59E0B", // Amber
      background: "#FFFFFF",
      surface: "#F8FAFC",
      text: {
        primary: "#1F2937",
        secondary: "#6B7280",
        muted: "#9CA3AF"
      },
      border: "#E5E7EB",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444"
    },
    fonts: {
      primary: "Inter, system-ui, sans-serif",
      secondary: "Georgia, serif"
    }
  },

  currency: {
    code: "USD",
    symbol: "$",
    position: "before",
    decimalPlaces: 2,
    thousandsSeparator: ",",
    decimalSeparator: "."
  },

  theme: {
    mode: "light",
    borderRadius: "8px",
    spacing: {
      xs: "4px",
      sm: "8px",
      md: "16px",
      lg: "24px",
      xl: "32px"
    },
    shadows: {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"
    }
  },

  features: {
    enableReviews: true,
    enableWishlist: true,
    enableCompare: true,
    enableNewsletter: true,
    enableSocialLogin: false,
    enableGuestCheckout: true,
    enableMultiLanguage: false,
    enableMultiCurrency: false
  },

  social: {
    facebook: "https://facebook.com/fashionstore",
    twitter: "https://twitter.com/fashionstore",
    instagram: "https://instagram.com/fashionstore",
    linkedin: "https://linkedin.com/company/fashionstore"
  },

  seo: {
    defaultTitle: "Fashion Store - Your Style, Our Passion",
    defaultDescription: "Discover the latest fashion trends and timeless classics. Shop quality clothing, shoes, and accessories for men and women.",
    defaultKeywords: ["fashion", "clothing", "shoes", "accessories", "style", "trends"],
    ogImage: "/og-image.jpg",
    twitterCard: "summary_large_image"
  },

  payment: {
    methods: ["credit_card", "paypal", "apple_pay", "google_pay"],
    defaultMethod: "credit_card"
  },

  shipping: {
    freeShippingThreshold: 50,
    defaultShippingCost: 9.99,
    estimatedDeliveryDays: {
      min: 3,
      max: 7
    }
  },

  analytics: {
    googleAnalyticsId: undefined,
    googleTagManagerId: undefined,
    facebookPixelId: undefined
  }
};

// Current store configuration (can be overridden)
export const storeConfig: StoreConfig = {
  ...defaultStoreConfig,
  // Override specific settings here
  store: {
    ...defaultStoreConfig.store,
    name: "Your Store Name", // Change this
    email: "info@yourstore.com", // Change this
  },
  
  currency: {
    ...defaultStoreConfig.currency,
    code: "ZAR", // Change to your currency
    symbol: "R", // Change to your currency symbol
  },

  branding: {
    ...defaultStoreConfig.branding,
    colors: {
      ...defaultStoreConfig.branding.colors,
      primary: "#2563EB", // Change to your brand color
      secondary: "#1D4ED8", // Change to your secondary color
    }
  }
};

// Utility functions for accessing store configuration
export const getStoreConfig = (): StoreConfig => storeConfig;

export const getStoreName = (): string => storeConfig.store.name;

export const getStoreEmail = (): string => storeConfig.store.email;

export const getCurrencyConfig = () => storeConfig.currency;

export const getBrandingConfig = () => storeConfig.branding;

export const getThemeConfig = () => storeConfig.theme;

export const getFeatureConfig = () => storeConfig.features;

export const getSocialConfig = () => storeConfig.social;

export const getSEOConfig = () => storeConfig.seo;

// Currency formatting utility
export const formatCurrency = (amount: number): string => {
  const { symbol, position, decimalPlaces, thousandsSeparator, decimalSeparator } = storeConfig.currency;
  
  const formattedAmount = amount?.toFixed(decimalPlaces)
    .replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator)
    .replace('.', decimalSeparator);
  
  return position === 'before' ? `${symbol}${formattedAmount}` : `${formattedAmount}${symbol}`;
};

// Theme utility functions
export const getThemeColors = () => storeConfig.branding.colors;

export const getThemeSpacing = () => storeConfig.theme.spacing;

export const getThemeShadows = () => storeConfig.theme.shadows;

// Feature flag utilities
export const isFeatureEnabled = (feature: keyof StoreConfig['features']): boolean => {
  return storeConfig.features[feature];
};

// Social media utilities
export const getSocialLinks = () => {
  const social = storeConfig.social;
  return Object.entries(social).filter(([_, url]) => url).map(([platform, url]) => ({
    platform,
    url
  }));
};

export default storeConfig;
