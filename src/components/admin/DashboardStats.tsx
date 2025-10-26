"use client";

import { useState, useEffect } from "react";
import { 
  ShoppingBagIcon, 
  ClipboardDocumentListIcon, 
  UsersIcon, 
  CurrencyDollarIcon 
} from "@heroicons/react/24/outline";
import { StatsService, type DashboardStats } from "@/services/v2";
import { formatCurrency } from "@/lib/storeConfig";

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await StatsService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const statsCards = [
    {
      name: "Total Products",
      value: stats?.totalProducts || 0,
      icon: ShoppingBagIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      name: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ClipboardDocumentListIcon,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      name: "Total Customers",
      value: stats?.totalCustomers || 0,
      icon: UsersIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      name: "Total Revenue",
      value: `${formatCurrency(stats?.totalRevenue || 0)}`,
      icon: CurrencyDollarIcon,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat) => (
        <div key={stat.name} className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
