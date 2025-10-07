"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  SwatchIcon, 
  TagIcon, 
  CubeIcon, 
  UserGroupIcon, 
  SunIcon, 
  SparklesIcon, 
  Squares2X2Icon, 
  AcademicCapIcon, 
  AdjustmentsHorizontalIcon, 
  CalendarIcon, 
  HeartIcon 
} from "@heroicons/react/24/outline";

const attributeTypes = [
  {
    name: "Colors",
    href: "/admin/attributes/colors",
    icon: SwatchIcon,
    description: "Manage product colors with hex codes",
    color: "bg-red-500"
  },
  {
    name: "Sizes",
    href: "/admin/attributes/sizes",
    icon: TagIcon,
    description: "Manage size options for different categories",
    color: "bg-blue-500"
  },
  {
    name: "Materials",
    href: "/admin/attributes/materials",
    icon: CubeIcon,
    description: "Manage product materials and composition",
    color: "bg-green-500"
  },
  {
    name: "Genders",
    href: "/admin/attributes/genders",
    icon: UserGroupIcon,
    description: "Manage target gender categories",
    color: "bg-purple-500"
  },
  {
    name: "Seasons",
    href: "/admin/attributes/seasons",
    icon: SunIcon,
    description: "Manage seasonal appropriateness",
    color: "bg-yellow-500"
  },
  {
    name: "Styles",
    href: "/admin/attributes/styles",
    icon: SparklesIcon,
    description: "Manage product styles (casual, formal, etc.)",
    color: "bg-pink-500"
  },
  {
    name: "Patterns",
    href: "/admin/attributes/patterns",
    icon: Squares2X2Icon,
    description: "Manage pattern types and designs",
    color: "bg-indigo-500"
  },
  {
    name: "Shoe Heights",
    href: "/admin/attributes/shoe-heights",
    icon: AcademicCapIcon,
    description: "Manage shoe height options",
    color: "bg-orange-500"
  },
  {
    name: "Fits",
    href: "/admin/attributes/fits",
    icon: AdjustmentsHorizontalIcon,
    description: "Manage fit types (slim, regular, loose)",
    color: "bg-teal-500"
  },
  {
    name: "Occasions",
    href: "/admin/attributes/occasions",
    icon: CalendarIcon,
    description: "Manage use occasions (work, party, casual)",
    color: "bg-cyan-500"
  },
  {
    name: "Collar Types",
    href: "/admin/attributes/collar-types",
    icon: HeartIcon,
    description: "Manage collar types for shirts and tops",
    color: "bg-rose-500"
  }
];

export default function AttributesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Product Attributes</h1>
        <p className="text-gray-600">Manage all product attributes and variations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {attributeTypes.map((attribute) => (
          <Link
            key={attribute.name}
            href={attribute.href}
            className="group relative bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-200 hover:border-gray-300"
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 w-12 h-12 ${attribute.color} rounded-lg flex items-center justify-center`}>
                <attribute.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                  {attribute.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {attribute.description}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <span>Manage attributes</span>
              <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Attribute Management Tips
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Attributes are used to create product variations and enable advanced filtering</li>
                <li>Some attributes like Styles, Shoe Heights, Fits, and Collar Types can be category-specific</li>
                <li>Colors support hex codes for consistent color representation</li>
                <li>Materials can include composition details for transparency</li>
                <li>All attributes support SEO-friendly slugs and descriptions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
