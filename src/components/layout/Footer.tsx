import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { useStoreConfig } from "@/hooks/useStoreConfig";

const Footer = () => {
  const { storeName, storeTagline, socialLinks, storeWebsite } =
    useStoreConfig();

  const footerLinks = {
    products: [
      { name: "Shoes", href: "/products/category/shoes" },
      { name: "Clothing", href: "/products/category/clothing" },
      { name: "Accessories", href: "/products/category/accessories" },
      { name: "New Arrivals", href: "/products/category/new" },
      { name: "Sale", href: "/products/category/sales" },
    ],
    support: [
      { name: "Help", href: "/help" },
      { name: "Contact Us", href: "/contact" },
      { name: "Returns", href: "/returns" },
      { name: "Order Status", href: "/orders" },
      { name: "Size Guide", href: "/size-guide" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
      { name: "Investors", href: "/investors" },
      { name: "Sustainability", href: "/sustainability" },
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bottom section */}
        <div className="">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4 md:mb-0">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="hover:text-white transition-colors"
              >
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
