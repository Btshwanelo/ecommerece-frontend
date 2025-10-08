import { useMemo } from 'react';
import { storeConfig, formatCurrency, getThemeColors, getThemeSpacing, getThemeShadows, isFeatureEnabled, getSocialLinks } from '@/lib/storeConfig';
import type { StoreConfig } from '@/types';

/**
 * React hook for accessing store configuration
 * Provides easy access to store settings throughout the application
 */
export const useStoreConfig = () => {
  const config = useMemo(() => storeConfig, []);

  return {
    // Store identity
    storeName: config.store.name,
    storeTagline: config.store.tagline,
    storeDescription: config.store.description,
    storeEmail: config.store.email,
    storePhone: config.store.phone,
    storeAddress: config.store.address,
    storeWebsite: config.store.website,

    // Branding
    logo: config.branding.logo,
    colors: config.branding.colors,
    fonts: config.branding.fonts,

    // Currency
    currency: config.currency,
    formatCurrency: (amount: number) => formatCurrency(amount),

    // Theme
    theme: config.theme,
    themeColors: getThemeColors(),
    themeSpacing: getThemeSpacing(),
    themeShadows: getThemeShadows(),

    // Features
    features: config.features,
    isFeatureEnabled: (feature: keyof StoreConfig['features']) => isFeatureEnabled(feature),

    // Social media
    social: config.social,
    socialLinks: getSocialLinks(),

    // SEO
    seo: config.seo,

    // Payment & Shipping
    payment: config.payment,
    shipping: config.shipping,

    // Analytics
    analytics: config.analytics,

    // Full config (for advanced usage)
    fullConfig: config,
  };
};

/**
 * Hook for currency formatting
 */
export const useCurrency = () => {
  const { currency, formatCurrency } = useStoreConfig();
  
  return {
    code: currency.code,
    symbol: currency.symbol,
    position: currency.position,
    format: formatCurrency,
  };
};

/**
 * Hook for theme access
 */
export const useTheme = () => {
  const { theme, themeColors, themeSpacing, themeShadows } = useStoreConfig();
  
  return {
    mode: theme.mode,
    borderRadius: theme.borderRadius,
    colors: themeColors,
    spacing: themeSpacing,
    shadows: themeShadows,
  };
};

/**
 * Hook for feature flags
 */
export const useFeatures = () => {
  const { features, isFeatureEnabled } = useStoreConfig();
  
  return {
    ...features,
    isEnabled: isFeatureEnabled,
  };
};

export default useStoreConfig;
