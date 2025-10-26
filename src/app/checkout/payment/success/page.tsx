"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { OrderService, CartService } from "@/services/v2";
import { PayfastService } from "@/services/v2/payfastService";
import { formatCurrency } from "@/lib/storeConfig";

function PaymentSuccessContent() {
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

    const handlePaymentSuccess = async () => {
      try {
        setLoading(true);
        
        // Get checkout data from sessionStorage
        const storedCheckoutData = sessionStorage.getItem("checkoutData");
        if (!storedCheckoutData) {
          setError("Checkout data not found. Please contact support.");
          setLoading(false);
          return;
        }

        const checkoutData = JSON.parse(storedCheckoutData);
        console.log("Checkout data for order creation:", checkoutData);

        // Create the order with all details after successful payment
        const orderResponse = await OrderService.completeCheckout({
          deliveryOptionId: checkoutData.deliveryOptionId,
          paymentMethod: "payfast",
          paymentStatus: "paid",
          address: checkoutData.useExistingAddress ? undefined : {
            fullName: checkoutData.shippingAddress.fullName || 
              `${checkoutData.shippingAddress.firstName || ""} ${checkoutData.shippingAddress.lastName || ""}`.trim(),
            phone: checkoutData.shippingAddress.phone || checkoutData.userContact.phone || "",
            street: checkoutData.shippingAddress.street || checkoutData.shippingAddress.addressLine1 || "",
            apartment: checkoutData.shippingAddress.apartment || checkoutData.shippingAddress.addressLine2 || "",
            city: checkoutData.shippingAddress.city || "",
            state: checkoutData.shippingAddress.state || "",
            postalCode: checkoutData.shippingAddress.postalCode || "",
            country: checkoutData.shippingAddress.country || "US",
          },
          addressId: checkoutData.useExistingAddress ? checkoutData.selectedAddressId : undefined,
          notes: `Payment processed via Payfast. Contact: ${checkoutData.userContact.email}`,
        });

        if (orderResponse.success && orderResponse.order) {
          setOrder(orderResponse.order);
          
          // Clear checkout data after successful order creation
          sessionStorage.removeItem("checkoutData");
          
          // Clear cart after successful order
          try {
            await CartService.clearCart();
          } catch (e) {
            console.warn("Failed to clear cart:", e);
          }
        } else {
          setError(orderResponse.error || "Failed to create order after payment.");
        }
      } catch (e: any) {
        console.error("Payment success processing error:", e);
        setError(e?.message || "Failed to process payment success.");
      } finally {
        setLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [orderId, searchParams]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p>Processing your payment...</p>
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
            <p className="text-lg font-semibold mb-4">Payment Error</p>
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
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Thank you for your purchase. Your payment has been processed successfully.
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
                  {formatCurrency(order.totals?.total || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium text-gray-900 capitalize">
                  Payfast
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Status:</span>
                <span className="font-medium text-green-600 capitalize">
                  Paid
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/products"
            className="bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href={`/account/orders/${orderId}`}
            className="border border-gray-300 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            View Order
          </Link>
        </div>

        <div className="mt-8 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>What's next?</strong> You will receive an email confirmation shortly. 
            We'll process your order and send you tracking information once it ships.
          </p>
        </div>
      </motion.div>
    </Layout>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </Layout>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
