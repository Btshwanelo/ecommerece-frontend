"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { OrderService } from "@/services/v2";
import { PayfastService } from "@/services/v2/payfastService";

export default function PaymentCancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("Order ID is missing.");
      setLoading(false);
      return;
    }

    const handlePaymentCancel = async () => {
      try {
        setLoading(true);
        
        // Handle the payment cancellation
        const result = await PayfastService.handlePaymentReturn(
          orderId,
          'cancel',
          Object.fromEntries(searchParams.entries())
        );

        if (!result.success) {
          setError(result.message);
          setLoading(false);
          return;
        }

        // Fetch order details by order number
        const response = await OrderService.getOrderByNumber(orderId);
        if (response.success && response.order) {
          setOrder(response.order);
        } else {
          setError(response.error || "Failed to load order details.");
        }
      } catch (e: any) {
        setError(e?.message || "Failed to process payment cancellation.");
      } finally {
        setLoading(false);
      }
    };

    handlePaymentCancel();
  }, [orderId, searchParams]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p>Processing cancellation...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64 text-red-600">
          <div className="text-center">
            <p className="text-lg font-semibold mb-4">Error</p>
            <p>{error}</p>
            <button
              onClick={() => router.push('/checkout')}
              className="mt-4 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
            >
              Back to Checkout
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-12 max-w-2xl text-center"
      >
        <XCircle className="h-20 w-20 text-orange-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Payment Cancelled
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Your payment was cancelled. No charges have been made to your account.
        </p>

        {order && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Order Details
            </h2>
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-medium text-gray-900">
                  {order.orderNumber || order._id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-gray-900">
                  R{(order.totals?.total || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Status:</span>
                <span className="font-medium text-orange-600 capitalize">
                  Cancelled
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href={`/checkout/payment?orderId=${orderId}`}
            className="bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Payment Again
          </Link>
          <Link
            href="/checkout"
            className="border border-gray-300 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Checkout
          </Link>
        </div>

        <div className="mt-8 p-4 bg-orange-50 rounded-lg">
          <p className="text-sm text-orange-800">
            <strong>Need help?</strong> If you're experiencing issues with payment, 
            please contact our support team or try a different payment method.
          </p>
        </div>
      </motion.div>
    </Layout>
  );
}
