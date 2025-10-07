import { Suspense } from "react";
import DashboardStats from "@/components/admin/DashboardStats";
import RecentOrders from "@/components/admin/RecentOrders";
import TopProducts from "@/components/admin/TopProducts";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your store management dashboard</p>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <DashboardStats />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<LoadingSpinner />}>
          <RecentOrders />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <TopProducts />
        </Suspense>
      </div>
    </div>
  );
}
