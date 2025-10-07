"use client";

import { useState, useEffect } from "react";
import { Order } from "@/types";
import { format } from "date-fns";

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8080/api/v2/orders?limit=5", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Recent Orders API Response:", data); // Debug log
          const ordersArray = Array.isArray(data.orders) ? data.orders : [];
          setOrders(ordersArray);
        } else {
          console.error("Failed to fetch recent orders:", response.status, response.statusText);
          setOrders([]);
        }
      } catch (error) {
        console.error("Error fetching recent orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
      <div className="space-y-4">
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No orders found</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Order #{order._id.slice(-8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(order.createdAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  ${order?.total?.toFixed(2)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
