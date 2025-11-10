"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Plus, Minus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateItemQuantity,
  removeItem,
  clearCart,
} from "@/store/slices/cartSlice";
import { api } from "@/lib/api";
import Layout from "@/components/layout/Layout";

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Get cart from Redux store
  const cart = useAppSelector((state) => state.cart);
  const cartItemCount = useAppSelector((state) => state.cart.itemCount);
  console.log("Cart in CartPage:", cart);
  // Form state
  const [email, setEmail] = useState("");
  const [subscribe, setSubscribe] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");

  // Payment state
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Format price
  const formatPrice = (price: number, currency: string = "R") => {
    const currencySymbol = currency === "R" ? "R" : "$";
    return `${currencySymbol} ${price.toFixed(2)}`;
  };

  // Get product image
  const getProductImage = (item: any) => {
    const product = item.product;
    if (product?.images && product.images.length > 0) {
      if (typeof product.images[0] === "string") {
        return product.images[0];
      }
      if (typeof product.images[0] === "object") {
        const primaryImage = product.images.find((img: any) => img.isPrimary);
        if (primaryImage?.url) return primaryImage.url;
        if (product.images[0].url) return product.images[0].url;
      }
    }
    return null;
  };

  // Get product code (SKU or generated from product)
  const getProductCode = (item: any) => {
    return item.product.sku || item.product._id.slice(-6).toUpperCase();
  };

  // Handle quantity update
  const handleQuantityUpdate = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch(removeItem(itemId));
    } else {
      dispatch(updateItemQuantity({ itemId, quantity }));
    }
  };

  // Validate form
  const validateForm = () => {
    if (!email || !email.includes("@")) {
      setPaymentError("Please enter a valid email address");
      return false;
    }
    if (!firstName || !lastName) {
      setPaymentError("Please enter your first and last name");
      return false;
    }
    if (!address) {
      setPaymentError("Please enter your address");
      return false;
    }
    if (!city || !country || !state || !zipCode) {
      setPaymentError("Please complete all address fields");
      return false;
    }
    return true;
  };

  // Sync Redux cart to backend before checkout (guest only) - using v3 APIs
  const syncCartToBackend = async () => {
    try {
      // Get or create session ID for guest checkout
      let sessionId = sessionStorage.getItem("sessionId");
      if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        sessionStorage.setItem("sessionId", sessionId);
      }

      // Clear existing backend cart first (in case of updates) - using v3 routes
      try {
        await api.delete("/cart/clear", {
          headers: {
            "x-session-id": sessionId,
          },
        });
      } catch (error) {
        // Cart might not exist yet, that's okay
        console.log("No existing cart to clear");
      }

      // Sync each cart item to backend cart using v3 routes
      for (const item of cart.items) {
        await api.post(
          "/cart/add",
          {
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
          },
          {
            headers: {
              "x-session-id": sessionId,
            },
          }
        );
      }

      return sessionId;
    } catch (error: any) {
      console.error("Error syncing cart to backend:", error);
      throw error;
    }
  };

  // Handle Payfast payment
  const handlePayfastPayment = async () => {
    if (!validateForm()) {
      return;
    }

    setProcessingPayment(true);
    setPaymentError(null);

    try {
      // First, sync Redux cart to backend (guest only)
      const sessionId = await syncCartToBackend();

      // Ensure sessionId is stored
      sessionStorage.setItem("sessionId", sessionId);

      // Create address first (required by backend) - using v3 routes
      // For guest checkout, we need to pass sessionId in headers
      // Backend v3 uses addressLine1/addressLine2
      const addressData = {
        firstName,
        lastName,
        addressLine1: address,
        addressLine2: apartment || "",
        city,
        state,
        postalCode: zipCode,
        country,
        type: "both",
        isDefault: false,
      };

      // Use v3 addresses route for guest checkout
      const addressResponse = await api.post("/addresses", addressData, {
        headers: {
          "x-session-id": sessionId,
        },
      });

      const addressResponseData = addressResponse.data;

      if (!addressResponseData.success) {
        throw new Error(
          addressResponseData.error || "Failed to create address"
        );
      }

      const addressId =
        addressResponseData.address?._id || addressResponseData.data?._id;

      if (!addressId) {
        throw new Error("Address ID not found after creation");
      }

      // Initiate checkout to validate cart (guest checkout) - using v3 routes
      await api.post(
        "/orders/checkout/initiate",
        {},
        {
          headers: {
            "x-session-id": sessionId,
          },
        }
      );

      // Get available delivery options (guest checkout) - using v3 routes
      const queryParams = new URLSearchParams({
        cartTotal: cart.total.toString(),
        weight: "0", // You might want to calculate total weight from cart items
        region: state || country || "",
      });

      const deliveryResponse = await api.get(
        `/delivery/available?${queryParams.toString()}`,
        {
          headers: {
            "x-session-id": sessionId,
          },
        }
      );

      const deliveryResponseData = deliveryResponse.data;

      const deliveryOptions =
        deliveryResponseData.deliveryOptions || deliveryResponseData.data || [];

      console.log("Delivery options response:", deliveryResponseData);
      console.log("Delivery options:", deliveryOptions);

      if (!deliveryOptions || deliveryOptions.length === 0) {
        // Try getting all delivery options without region filter as fallback
        const fallbackResponse = await api.get(
          `/delivery/available?cartTotal=${cart.total.toString()}&weight=0`,
          {
            headers: {
              "x-session-id": sessionId,
            },
          }
        );

        const fallbackDeliveryOptions =
          fallbackResponse.data.deliveryOptions ||
          fallbackResponse.data.data ||
          [];

        if (!fallbackDeliveryOptions || fallbackDeliveryOptions.length === 0) {
          throw new Error(
            "No delivery options available. Please contact support."
          );
        }

        // Use first available delivery option from fallback
        const deliveryOptionId =
          fallbackDeliveryOptions[0]._id || fallbackDeliveryOptions[0].id;

        // Continue with checkout using fallback option
        const orderResponse = await api.post(
          "/orders/checkout/complete",
          {
            addressId,
            deliveryOptionId,
            paymentMethod: "payfast",
            email: email,
            notes: subscribe ? "Subscribed to updates" : undefined,
          },
          {
            headers: {
              "x-session-id": sessionId,
            },
          }
        );

        const orderResponseData = orderResponse.data;
        if (!orderResponseData.success) {
          throw new Error(orderResponseData.error || "Failed to create order");
        }

        const order = orderResponseData.order || orderResponseData.data;
        const orderId = order._id || order.orderNumber;

        // Prepare Payfast payment data
        const PAYFAST_CONFIG = {
          merchant_id:
            process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || "10038198",
          merchant_key:
            process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || "8yshtxb2mu1oa",
          sandbox: process.env.NEXT_PUBLIC_PAYFAST_SANDBOX === "true" || true,
        };

        const paymentData: Record<string, any> = {
          merchant_id: PAYFAST_CONFIG.merchant_id,
          merchant_key: PAYFAST_CONFIG.merchant_key,
          amount: cart.total.toFixed(2),
          item_name: `Order ${orderId}`,
          name_first: firstName,
          name_last: lastName,
          email_address: email,
          return_url: `${window.location.origin}/checkout/payment/success?orderId=${orderId}`,
          cancel_url: `${window.location.origin}/checkout/payment/cancel?orderId=${orderId}`,
          notify_url: `${window.location.origin}/api/payfast/notify`,
        };

        sessionStorage.setItem(
          "checkoutData",
          JSON.stringify({
            orderId,
            order,
            address: {
              fullName: `${firstName} ${lastName}`,
              phone: "",
              street: address,
              apartment: apartment || undefined,
              city,
              state,
              postalCode: zipCode,
              country,
            },
            amount: cart.total,
          })
        );

        const form = document.createElement("form");
        form.method = "POST";
        form.action = PAYFAST_CONFIG.sandbox
          ? "https://sandbox.payfast.co.za/eng/process"
          : "https://www.payfast.co.za/eng/process";
        Object.keys(paymentData).forEach((key) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = paymentData[key];
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        return; // Exit early since we handled fallback
      }

      // Use first active delivery option
      const deliveryOptionId = deliveryOptions[0]._id || deliveryOptions[0].id;

      // Complete checkout to create order (guest checkout with sessionId header) - using v3 routes
      const orderResponse = await api.post(
        "/orders/checkout/complete",
        {
          addressId,
          deliveryOptionId,
          paymentMethod: "payfast",
          email: email, // Include email for guest checkout
          notes: subscribe ? "Subscribed to updates" : undefined,
        },
        {
          headers: {
            "x-session-id": sessionId,
          },
        }
      );

      const orderResponseData = orderResponse.data;

      if (!orderResponseData.success) {
        throw new Error(orderResponseData.error || "Failed to create order");
      }

      const order = orderResponseData.order || orderResponseData.data;
      // Prefer orderNumber over _id for better user experience in URLs
      const orderId = order.orderNumber || order._id;

      // Prepare Payfast payment data
      const PAYFAST_CONFIG = {
        merchant_id: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || "10038198",
        merchant_key:
          process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || "8yshtxb2mu1oa",
        sandbox: process.env.NEXT_PUBLIC_PAYFAST_SANDBOX === "true" || true,
      };

      const paymentData: Record<string, any> = {
        merchant_id: PAYFAST_CONFIG.merchant_id,
        merchant_key: PAYFAST_CONFIG.merchant_key,
        amount: cart.total.toFixed(2),
        item_name: `Order ${orderId}`,
        name_first: firstName,
        name_last: lastName,
        email_address: email,
        return_url: `${window.location.origin}/checkout/payment/success?orderId=${orderId}`,
        cancel_url: `${window.location.origin}/checkout/payment/cancel?orderId=${orderId}`,
        notify_url: `${window.location.origin}/api/payfast/notify`,
      };

      // Store checkout data in sessionStorage for payment success page
      sessionStorage.setItem(
        "checkoutData",
        JSON.stringify({
          orderId,
          order,
          address: {
            fullName: `${firstName} ${lastName}`,
            phone: "",
            street: address,
            apartment: apartment || undefined,
            city,
            state,
            postalCode: zipCode,
            country,
          },
          amount: cart.total,
        })
      );

      // Create and submit Payfast form
      const form = document.createElement("form");
      form.method = "POST";
      form.action = PAYFAST_CONFIG.sandbox
        ? "https://sandbox.payfast.co.za/eng/process"
        : "https://www.payfast.co.za/eng/process";

      Object.keys(paymentData).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = paymentData[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error: any) {
      console.error("Payment error:", error);
      setPaymentError(error.message || "Payment failed. Please try again.");
      setProcessingPayment(false);
    }
  };

  // Empty cart state
  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white">
          <button
            onClick={() => router.back()}
            className="text-neutral-900 hover:opacity-70 transition-opacity"
            aria-label="Go back"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
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

        <div className="pt-20 pb-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-sm uppercase tracking-widest text-neutral-900 mb-4">
              YOUR CART IS EMPTY
            </p>
            <Link
              href="/products"
              className="text-sm uppercase tracking-widest text-neutral-900 underline"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Main Content */}
        <div className="pt-24 pb-20 max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left Column - Checkout Form */}
            <div className="space-y-12">
              {/* Contact Information */}
              <div className="space-y-12">
                <h2 className="text-lg uppercase tracking-widest text-black font-bold mb-6">
                  CONTACT INFORMATION
                </h2>
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm uppercase tracking-widest text-black font-medium mb-2">
                      EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-black bg-white px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
                      placeholder="EMAIL@EXAMPLE.COM"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="subscribe"
                      checked={subscribe}
                      onChange={(e) => setSubscribe(e.target.checked)}
                      className="w-4 h-4 border-black text-neutral-900 focus:ring-neutral-900"
                    />
                    <label
                      htmlFor="subscribe"
                      className="text-xs uppercase tracking-widest text-neutral-900 cursor-pointer"
                    >
                      SUBSCRIBE TO UPDATES AND NOTIFICATIONS
                    </label>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-12">
                <h2 className="text-lg uppercase tracking-widest text-black font-bold mb-6">
                  SHIPPING ADDRESS
                </h2>
                <div className="space-y-8">
                  {/* First Name / Last Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm uppercase tracking-widest text-black font-medium mb-2">
                        FIRST NAME
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full border border-black bg-white px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
                        placeholder="FIRST NAME"
                      />
                    </div>
                    <div>
                      <label className="block text-sm uppercase tracking-widest text-black font-medium mb-2">
                        LAST NAME
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full border border-black bg-white px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
                        placeholder="LAST NAME"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm uppercase tracking-widest text-black font-medium mb-2">
                      ADDRESS
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full border border-black bg-white px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
                      placeholder="START TYPING YOUR ADDRESS..."
                    />
                  </div>

                  {/* Apartment */}
                  <div>
                    <label className="block text-sm uppercase tracking-widest text-black font-medium mb-2">
                      APARTMENT, SUITE, UNIT, ETC. (OPTIONAL)
                    </label>
                    <input
                      type="text"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      className="w-full border border-black bg-white px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
                      placeholder="APARTMENT, SUITE, UNIT, FLOOR, ETC."
                    />
                  </div>

                  {/* City / Country */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm uppercase tracking-widest text-black font-medium mb-2">
                        CITY
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full border border-black bg-white px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
                        placeholder="CITY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm uppercase tracking-widest text-black font-medium mb-2">
                        COUNTRY
                      </label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full border border-black bg-white px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
                      >
                        <option value="">SELECT COUNTRY</option>
                        <option value="US">United States</option>
                        <option value="ZA">South Africa</option>
                        <option value="GB">United Kingdom</option>
                        {/* Add more countries as needed */}
                      </select>
                    </div>
                  </div>

                  {/* State / Zip */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm uppercase tracking-widest text-black font-medium mb-2">
                        STATE / PROVINCE
                      </label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full border border-black bg-white px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
                        placeholder="STATE / PROVINCE"
                      />
                    </div>
                    <div>
                      <label className="block text-sm uppercase tracking-widest text-black font-medium mb-2">
                        ZIP / POSTAL CODE
                      </label>
                      <input
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full border border-black bg-white px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
                        placeholder="ZIP / POSTAL CODE"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <h2 className="text-lg uppercase tracking-widest text-black font-bold mb-12">
                ORDER SUMMARY
              </h2>

              {/* Product Listings */}
              <div className="space-y-6 mb-8">
                {cart.items.map((item) => {
                  const productImage = getProductImage(item);
                  const productCode = getProductCode(item);

                  return (
                    <div key={item.id} className="flex gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20  overflow-hidden">
                          {productImage ? (
                            <Image
                              src={productImage}
                              alt={item.product.name}
                              width={80}
                              height={80}
                              className="object-scale-down w-full h-full bg-[url(https://res.cloudinary.com/shelflife-online/image/upload/f_auto,q_auto:eco/v1700810497/img/product-overlay.png)]"
                              unoptimized={productImage.includes("localhost")}
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">
                              NO IMAGE
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 flex justify-between">
                        <div className="flex-1 gap-2">
                          <p className="text-xs uppercase tracking-widest text-neutral-900 mb-2 font-medium">
                            {productCode}
                          </p>
                          <div className="flex gap-4 text-xs uppercase tracking-widest text-black mb-2">
                            {item.size && (
                              <>
                                <span>SIZE</span>
                                <span className="text-sm text-neutral-900 font-semibold">
                                  {item.size}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex gap-2 text-sm">
                            <span>PRICE</span>
                            <p className="text-sm text-neutral-900 font-semibold mb-2">
                              {formatPrice(
                                item.unitPrice,
                                item.product.pricing.currency
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-4 justify-center">
                          <p className="text-sm text-neutral-900 font-semibold">
                            {formatPrice(
                              item.totalPrice,
                              item.product.pricing.currency
                            )}
                          </p>
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleQuantityUpdate(item.id, item.quantity - 1)
                              }
                              className="w-6 h-6 flex items-center justify-center border border-black text-neutral-900 hover:border-neutral-900 transition-colors text-xs"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-xs uppercase tracking-wide text-neutral-900 w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityUpdate(item.id, item.quantity + 1)
                              }
                              className="w-6 h-6 flex items-center justify-center border border-black text-neutral-900 hover:border-neutral-900 transition-colors text-xs"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Totals */}
              <div className="border-t border-neutral-200 pt-6 space-y-3">
                <div className="flex justify-between text-xs uppercase tracking-widest text-black">
                  <span>SUBTOTAL</span>
                  <span className="font-semibold">
                    {formatPrice(cart.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-xs uppercase tracking-widest text-black">
                  <span>SHIPPING</span>
                  <span className="text-black">CALCULATED AT NEXT STEP</span>
                </div>
                <div className="flex justify-between text-xs uppercase tracking-widest text-black">
                  <span>TAXES</span>
                  <span className="font-semibold">{formatPrice(cart.tax)}</span>
                </div>
                <div className="flex justify-between text-sm uppercase tracking-widest text-black font-medium pt-3 border-t border-neutral-200">
                  <span className="font-semibold">TOTAL</span>
                  <span className="font-semibold">
                    {formatPrice(cart.total)}
                  </span>
                </div>
              </div>

              {/* Payment Error */}
              {paymentError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs uppercase tracking-widest">
                  {paymentError}
                </div>
              )}

              {/* Pay with Payfast Button */}
              <button
                onClick={handlePayfastPayment}
                disabled={processingPayment}
                className="w-full mt-6 bg-neutral-900 text-white py-4 px-6 text-xs uppercase tracking-widest font-medium hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processingPayment ? "PROCESSING..." : "PAY WITH PAYFAST"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
