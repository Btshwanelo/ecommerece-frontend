import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { useStoreConfig } from '@/hooks/useStoreConfig';

const Footer = () => {
  const { storeName, storeTagline, socialLinks, storeWebsite } = useStoreConfig();

  const footerLinks = {
    products: [
      { name: 'Shoes', href: '/products?category=shoes' },
      { name: 'Clothing', href: '/products?category=clothing' },
      { name: 'Accessories', href: '/products?category=accessories' },
      { name: 'New Arrivals', href: '/products?category=new' },
      { name: 'Sale', href: '/products?sale=true' },
    ],
    support: [
      { name: 'Help', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Returns', href: '/returns' },
      { name: 'Order Status', href: '/orders' },
      { name: 'Size Guide', href: '/size-guide' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
      { name: 'Investors', href: '/investors' },
      { name: 'Sustainability', href: '/sustainability' },
    ],
  };

  const socialIcons = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    youtube: Youtube,
  };

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-2xl font-bold mb-4">{storeName}</h3>
            {storeTagline && (
              <p className="text-gray-400 text-sm mb-6">
                {storeTagline}
              </p>
            )}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const IconComponent = socialIcons[social.platform as keyof typeof socialIcons];
                return IconComponent ? (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                ) : null;
              })}
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold mb-4">Products</h4>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4 md:mb-0">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookie Settings
              </Link>
            </div>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} {storeName}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

