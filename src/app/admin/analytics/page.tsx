"use client";

import { useState, useEffect } from "react";
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ShoppingBagIcon, 
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from "@heroicons/react/24/outline";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  productsGrowth: number;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock data since analytics endpoints may not be implemented yet
      // In a real implementation, you would call the analytics API here
      setAnalyticsData(getMockAnalyticsData());
    } catch (error) {
      console.error("Error fetching analytics:", error);
      // Use mock data as fallback
      setAnalyticsData(getMockAnalyticsData());
    } finally {
      setLoading(false);
    }
  };

  const getMockAnalyticsData = (): AnalyticsData => ({
    totalRevenue: 125430,
    totalOrders: 1247,
    totalCustomers: 892,
    totalProducts: 156,
    revenueGrowth: 12.5,
    ordersGrowth: 8.3,
    customersGrowth: 15.2,
    productsGrowth: 3.1,
    revenueByMonth: [
      { month: "Jan", revenue: 45000 },
      { month: "Feb", revenue: 52000 },
      { month: "Mar", revenue: 48000 },
      { month: "Apr", revenue: 61000 },
      { month: "May", revenue: 55000 },
      { month: "Jun", revenue: 67000 },
    ],
    topProducts: [
      { name: "Premium T-Shirt", sales: 234, revenue: 23400 },
      { name: "Designer Jeans", sales: 189, revenue: 37800 },
      { name: "Running Shoes", sales: 156, revenue: 31200 },
      { name: "Winter Jacket", sales: 98, revenue: 19600 },
      { name: "Baseball Cap", sales: 87, revenue: 4350 },
    ],
    ordersByStatus: [
      { status: "delivered", count: 856 },
      { status: "shipped", count: 234 },
      { status: "processing", count: 123 },
      { status: "pending", count: 34 },
    ],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? "text-green-600" : "text-red-600";
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(analyticsData?.totalRevenue || 0)}
              </p>
              <div className="flex items-center mt-1">
                {analyticsData?.revenueGrowth && (
                  <>
                    {(() => {
                      const GrowthIcon = getGrowthIcon(analyticsData.revenueGrowth);
                      return <GrowthIcon className={`h-4 w-4 ${getGrowthColor(analyticsData.revenueGrowth)}`} />;
                    })()}
                    <span className={`text-sm ${getGrowthColor(analyticsData.revenueGrowth)}`}>
                      {Math.abs(analyticsData.revenueGrowth)}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(analyticsData?.totalOrders || 0)}
              </p>
              <div className="flex items-center mt-1">
                {analyticsData?.ordersGrowth && (
                  <>
                    {(() => {
                      const GrowthIcon = getGrowthIcon(analyticsData.ordersGrowth);
                      return <GrowthIcon className={`h-4 w-4 ${getGrowthColor(analyticsData.ordersGrowth)}`} />;
                    })()}
                    <span className={`text-sm ${getGrowthColor(analyticsData.ordersGrowth)}`}>
                      {Math.abs(analyticsData.ordersGrowth)}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <UsersIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(analyticsData?.totalCustomers || 0)}
              </p>
              <div className="flex items-center mt-1">
                {analyticsData?.customersGrowth && (
                  <>
                    {(() => {
                      const GrowthIcon = getGrowthIcon(analyticsData.customersGrowth);
                      return <GrowthIcon className={`h-4 w-4 ${getGrowthColor(analyticsData.customersGrowth)}`} />;
                    })()}
                    <span className={`text-sm ${getGrowthColor(analyticsData.customersGrowth)}`}>
                      {Math.abs(analyticsData.customersGrowth)}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <ChartBarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(analyticsData?.totalProducts || 0)}
              </p>
              <div className="flex items-center mt-1">
                {analyticsData?.productsGrowth && (
                  <>
                    {(() => {
                      const GrowthIcon = getGrowthIcon(analyticsData.productsGrowth);
                      return <GrowthIcon className={`h-4 w-4 ${getGrowthColor(analyticsData.productsGrowth)}`} />;
                    })()}
                    <span className={`text-sm ${getGrowthColor(analyticsData.productsGrowth)}`}>
                      {Math.abs(analyticsData.productsGrowth)}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
          <div className="space-y-3">
            {analyticsData?.revenueByMonth.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.month}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(item.revenue / Math.max(...(analyticsData?.revenueByMonth.map(r => r.revenue) || [1]))) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-16 text-right">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Orders by Status</h3>
          <div className="space-y-3">
            {analyticsData?.ordersByStatus.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{item.status}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${(item.count / Math.max(...(analyticsData?.ordersByStatus.map(o => o.count) || [1]))) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-16 text-right">
                    {formatNumber(item.count)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Products</h3>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData?.topProducts.map((product, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(product.sales)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(product.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
