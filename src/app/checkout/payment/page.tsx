"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CreditCard, Lock, ArrowLeft, CheckCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Order } from "@/types";
import { OrderService } from "@/services/v2";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("cod");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  useEffect(() => {
    if (!orderId) {
      router.push("/checkout");
      return;
    }

    // Retrieve checkout data from sessionStorage
    const storedCheckoutData = sessionStorage.getItem("checkoutData");
    if (storedCheckoutData) {
      console.log("Retrieved checkout data:", JSON.parse(storedCheckoutData));
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

      // Complete the order with payment method
      if (selectedPaymentMethod === "cod") {
        const response = await OrderService.completeCheckout({
          ...checkoutData,
          paymentMethod: "cod",
        });

        if (response.success) {
          setPaymentMessage({
            type: "success",
            message: "Order placed successfully! You will pay on delivery.",
          });

          // Clear checkout data from sessionStorage
          sessionStorage.removeItem("checkoutData");

          // Redirect to success page after a delay
          setTimeout(() => {
            router.push(`/order-success?orderId=${orderId}`);
          }, 2000);
        } else {
          setPaymentMessage({
            type: "error",
            message: response.error || "Payment failed. Please try again.",
          });
        }
      } else if (selectedPaymentMethod === "card") {
        // For card payments, integrate with payment gateway
        await processCardPayment(checkoutData);
      } else if (selectedPaymentMethod === "bank_transfer") {
        // For bank transfer, complete order with bank transfer payment method
        const response = await OrderService.completeCheckout({
          ...checkoutData,
          paymentMethod: "bank_transfer",
        });

        if (response.success) {
          setPaymentMessage({
            type: "success",
            message:
              "Order placed successfully! Please complete the bank transfer using the details provided.",
          });

          // Clear checkout data from sessionStorage
          sessionStorage.removeItem("checkoutData");

          // Redirect to success page after a delay
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

  const processCardPayment = async (checkoutData: any) => {
    // Validate card details
    if (
      !cardDetails.cardNumber ||
      !cardDetails.expiryDate ||
      !cardDetails.cvv ||
      !cardDetails.cardholderName
    ) {
      setPaymentMessage({
        type: "error",
        message: "Please fill in all card details.",
      });
      return;
    }

    // In a real implementation, you would:
    // 1. Integrate with payment gateway (Stripe, PayPal, etc.)
    // 2. Process the payment
    // 3. Handle the response

    // For now, we'll simulate a successful payment
    console.log("Processing card payment:", cardDetails);

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const response = await OrderService.completeCheckout({
      ...checkoutData,
      paymentMethod: "card",
      paymentDetails: {
        cardLast4: cardDetails.cardNumber.slice(-4),
        cardType: "visa", // You would determine this from the card number
      },
    });

    if (response.success) {
      setPaymentMessage({
        type: "success",
        message: "Payment successful! Your order has been placed.",
      });

      // Clear checkout data from sessionStorage
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
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
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
                  {/* Cash on Delivery */}
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
                          Pay securely with your card{" "}
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

                <div className="flex items-center justify-center gap-2 mt-4">
                  <img
                    src="/mastercard.svg"
                    alt="Payfast"
                    width={40}
                    height={40}
                    className="mt-2"
                  />
                  <img
                    src="/visa.svg"
                    alt="Payfast"
                    width={40}
                    height={40}
                    className="mt-2"
                  />
                  <img
                    src="/maestro.svg"
                    alt="Payfast"
                    width={40}
                    height={40}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Card Details Form */}
              {selectedPaymentMethod === "card" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Lock className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Card Details
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.cardNumber}
                        onChange={(e) =>
                          setCardDetails({
                            ...cardDetails,
                            cardNumber: formatCardNumber(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        maxLength={19}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardDetails.expiryDate}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              expiryDate: formatExpiryDate(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          value={cardDetails.cvv}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              cvv: e.target.value.replace(/\D/g, ""),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          maxLength={4}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={cardDetails.cardholderName}
                        onChange={(e) =>
                          setCardDetails({
                            ...cardDetails,
                            cardholderName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Bank Transfer Details */}
              {selectedPaymentMethod === "bank_transfer" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Bank Transfer Details
                    </h3>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Bank Name:</span>
                      <span className="text-sm font-medium">
                        Your Bank Name
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Account Number:
                      </span>
                      <span className="text-sm font-medium">1234567890</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Routing Number:
                      </span>
                      <span className="text-sm font-medium">987654321</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Reference:</span>
                      <span className="text-sm font-medium">{orderId}</span>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Important:</strong> Please include the order ID (
                      {orderId}) as the payment reference. Your order will be
                      processed once the payment is confirmed.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">
                        Total:
                      </span>
                      <span className="font-semibold text-gray-900">$0.00</span>
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
                  {processingPayment ? "Processing..." : "Complete Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
