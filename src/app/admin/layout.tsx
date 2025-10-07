import { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminGuard from "@/components/admin/AdminGuard";

export const metadata: Metadata = {
  title: "Admin Dashboard - Store Management",
  description: "Manage your e-commerce store with our comprehensive admin dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-6 ml-64">
            {children}
          </main>
        </div>
      </div>
    // </AdminGuard>
  );
}
