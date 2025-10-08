"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Truck, CreditCard, ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Cart, Address } from "@/types";
import {
  CartService,
  DeliveryService,
  OrderService,
  UserService,
} from "@/services/v2";

interface AddressForm {
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [address, setAddress] = useState<AddressForm>({
    fullName: "",
    phone: "",
    street: "",
    apartment: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });

  // User contact details
  const [userContact, setUserContact] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const [deliveryOptions, setDeliveryOptions] = useState<any[]>([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Address management
  const [existingAddresses, setExistingAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [useExistingAddress, setUseExistingAddress] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [saveNewAddress, setSaveNewAddress] = useState(false);

  // Derived totals from v2 cart structure
  const totals = useMemo(
    () => ({
      subtotal: cart?.subtotal || 0,
      shipping: cart?.shipping || 0,
      tax: cart?.tax || 0,
      discount: cart?.discount || 0,
      total: cart?.total || 0,
    }),
    [cart]
  );

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);

  // Save new address to user's account
  const saveAddressToAccount = async (
    addressData: AddressForm
  ): Promise<string | null> => {
    if (!isLoggedIn) return null;

    try {
      // Get userId from localStorage
      const userData = localStorage.getItem("user");
      if (!userData) {
        console.error("No user data found in localStorage");
        return null;
      }

      const user = JSON.parse(userData);
      const userId = user._id || user.id;

      if (!userId) {
        console.error("No userId found in user data");
        return null;
      }

      console.log("User ID from localStorage:", userId);
      console.log("Full user object from localStorage:", user);

      // Parse full name properly
      const nameParts = addressData.fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "User"; // Default to 'User' if no last name

      const addressPayload = {
        type: "shipping",
        firstName: firstName,
        lastName: lastName,
        addressLine1: addressData.street, // Use addressLine1 as required by API
        addressLine2: addressData.apartment || "", // Use addressLine2 as required by API
        city: addressData.city,
        company: "",
        state: addressData.state,
        postalCode: addressData.postalCode,
        country: addressData.country,
        phone: addressData.phone,
        isDefault: existingAddresses.length === 0, // Set as default if it's the first address
        userId: userId, // Include userId as required by backend
      };

      console.log("Creating address with payload:", addressPayload);
      const response = await UserService.createAddress(addressPayload);
      console.log("Address creation response:", response);

      if (response.success && response.address) {
        return response.address._id;
      }
      return null;
    } catch (error) {
      console.error("Error saving address:", error);
      // Don't fail the entire checkout if address saving fails
      return null;
    }
  };

  // Check if user is logged in and populate contact details
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // Populate user contact details if logged in
    if (token) {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUserContact({
            email: user.email || "",
            firstName: user.profile?.firstName || "",
            lastName: user.profile?.lastName || "",
            phone: user.profile?.phone || "",
          });
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
    }
  }, []);

  // Load cart, delivery options, and user addresses
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [cartRes, deliveryRes, addressesRes] = await Promise.all([
          CartService.getCart(),
          DeliveryService.getActiveDeliveryOptions(),
          isLoggedIn
            ? UserService.getAddresses()
            : Promise.resolve({ success: false, data: [] }),
        ]);

        if (cartRes.success) {
          setCart((cartRes as any).cart || cartRes.data || null);
        } else {
          setError(cartRes.error || "Failed to load cart");
        }

        if (deliveryRes.success) {
          const opts =
            (deliveryRes as any).deliveryOptions ||
            (deliveryRes as any).data ||
            [];
          console.log("Delivery options loaded:", opts);
          setDeliveryOptions(Array.isArray(opts) ? opts : []);
          if (Array.isArray(opts) && opts.length > 0) {
            const firstOptionId = opts[0]._id || opts[0].id || "";
            console.log("Setting selected delivery ID:", firstOptionId);
            setSelectedDeliveryId(firstOptionId);
          } else {
            console.log("No delivery options available, creating default");
            // Create a default delivery option if none are available
            const defaultOption = {
              _id: "default-delivery",
              name: "Standard Delivery",
              description: "Standard delivery service",
              price: 0,
              estimatedDays: "3-5 business days",
              isActive: true,
            };
            setDeliveryOptions([defaultOption]);
            setSelectedDeliveryId("default-delivery");
          }
        } else {
          console.log("Failed to load delivery options:", deliveryRes.error);
          // Create a default delivery option as fallback
          const defaultOption = {
            _id: "default-delivery",
            name: "Standard Delivery",
            description: "Standard delivery service",
            price: 0,
            estimatedDays: "3-5 business days",
            isActive: true,
          };
          setDeliveryOptions([defaultOption]);
          setSelectedDeliveryId("default-delivery");
        }

        // Handle addresses if user is logged in
        if (isLoggedIn) {
          if (addressesRes && (addressesRes as any).success) {
            const addrs =
              (addressesRes as any).addresses ||
              (addressesRes as any).data ||
              [];
            console.log("Addresses loaded:", addrs);
            setExistingAddresses(Array.isArray(addrs) ? addrs : []);
            if (Array.isArray(addrs) && addrs.length > 0) {
              console.log(
                "Setting useExistingAddress to true, selectedAddressId:",
                addrs[0]._id
              );
              setUseExistingAddress(true);
              setSelectedAddressId(addrs[0]._id || addrs[0].id || "");
            } else {
              console.log(
                "No existing addresses, useExistingAddress remains false"
              );
            }
          } else {
            console.error("Failed to load addresses:", addressesRes);
            setExistingAddresses([]);
            // Don't set error here as it's not critical for checkout
          }
        } else {
          console.log("Not logged in, skipping address loading");
          setExistingAddresses([]);
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load checkout data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isLoggedIn]);

  const handlePlaceOrder = async () => {
    console.log("Place order clicked");
    console.log("Cart:", cart);
    console.log("Selected delivery ID:", selectedDeliveryId);
    console.log("Use existing address:", useExistingAddress);
    console.log("Selected address ID:", selectedAddressId);
    console.log("Address form data:", address);
    console.log("User contact:", userContact);

    if (!cart) return;
    if (!selectedDeliveryId) {
      console.log("No delivery option selected");
      console.log("Available delivery options:", deliveryOptions);
      setOrderMessage({
        type: "error",
        message: "Please select a delivery option",
      });
      return;
    }

    // Validate user contact details
    if (!userContact.email || !userContact.firstName || !userContact.lastName) {
      setOrderMessage({
        type: "error",
        message: "Please fill in all required contact details (email, first name, last name)",
      });
      return;
    }

    // Address validation
    let shippingAddress;
    if (useExistingAddress && selectedAddressId) {
      console.log("Using existing address");
      const existingAddr = existingAddresses.find(
        (addr) => addr._id === selectedAddressId
      );
      if (!existingAddr) {
        setOrderMessage({
          type: "error",
          message: "Please select a valid address",
        });
        return;
      }
      shippingAddress = existingAddr;
    } else {
      console.log("Using new address");
      // Validate new address
      if (
        !address.fullName ||
        !address.phone ||
        !address.street ||
        !address.city ||
        !address.postalCode ||
        !address.country
      ) {
        console.log("Address validation failed:", {
          fullName: address.fullName,
          phone: address.phone,
          street: address.street,
          city: address.city,
          postalCode: address.postalCode,
          country: address.country,
        });
        setOrderMessage({
          type: "error",
          message: "Please fill in all required address fields",
        });
        return;
      }
      shippingAddress = address;
    }

    setPlacingOrder(true);
    setOrderMessage(null);
    
    try {
      // Generate a temporary order ID for the payment flow
      const tempOrderId = `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Store all checkout data for payment step (no API call yet)
      const checkoutData = {
        tempOrderId,
        cart: cart,
        deliveryOptionId: selectedDeliveryId === "default-delivery" ? undefined : selectedDeliveryId,
        userContact: userContact,
        shippingAddress: shippingAddress,
        useExistingAddress: useExistingAddress,
        selectedAddressId: selectedAddressId,
        isLoggedIn: isLoggedIn,
        amount: cart?.totals?.total || 0,
        totals: cart?.totals,
      };

      // Store checkout data in sessionStorage for payment step
      sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));

      setOrderMessage({
        type: "success",
        message: "Checkout details saved! Redirecting to payment...",
      });

      // Redirect to payment page with temp order ID
      setTimeout(() => {
        router.push(`/checkout/payment?orderId=${tempOrderId}`);
      }, 1500);
    } catch (e: any) {
      setOrderMessage({
        type: "error",
        message: e?.message || "Failed to prepare checkout data",
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <div className="h-40 bg-gray-100 rounded" />
                  <div className="h-40 bg-gray-100 rounded" />
                </div>
                <div className="h-64 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !cart) {
    return (
      <Layout>
        <div className="min-h-screen bg-white py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Checkout</h1>
            <p className="text-gray-600 mb-8">
              {error || "Your cart is empty."}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              <ArrowLeft className="h-5 w-5 mr-2" /> Continue Shopping
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-black">Checkout</h1>
            <p className="text-gray-600">
              Provide your shipping details and place your order
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Contact, Address and Delivery */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Contact Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={userContact.firstName}
                      onChange={(e) =>
                        setUserContact({ ...userContact, firstName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={userContact.lastName}
                      onChange={(e) =>
                        setUserContact({ ...userContact, lastName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={userContact.email}
                      onChange={(e) =>
                        setUserContact({ ...userContact, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={userContact.phone}
                      onChange={(e) =>
                        setUserContact({ ...userContact, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="+27 82 123 4567"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Truck className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Shipping Address
                  </h2>
                </div>

                {/* Address Selection for logged-in users */}
                {isLoggedIn && existingAddresses.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="addressType"
                          checked={useExistingAddress}
                          onChange={() => setUseExistingAddress(true)}
                        />
                        <span className="text-sm font-medium">
                          Use existing address
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="addressType"
                          checked={!useExistingAddress}
                          onChange={() => setUseExistingAddress(false)}
                        />
                        <span className="text-sm font-medium">
                          Create new address
                        </span>
                      </label>
                    </div>

                    {useExistingAddress && (
                      <div className="space-y-3">
                        {existingAddresses.map((addr) => (
                          <label
                            key={addr._id}
                            className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                          >
                            <input
                              type="radio"
                              name="existingAddress"
                              checked={selectedAddressId === addr._id}
                              onChange={() => setSelectedAddressId(addr._id)}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {`${addr.firstName} ${addr.lastName}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {addr.addressLine1}
                                {addr.addressLine2 && `, ${addr.addressLine2}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {addr.city}, {addr.state} {addr.postalCode}
                              </p>
                              <p className="text-sm text-gray-600">
                                {addr.country}
                              </p>
                              {addr.phone && (
                                <p className="text-sm text-gray-600">
                                  Phone: {addr.phone}
                                </p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* New Address Form */}
                {(!isLoggedIn || !useExistingAddress) && (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          value={address.fullName}
                          onChange={(e) =>
                            setAddress({ ...address, fullName: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone *
                        </label>
                        <input
                          value={address.phone}
                          onChange={(e) =>
                            setAddress({ ...address, phone: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street *
                        </label>
                        <input
                          value={address.street}
                          onChange={(e) =>
                            setAddress({ ...address, street: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Apartment (optional)
                        </label>
                        <input
                          value={address.apartment}
                          onChange={(e) =>
                            setAddress({
                              ...address,
                              apartment: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          value={address.city}
                          onChange={(e) =>
                            setAddress({ ...address, city: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          value={address.state}
                          onChange={(e) =>
                            setAddress({ ...address, state: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code *
                        </label>
                        <input
                          value={address.postalCode}
                          onChange={(e) =>
                            setAddress({
                              ...address,
                              postalCode: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country *
                        </label>
                        <input
                          value={address.country}
                          onChange={(e) =>
                            setAddress({ ...address, country: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                          required
                        />
                      </div>
                    </div>

                    {/* Save Address Option for Logged-in Users */}
                    {isLoggedIn && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={saveNewAddress}
                            onChange={(e) =>
                              setSaveNewAddress(e.target.checked)
                            }
                            className="rounded border-gray-300 text-black focus:ring-black"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Save this address to my account for future orders
                          </span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          This will save the address to your profile so you can
                          use it again next time.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Delivery Options */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Delivery Options
                  </h2>
                </div>
                <div className="space-y-3">
                  {deliveryOptions.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No delivery options available.
                    </p>
                  )}
                  {deliveryOptions.map((opt) => (
                    <label
                      key={opt._id || opt.id}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="delivery"
                          checked={selectedDeliveryId === (opt._id || opt.id)}
                          onChange={() =>
                            setSelectedDeliveryId(opt._id || opt.id)
                          }
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {opt.name || opt.title || "Delivery"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {opt.description || ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        {formatPrice(opt.price || opt.amount || 0)}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* Right: Order Summary */}
            <div>
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-2 mb-4">
                  {(cart.items || []).map((item: any) => (
                    <div
                      key={item._id}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-600 truncate">
                        {(item.productId || item.product)?.name} ×{" "}
                        {item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.totalPrice || item.unitPrice || 0)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      {formatPrice(totals.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {totals.shipping === 0
                        ? "Free"
                        : formatPrice(totals.shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">
                      {formatPrice(totals.tax)}
                    </span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-green-600">
                        -{formatPrice(totals.discount)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-base font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(totals.total)}</span>
                    </div>
                  </div>
                </div>

                {orderMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-3 rounded-lg border ${
                      orderMessage.type === "success"
                        ? "bg-green-50 border-green-200 text-green-800"
                        : "bg-red-50 border-red-200 text-red-800"
                    }`}
                  >
                    {orderMessage.message}
                  </motion.div>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="mt-6 w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50"
                >
                  {placingOrder ? "Preparing Payment…" : "Proceed to Payment"}
                </button>

                <Link
                  href="/cart"
                  className="mt-4 block text-center text-sm text-gray-600 hover:text-black"
                >
                  <ArrowLeft className="inline h-4 w-4 mr-1" /> Back to Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
