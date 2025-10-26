"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CreditCard, Lock, ArrowLeft, CheckCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Order } from "@/types";
import { OrderService } from "@/services/v2";
import { formatCurrency } from "@/lib/storeConfig";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("payfast");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [orderTotal, setOrderTotal] = useState(0);

  // PayFast configuration - simple integration
  const PAYFAST_CONFIG = {
    merchant_id: "10038198",
    merchant_key: "8yshtxb2mu1oa",
    sandbox: true, // Sandbox mode for testing
  };

  useEffect(() => {
    if (!orderId) {
      router.push("/checkout");
      return;
    }

    // Retrieve checkout data from sessionStorage
    const storedCheckoutData = sessionStorage.getItem("checkoutData");
    if (storedCheckoutData) {
      const checkoutData = JSON.parse(storedCheckoutData);
      console.log("Retrieved checkout data:", checkoutData);

      // Get the actual order total
      let total = 0;

      if (checkoutData.amount) {
        total = parseFloat(checkoutData.amount);
      } else if (checkoutData.totals?.total) {
        total = parseFloat(checkoutData.totals.total);
      } else {
        // Fallback: try to get from cart in sessionStorage
        const cartData = sessionStorage.getItem("cart");
        if (cartData) {
          try {
            const cart = JSON.parse(cartData);
            total = parseFloat(cart.totals?.total || 0);
          } catch (e) {
            console.error("Error parsing cart data:", e);
          }
        }
      }

      setOrderTotal(total);
    } else {
      console.log("No checkout data found in sessionStorage");
    }

    console.log("Payment page loaded for order:", orderId);
  }, [orderId, router]);

  const handlePayment = async () => {
    if (!orderId) return;

    setProcessingPayment(true);
    setPaymentMessage(null);

    try {
      // Get checkout data from sessionStorage
      const storedCheckoutData = sessionStorage.getItem("checkoutData");
      if (!storedCheckoutData) {
        setPaymentMessage({
          type: "error",
          message: "Checkout data not found. Please start over.",
        });
        setProcessingPayment(false);
        return;
      }

      const checkoutData = JSON.parse(storedCheckoutData);
      console.log("Checkout data received:", checkoutData);

      // Handle payment based on selected method
      if (selectedPaymentMethod === "payfast") {
        await processPayfastPayment(checkoutData);
      } else if (selectedPaymentMethod === "cod") {
        const response = await OrderService.completeCheckout({
          ...checkoutData,
          paymentMethod: "cod",
        });

        if (response.success) {
          setPaymentMessage({
            type: "success",
            message: "Order placed successfully! You will pay on delivery.",
          });

          sessionStorage.removeItem("checkoutData");

          setTimeout(() => {
            router.push(`/order-success?orderId=${orderId}`);
          }, 2000);
        } else {
          setPaymentMessage({
            type: "error",
            message: response.error || "Payment failed. Please try again.",
          });
        }
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setPaymentMessage({
        type: "error",
        message: error.message || "Payment failed. Please try again.",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const processPayfastPayment = async (checkoutData: any) => {
    try {
      // Use contact details from checkout data
      const userDetails = checkoutData.userContact || {
        firstName: "Customer",
        lastName: "User", 
        email: "customer@example.com",
        phone: "",
      };

      // Validate required fields
      if (!userDetails.email || userDetails.email === "customer@example.com") {
        setPaymentMessage({
          type: "error",
          message: "Please ensure you have a valid email address.",
        });
        setProcessingPayment(false);
        return;
      }

      // Validate amount
      if (orderTotal <= 0) {
        setPaymentMessage({
          type: "error",
          message: "Invalid order amount. Please try again.",
        });
        setProcessingPayment(false);
        return;
      }

      console.log("Order total for Payfast:", orderTotal);
      console.log("User details from checkout:", userDetails);

      // Simple PayFast payment data - basic fields with return URLs
      const paymentData: Record<string, any> = {
        merchant_id: PAYFAST_CONFIG.merchant_id,
        merchant_key: PAYFAST_CONFIG.merchant_key,
        amount: orderTotal.toFixed(2),
        item_name: `Order ${orderId}`,
        return_url: `${window.location.origin}/checkout/payment/success?orderId=${orderId}`,
        cancel_url: `${window.location.origin}/checkout/payment/cancel?orderId=${orderId}`,
      };

      console.log("Simple Payment Data:", paymentData);

      // Create form and submit to PayFast
      const form = document.createElement("form");
      form.method = "POST";
      form.action = PAYFAST_CONFIG.sandbox
        ? "https://sandbox.payfast.co.za/eng/process"
        : "https://www.payfast.co.za/eng/process";

      // Add form fields
      Object.keys(paymentData).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = paymentData[key];
        form.appendChild(input);
      });

      console.log("Submitting simple form to PayFast:", form.action);
      document.body.appendChild(form);

      setPaymentMessage({
        type: "success",
        message: "Redirecting to Payfast for secure payment...",
      });

      // DON'T clear checkout data yet - we need it for order creation after payment
      // sessionStorage.removeItem("checkoutData");

      // Submit form
      form.submit();
    } catch (error: any) {
      console.error("Payfast payment error:", error);
      setPaymentMessage({
        type: "error",
        message: error.message || "Payment failed. Please try again.",
      });
      setProcessingPayment(false);
    }
  };

  if (!orderId) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Invalid Order
            </h1>
            <p className="text-gray-600 mb-6">No order ID provided.</p>
            <button
              onClick={() => router.push("/checkout")}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Checkout
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Complete Payment
            </h1>
            <p className="text-gray-600 mt-2">Order ID: {orderId}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Method Selection */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Payfast Payment */}
                  <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="payfast"
                        checked={selectedPaymentMethod === "payfast"}
                        onChange={(e) =>
                          setSelectedPaymentMethod(e.target.value)
                        }
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Payfast
                        </p>
                        <p className="text-xs text-gray-500">
                          Pay securely with your card
                        </p>
                      </div>
                    </div>
                    <div className="">
                      <img
                        src="/Payfast logo.svg"
                        alt="Payfast"
                        width={40}
                        height={40}
                        className="mt-2"
                      />
                    </div>
                  </label>
                </div>

                {/* Phone Number Input for Payfast */}
                {selectedPaymentMethod === "payfast" && (
                  <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Contact Information
                    </h3>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 mt-4">
                  <img
                    src="/mastercard.svg"
                    alt="Mastercard"
                    width={40}
                    height={40}
                    className="mt-2"
                  />
                  <img
                    src="/visa.svg"
                    alt="Visa"
                    width={40}
                    height={40}
                    className="mt-2"
                  />
                  <img
                    src="/maestro.svg"
                    alt="Maestro"
                    width={40}
                    height={40}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">
                        Total:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(orderTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Message */}
                {paymentMessage && (
                  <div
                    className={`mb-4 p-3 rounded-lg ${
                      paymentMessage.type === "success"
                        ? "bg-green-50 text-green-800"
                        : "bg-red-50 text-red-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {paymentMessage.type === "success" && (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      <span className="text-sm">{paymentMessage.message}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={processingPayment}
                  className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingPayment ? "Processing..." : "Pay with Payfast (Simple)"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function PaymentPage() {
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
      <PaymentContent />
    </Suspense>
  );
}
