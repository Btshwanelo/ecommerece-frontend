"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminGuard from "@/components/admin/AdminGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    // <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex">
          <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 mt-6 p-4 md:p-6 pt-20 md:pt-6 ml-0 md:ml-64 transition-all duration-300">
            {children}
          </main>
        </div>
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    // </AdminGuard>
  );
}
