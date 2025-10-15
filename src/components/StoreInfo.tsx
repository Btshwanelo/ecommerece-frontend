import React from 'react';
import { useStoreConfig, useCurrency, useTheme } from '@/hooks/useStoreConfig';

/**
 * Example component demonstrating how to use store configuration
 * This component shows store information using the centralized config
 */
const StoreInfo: React.FC = () => {
  const { 
    storeName, 
    storeTagline, 
    storeEmail, 
    storePhone,
    logo,
    colors,
    socialLinks 
  } = useStoreConfig();
  
  const { format } = useCurrency();
  const { colors: themeColors } = useTheme();

  return (
    <div 
      className="p-6 rounded-lg shadow-md"
      style={{ 
        backgroundColor: colors.surface,
        borderColor: colors.border,
        color: colors.text.primary 
      }}
    >
      {/* Store Logo */}
      <div className="mb-4">
        <img 
          src={logo.primary} 
          alt={`${storeName} logo`}
          className="h-12 w-auto"
        />
      </div>

      {/* Store Information */}
      <div className="mb-4">
        <h1 
          className="text-2xl font-bold mb-2"
          style={{ color: colors.primary }}
        >
          {storeName}
        </h1>
        {storeTagline && (
          <p 
            className="text-lg"
            style={{ color: colors.text.secondary }}
          >
            {storeTagline}
          </p>
        )}
      </div>

      {/* Contact Information */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Contact Information</h3>
        <div className="space-y-1">
          <p>
            <span className="font-medium">Email:</span> {storeEmail}
          </p>
          {storePhone && (
            <p>
              <span className="font-medium">Phone:</span> {storePhone}
            </p>
          )}
        </div>
      </div>

      {/* Currency Example */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Pricing Example</h3>
        <div className="space-y-1">
          <p>Sample Price: {format(29.99)}</p>
          <p>Sale Price: {format(19.99)}</p>
        </div>
      </div>

      {/* Social Media Links */}
      {socialLinks.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Follow Us</h3>
          <div className="flex space-x-4">
            {socialLinks.map(({ platform, url }) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline"
                style={{ color: colors.primary }}
              >
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreInfo;


