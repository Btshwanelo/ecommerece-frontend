"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Order } from "@/types";

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push("/");
      return;
    }
    
    // In a real implementation, you would fetch the order details here
    // For now, we'll simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [orderId, router]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Order Placed Successfully!
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              Thank you for your order. We've received your payment and will process your order shortly.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Order ID: <span className="font-mono font-medium">{orderId}</span>
            </p>

            {/* Order Details Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8 text-left">
              <div className="flex items-center gap-3 mb-4">
                <Package className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Order Details
                </h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Order Number:</span>
                  <span className="text-sm font-medium font-mono">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className="text-sm font-medium text-green-600">Confirmed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment Method:</span>
                  <span className="text-sm font-medium">Cash on Delivery</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Estimated Delivery:</span>
                  <span className="text-sm font-medium">3-5 business days</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                What's Next?
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>• You'll receive an email confirmation shortly</p>
                <p>• We'll prepare your order for shipping</p>
                <p>• You'll get tracking information once shipped</p>
                <p>• Payment will be collected upon delivery</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/")}
                className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                <Home className="h-4 w-4" />
                Continue Shopping
              </button>
              <button
                onClick={() => router.push(`/orders/${orderId}`)}
                className="flex items-center justify-center gap-2 bg-white text-black border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                View Order Details
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}


