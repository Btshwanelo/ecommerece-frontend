"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, CheckCircle2 } from "lucide-react";
import { api, endpoints } from "@/lib/api";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearCart } from "@/store/slices/cartSlice";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const dispatch = useAppDispatch();
  const cartItemCount = useAppSelector((state) => state.cart.itemCount);

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // Format price
  const formatPrice = (price: number, currency: string = "R") => {
    const currencySymbol = currency === "R" ? "R" : "$";
    return `${currencySymbol}${price.toFixed(2)}`;
  };

  useEffect(() => {
    if (!orderId) {
      setError("Order ID is missing.");
      setLoading(false);
      return;
    }

    const handlePaymentSuccess = async () => {
      try {
        setLoading(true);
        
        if (!orderId) {
          setError("Order ID is missing.");
          setLoading(false);
          return;
        }

        // Get sessionId from sessionStorage for guest checkout
        const sessionId = sessionStorage.getItem("sessionId");
        
        // Always fetch order details from the API using orderId
        const headers: Record<string, string> = {};
        if (sessionId) {
          headers['x-session-id'] = sessionId;
        }
        
        // Determine if orderId is a MongoDB _id (24 hex chars) or order number (starts with "ORD-")
        const isOrderNumber = orderId?.startsWith("ORD-");
        const isMongoId = orderId && /^[0-9a-fA-F]{24}$/.test(orderId);
        
        let fetchedOrder;
        
        try {
          if (isOrderNumber) {
            // Fetch by order number
            const response = await api.get(endpoints.orders.byNumber(orderId), { headers });
            fetchedOrder = response.data;
          } else if (isMongoId) {
            // Fetch by MongoDB _id
            const response = await api.get(endpoints.orders.detail(orderId), { headers });
            fetchedOrder = response.data;
          } else {
            // Try both: order number first, then MongoDB _id
            try {
              const response = await api.get(endpoints.orders.byNumber(orderId), { headers });
              fetchedOrder = response.data;
            } catch (byNumberError: any) {
              // If that fails, try MongoDB _id
              try {
                const response = await api.get(endpoints.orders.detail(orderId), { headers });
                fetchedOrder = response.data;
              } catch (byIdError: any) {
                console.error("Error fetching order by number:", byNumberError);
                console.error("Error fetching order by ID:", byIdError);
                throw byIdError; // Re-throw to trigger fallback
              }
            }
          }
        } catch (error: any) {
          console.error("Error fetching order:", error);
          
          // Last resort: try to get order from stored checkout data
          const storedCheckoutData = sessionStorage.getItem("checkoutData");
          if (storedCheckoutData) {
            const checkoutData = JSON.parse(storedCheckoutData);
            if (checkoutData.order) {
              setOrder(checkoutData.order);
              sessionStorage.removeItem("checkoutData");
              
              // Clear Redux cart state (no API call needed)
              dispatch(clearCart());
              setLoading(false);
              return;
            }
          }
          
          setError("Order not found. Please contact support with your order ID.");
          setLoading(false);
          return;
        }

        if (fetchedOrder.success && fetchedOrder.order) {
          const orderData = fetchedOrder.order;
          setOrder(orderData);
          
          // Clear checkout data from sessionStorage
          sessionStorage.removeItem("checkoutData");
          
          // Update payment status to "completed" if it's still pending
          // Use order._id for the confirm payment endpoint (it expects MongoDB _id)
          const orderMongoId = orderData._id;
          if (orderData.payment?.status === "pending" || orderData.payment?.status === "processing") {
            if (orderMongoId) {
              try {
                // Get sessionId for guest checkout
                const sessionId = sessionStorage.getItem("sessionId");
                const headers: Record<string, string> = {};
                if (sessionId) {
                  headers['x-session-id'] = sessionId;
                }
                
                // Confirm payment success via API (uses MongoDB _id)
                await api.put(endpoints.orders.confirmPayment(orderMongoId), {}, { headers });
                setPaymentConfirmed(true);
                
                // Update order data with confirmed payment status
                orderData.payment.status = "completed";
                setOrder({ ...orderData });
              } catch (paymentError: any) {
                console.warn("Failed to confirm payment status:", paymentError);
                // Don't fail the entire flow if payment confirmation fails
              }
            }
          } else if (orderData.payment?.status === "completed") {
            setPaymentConfirmed(true);
          }
          
          // Clear Redux cart state (no API call needed)
          dispatch(clearCart());
        } else {
          setError("Order not found. Please contact support with your order ID.");
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
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white border-b border-neutral-200">
          <button
            onClick={() => router.back()}
            className="text-neutral-900 hover:opacity-70 transition-opacity"
            aria-label="Go back"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-neutral-900">
              YZY WALLET
            </span>
            <Link
              href="/cart"
              className="relative text-neutral-900 hover:opacity-70 transition-opacity"
              aria-label="View cart"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-neutral-900 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Loading State */}
        <div className="flex items-center justify-center min-h-screen pt-16">
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-neutral-900">
              PROCESSING YOUR PAYMENT...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white border-b border-neutral-200">
          <button
            onClick={() => router.back()}
            className="text-neutral-900 hover:opacity-70 transition-opacity"
            aria-label="Go back"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-neutral-900">
              YZY WALLET
            </span>
            <Link
              href="/cart"
              className="relative text-neutral-900 hover:opacity-70 transition-opacity"
              aria-label="View cart"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-neutral-900 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Error State */}
        <div className="flex items-center justify-center min-h-screen pt-16 px-6">
          <div className="text-center max-w-md">
            <p className="text-xs uppercase tracking-widest text-neutral-900 mb-4">
              PAYMENT ERROR
            </p>
            <p className="text-sm text-neutral-700 mb-6">{error}</p>
            <button
              onClick={() => router.push("/cart")}
              className="border border-neutral-900 bg-white text-neutral-900 px-8 py-3 text-xs uppercase tracking-widest hover:bg-neutral-900 hover:text-white transition-colors"
            >
              BACK TO CART
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white border-b border-neutral-200">
        <button
          onClick={() => router.push("/products")}
          className="text-neutral-900 hover:opacity-70 transition-opacity"
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-widest text-neutral-900">
            YZY WALLET
          </span>
          <Link
            href="/cart"
            className="relative text-neutral-900 hover:opacity-70 transition-opacity"
            aria-label="View cart"
          >
            <ShoppingBag className="h-6 w-6" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-neutral-900 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Success Icon & Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-900 mb-6">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-xs uppercase tracking-widest text-neutral-900 mb-4">
              PAYMENT SUCCESSFUL
            </h1>
            <p className="text-sm text-neutral-700 ">
              Your order has been confirmed. You will receive an email confirmation shortly.
            </p>
          </div>

          {/* Order Details */}
          {order && (
            <div className="border border-neutral-200 bg-white mb-8">
              {/* Order Number */}
              <div className="border-b border-neutral-200 px-6 py-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest text-neutral-500">
                    ORDER NUMBER
                  </span>
                  <span className="text-sm font-medium text-neutral-900">
                    {order.orderNumber || order._id}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              {order.items && order.items.length > 0 && (
                <div className="border-b border-neutral-200 px-6 py-4">
                  <h2 className="text-xs uppercase tracking-widest text-neutral-900 mb-4">
                    ORDER ITEMS
                  </h2>
                  <div className="space-y-4">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm text-neutral-900 mb-1">
                            {item.productName || item.product?.name || "Product"}
                          </p>
                          <div className="flex gap-4 text-xs uppercase tracking-widest text-neutral-500">
                            {item.variantName && (
                              <>
                                <span>SIZE</span>
                                <span>{item.variantName}</span>
                              </>
                            )}
                            <span>QTY</span>
                            <span>{item.quantity}</span>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-neutral-900">
                          {formatPrice(item.totalPrice || item.unitPrice * item.quantity || 0)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="border-b border-neutral-200 px-6 py-4">
                  <h2 className="text-xs uppercase tracking-widest text-neutral-900 mb-4">
                    SHIPPING ADDRESS
                  </h2>
                  <div className="text-sm text-neutral-700 space-y-1">
                    <p>
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </p>
                    <p>{order.shippingAddress.addressLine1 || order.shippingAddress.street}</p>
                    {order.shippingAddress.addressLine2 && (
                      <p>{order.shippingAddress.addressLine2}</p>
                    )}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
              )}

              {/* Totals */}
              {order.totals && (
                <div className="border-b border-neutral-200 px-6 py-4 space-y-2">
                  {order.totals.subtotal && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-700">SUBTOTAL</span>
                      <span className="text-neutral-900">{formatPrice(order.totals.subtotal)}</span>
                    </div>
                  )}
                  {order.totals.shippingAmount && order.totals.shippingAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-700">SHIPPING</span>
                      <span className="text-neutral-900">
                        {formatPrice(order.totals.shippingAmount)}
                      </span>
                    </div>
                  )}
                  {order.totals.taxAmount && order.totals.taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-700">TAX</span>
                      <span className="text-neutral-900">{formatPrice(order.totals.taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-medium pt-2 border-t border-neutral-200">
                    <span className="text-neutral-900">TOTAL</span>
                    <span className="text-neutral-900">
                      {formatPrice(order.totals.total || 0)}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Info */}
              <div className="px-6 py-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-700 uppercase tracking-widest text-xs">
                    PAYMENT METHOD
                  </span>
                  <span className="text-neutral-900 uppercase">
                    {order.payment?.method || "payfast"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-700 uppercase tracking-widest text-xs">
                    STATUS
                  </span>
                  <span className="text-neutral-900 uppercase">
                    {order.payment?.status === "paid" || order.status === "paid"
                      ? "PAID"
                      : order.status?.toUpperCase() || "PENDING"}
                  </span>
                </div>
                {order.customerEmail && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-700 uppercase tracking-widest text-xs">
                      EMAIL
                    </span>
                    <span className="text-neutral-900">{order.customerEmail}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 mb-8">
            <Link
              href="/products"
              className="border border-neutral-900 bg-white text-neutral-900 px-8 py-4 text-xs uppercase tracking-widest hover:bg-neutral-900 hover:text-white transition-colors text-center"
            >
              CONTINUE SHOPPING
            </Link>
            {orderId && (
              <Link
                href={`/account/orders/${orderId}`}
                className="border border-neutral-300 bg-white text-neutral-900 px-8 py-4 text-xs uppercase tracking-widest hover:border-neutral-900 transition-colors text-center"
              >
                VIEW ORDER
              </Link>
            )}
          </div>

          {/* Info Message */}
          <div className="border border-neutral-200 bg-neutral-50 px-6 py-4">
            <p className="text-xs uppercase tracking-widest text-neutral-900 mb-2">
              WHAT'S NEXT?
            </p>
            <p className="text-xs text-neutral-700">
              You will receive an email confirmation shortly. We'll process your order and send
              you tracking information once it ships.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-xs uppercase tracking-widest text-neutral-900">
            LOADING...
          </p>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
