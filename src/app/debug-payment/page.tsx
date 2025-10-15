"use client";

import { useState } from "react";
import CryptoJS from "crypto-js";

export default function DebugPaymentPage() {
  const [result, setResult] = useState<string>("");

  const debugActualPayment = () => {
    // Simulate the actual payment data that would be sent
    const paymentData = {
      merchant_id: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || "",
      merchant_key: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || "",
      return_url: `${window.location.origin}/checkout/payment/success?orderId=test123`,
      cancel_url: `${window.location.origin}/checkout/payment/cancel?orderId=test123`,
      notify_url: `${window.location.origin}/api/payfast/notify`,
      m_payment_id: "ORDER_test123_1234567890",
      amount: "55.00", // Example amount
      item_name: "Order #test123",
      item_description: "Payment for order test123",
      email_address: "test@example.com",
      name_first: "Test",
      name_last: "User",
    };

    // PayFast signature generation (exact same as service)
    const filteredData = Object.keys(paymentData)
      .filter(
        (key) =>
          paymentData[key] !== "" &&
          paymentData[key] !== null &&
          paymentData[key] !== undefined &&
          key !== "signature"
      )
      .reduce((obj, key) => {
        obj[key] = paymentData[key];
        return obj;
      }, {} as Record<string, string>);

    const queryString = Object.keys(filteredData)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(filteredData[key])}`)
      .join("&");

    // Test with and without passphrase
    const passphrase = process.env.NEXT_PUBLIC_PAYFAST_PASSPHRASE || "";
    
    const signatureWithoutPassphrase = CryptoJS.MD5(queryString).toString();
    const signatureWithPassphrase = passphrase 
      ? CryptoJS.MD5(`${queryString}&passphrase=${passphrase}`).toString()
      : signatureWithoutPassphrase;

    setResult(`=== ACTUAL PAYMENT DATA DEBUG ===
Payment Data: ${JSON.stringify(paymentData, null, 2)}

=== FILTERED DATA ===
Filtered Data: ${JSON.stringify(filteredData, null, 2)}

=== QUERY STRING ===
Query String: ${queryString}

=== SIGNATURE GENERATION ===
Without Passphrase: ${signatureWithoutPassphrase}
With Passphrase: ${signatureWithPassphrase}
Passphrase Value: "${passphrase}"

=== ENVIRONMENT VARIABLES ===
Merchant ID: "${process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || 'NOT SET'}"
Merchant Key: "${process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || 'NOT SET'}"
Passphrase: "${process.env.NEXT_PUBLIC_PAYFAST_PASSPHRASE || 'NOT SET'}"
Sandbox: "${process.env.NEXT_PUBLIC_PAYFAST_SANDBOX || 'NOT SET'}"

=== COMPARISON WITH WORKING EXAMPLE ===
Working Example Data: {
  "merchant_id": "10038198",
  "merchant_key": "8yshtxb2mu1oa", 
  "amount": "200",
  "item_name": "subscription"
}

Working Example Query: amount=200&item_name=subscription&merchant_id=10038198&merchant_key=8yshtxb2mu1oa
Working Example Signature: 35773c2456df895197ee211c354933f2

Your Data Query: ${queryString}
Your Signature (no passphrase): ${signatureWithoutPassphrase}
Your Signature (with passphrase): ${signatureWithPassphrase}`);
  };

  const testWithMinimalData = () => {
    // Test with minimal data like your working example
    const minimalData = {
      merchant_id: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || "",
      merchant_key: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || "",
      amount: "100.00",
      item_name: "Test Item",
    };

    const filteredData = Object.keys(minimalData)
      .filter(
        (key) =>
          minimalData[key] !== "" &&
          minimalData[key] !== null &&
          minimalData[key] !== undefined &&
          key !== "signature"
      )
      .reduce((obj, key) => {
        obj[key] = minimalData[key];
        return obj;
      }, {} as Record<string, string>);

    const queryString = Object.keys(filteredData)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(filteredData[key])}`)
      .join("&");

    const signature = CryptoJS.MD5(queryString).toString();

    setResult(`=== MINIMAL DATA TEST ===
Minimal Data: ${JSON.stringify(minimalData, null, 2)}
Query String: ${queryString}
Generated Signature: ${signature}

=== COMPARISON ===
Working Example: 35773c2456df895197ee211c354933f2
Your Minimal: ${signature}
Match: ${signature === "35773c2456df895197ee211c354933f2" ? '✅ YES' : '❌ NO'}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Payment Data Debug</h1>
      
      <div className="bg-red-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Current Issue</h2>
        <p className="text-red-800">Signature mismatch error - let's debug the actual data being sent</p>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={debugActualPayment}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
        >
          Debug Actual Payment Data
        </button>
        <button
          onClick={testWithMinimalData}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Test With Minimal Data
        </button>
      </div>

      {result && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Results:</h3>
          <pre className="text-xs whitespace-pre-wrap overflow-x-auto">{result}</pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">What to check:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Are your environment variables set correctly?</li>
          <li>Is the passphrase being added when it shouldn't be?</li>
          <li>Are there extra fields in the payment data?</li>
          <li>Does the query string match the expected format?</li>
        </ul>
      </div>
    </div>
  );
}


