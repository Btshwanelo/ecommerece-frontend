# Store Configuration Guide

This guide explains how to use the centralized store configuration system in your e-commerce frontend.

## Overview

The store configuration system provides a centralized way to manage all store-related settings including branding, theme, currency, features, and more. This makes it easy to customize your store without modifying code throughout the application.

## Files Structure

```
src/
├── lib/
│   └── storeConfig.ts          # Main configuration file
├── hooks/
│   └── useStoreConfig.ts       # React hooks for accessing config
├── types/
│   └── index.ts               # TypeScript types (StoreConfig interface)
└── components/
    └── StoreInfo.tsx          # Example component using config
```

## Quick Start

### 1. Basic Usage with React Hook

```tsx
import { useStoreConfig } from '@/hooks/useStoreConfig';

const MyComponent = () => {
  const { storeName, storeEmail, formatCurrency, colors } = useStoreConfig();
  
  return (
    <div style={{ color: colors.primary }}>
      <h1>{storeName}</h1>
      <p>Contact: {storeEmail}</p>
      <p>Price: {formatCurrency(29.99)}</p>
    </div>
  );
};
```

### 2. Direct Import Usage

```tsx
import { storeConfig, formatCurrency } from '@/lib/storeConfig';

const price = formatCurrency(29.99);
const storeName = storeConfig.store.name;
```

## Configuration Sections

### Store Identity
```typescript
store: {
  name: "Your Store Name",
  tagline: "Your Store Tagline",
  email: "info@yourstore.com",
  phone: "+1 (555) 123-4567",
  // ... more fields
}
```

### Branding & Logos
```typescript
branding: {
  logo: {
    primary: "/logo.png",
    secondary: "/logo-white.png",
    favicon: "/favicon.ico"
  },
  colors: {
    primary: "#2563EB",
    secondary: "#1D4ED8",
    // ... more colors
  }
}
```

### Currency Settings
```typescript
currency: {
  code: "USD",        // ISO currency code
  symbol: "$",        // Currency symbol
  position: "before", // Symbol position
  decimalPlaces: 2,   // Number of decimal places
  // ... more settings
}
```

### Theme Configuration
```typescript
theme: {
  mode: "light",      // light | dark | auto
  borderRadius: "8px",
  spacing: {
    xs: "4px",
    sm: "8px",
    // ... more spacing
  }
}
```

### Feature Flags
```typescript
features: {
  enableReviews: true,
  enableWishlist: true,
  enableCompare: true,
  // ... more features
}
```

## Available Hooks

### useStoreConfig()
Main hook providing access to all configuration:

```tsx
const {
  storeName,
  storeEmail,
  logo,
  colors,
  currency,
  formatCurrency,
  theme,
  features,
  isFeatureEnabled,
  socialLinks
} = useStoreConfig();
```

### useCurrency()
Specialized hook for currency operations:

```tsx
const { code, symbol, position, format } = useCurrency();
const formattedPrice = format(29.99);
```

### useTheme()
Specialized hook for theme access:

```tsx
const { mode, colors, spacing, shadows } = useTheme();
```

### useFeatures()
Specialized hook for feature flags:

```tsx
const { enableReviews, enableWishlist, isEnabled } = useFeatures();
const canReview = isEnabled('enableReviews');
```

## Utility Functions

### Currency Formatting
```typescript
import { formatCurrency } from '@/lib/storeConfig';

const price = formatCurrency(29.99); // Returns "$29.99" or "R29.99" etc.
```

### Feature Checking
```typescript
import { isFeatureEnabled } from '@/lib/storeConfig';

const canReview = isFeatureEnabled('enableReviews');
```

### Social Links
```typescript
import { getSocialLinks } from '@/lib/storeConfig';

const socialLinks = getSocialLinks(); // Returns array of active social links
```

## Customizing Your Store

### 1. Update Store Information
Edit `src/lib/storeConfig.ts` and modify the `storeConfig` object:

```typescript
export const storeConfig: StoreConfig = {
  ...defaultStoreConfig,
  store: {
    ...defaultStoreConfig.store,
    name: "My Awesome Store",
    email: "hello@myawesomestore.com",
  },
  // ... other overrides
};
```

### 2. Change Brand Colors
```typescript
branding: {
  ...defaultStoreConfig.branding,
  colors: {
    ...defaultStoreConfig.branding.colors,
    primary: "#FF6B6B",    // Your primary color
    secondary: "#4ECDC4",  // Your secondary color
  }
}
```

### 3. Set Your Currency
```typescript
currency: {
  ...defaultStoreConfig.currency,
  code: "ZAR",
  symbol: "R",
  position: "before",
}
```

### 4. Configure Features
```typescript
features: {
  ...defaultStoreConfig.features,
  enableReviews: true,
  enableWishlist: false,
  enableSocialLogin: true,
}
```

## Environment-Specific Configuration

You can create different configurations for different environments:

```typescript
// In storeConfig.ts
const isDevelopment = process.env.NODE_ENV === 'development';

export const storeConfig: StoreConfig = {
  ...defaultStoreConfig,
  store: {
    ...defaultStoreConfig.store,
    name: isDevelopment ? "Dev Store" : "Production Store",
  },
  analytics: {
    ...defaultStoreConfig.analytics,
    googleAnalyticsId: isDevelopment ? undefined : "GA-XXXXXXXXX",
  }
};
```

## Best Practices

1. **Centralized Changes**: Always update store settings in `storeConfig.ts` rather than hardcoding values throughout your app.

2. **Use Hooks**: Prefer using the React hooks (`useStoreConfig`, `useCurrency`, etc.) in components for better performance and consistency.

3. **Type Safety**: The configuration is fully typed, so you'll get TypeScript autocomplete and error checking.

4. **Feature Flags**: Use feature flags to enable/disable functionality without code changes.

5. **Environment Variables**: For sensitive data like API keys, use environment variables and reference them in the config.

## Example Components

See `src/components/StoreInfo.tsx` for a complete example of how to use the store configuration in a React component.

## Migration Guide

If you have hardcoded values throughout your app, you can gradually migrate them:

1. Identify hardcoded values (store name, colors, currency, etc.)
2. Replace them with calls to the store configuration
3. Test to ensure everything works correctly
4. Remove the old hardcoded values

## Troubleshooting

### Common Issues

1. **Import Errors**: Make sure you're importing from the correct paths:
   - `@/lib/storeConfig` for direct imports
   - `@/hooks/useStoreConfig` for React hooks

2. **Type Errors**: Ensure you have the latest types in `src/types/index.ts`

3. **Currency Formatting**: Check that your currency configuration is correct, especially decimal separators for different locales.

### Getting Help

If you encounter issues:
1. Check the TypeScript types for the expected structure
2. Verify your configuration matches the `StoreConfig` interface
3. Test with the example component to ensure everything is working


