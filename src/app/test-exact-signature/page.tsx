"use client";

import { useState } from "react";
import CryptoJS from "crypto-js";

export default function TestExactSignaturePage() {
  const [result, setResult] = useState<string>("");

  const testExactSignature = () => {
    // Your exact working data from Payfast sandbox
    const exactData = {
      merchant_id: "10038198",
      merchant_key: "8yshtxb2mu1oa",
      amount: "300",
      item_name: "shoes",
    };

    const targetSignature = "a21a30c5faabecfa9cbbab6bf3cabc20";

    // Test the exact signature generation process
    const filteredData = Object.keys(exactData)
      .filter(
        (key) =>
          exactData[key] !== "" &&
          exactData[key] !== null &&
          exactData[key] !== undefined &&
          key !== "signature"
      )
      .reduce((obj, key) => {
        obj[key] = exactData[key];
        return obj;
      }, {} as Record<string, string>);

    const queryString = Object.keys(filteredData)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(filteredData[key])}`)
      .join("&");

    const signature = CryptoJS.MD5(queryString).toString();

    setResult(`=== EXACT SIGNATURE TEST ===
Your Working Data: ${JSON.stringify(exactData, null, 2)}
Target Signature: ${targetSignature}

=== SIGNATURE GENERATION ===
Filtered Data: ${JSON.stringify(filteredData, null, 2)}
Query String: ${queryString}
Generated Signature: ${signature}

=== RESULT ===
Match: ${signature === targetSignature ? '✅ YES - PERFECT MATCH!' : '❌ NO - Still not matching'}

=== ANALYSIS ===
If this matches, then the signature generation method is correct.
If it doesn't match, we need to investigate further.

Query String Breakdown:
${queryString.split('&').map(param => `  ${param}`).join('\n')}`);
  };

  const testWithYourCredentials = () => {
    // Test with your actual credentials but same structure
    const yourData = {
      merchant_id: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || "",
      merchant_key: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || "",
      amount: "300",
      item_name: "shoes",
    };

    const filteredData = Object.keys(yourData)
      .filter(
        (key) =>
          yourData[key] !== "" &&
          yourData[key] !== null &&
          yourData[key] !== undefined &&
          key !== "signature"
      )
      .reduce((obj, key) => {
        obj[key] = yourData[key];
        return obj;
      }, {} as Record<string, string>);

    const queryString = Object.keys(filteredData)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(filteredData[key])}`)
      .join("&");

    const signature = CryptoJS.MD5(queryString).toString();

    setResult(`=== YOUR CREDENTIALS TEST ===
Your Data: ${JSON.stringify(yourData, null, 2)}

=== SIGNATURE GENERATION ===
Query String: ${queryString}
Generated Signature: ${signature}

=== ENVIRONMENT CHECK ===
Merchant ID: "${process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || 'NOT SET'}"
Merchant Key: "${process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || 'NOT SET'}"
Passphrase: "${process.env.NEXT_PUBLIC_PAYFAST_PASSPHRASE || 'NOT SET'}"

=== COMPARISON ===
Working Example Signature: a21a30c5faabecfa9cbbab6bf3cabc20
Your Signature: ${signature}
Match: ${signature === "a21a30c5faabecfa9cbbab6bf3cabc20" ? '✅ YES' : '❌ NO'}

=== NEXT STEPS ===
${signature === "a21a30c5faabecfa9cbbab6bf3cabc20" 
  ? "✅ Your credentials work! The issue might be in the payment data structure."
  : "❌ Your credentials don't match. Check your environment variables."}`);
  };

  const testPaymentDataStructure = () => {
    // Test with the actual payment data structure that would be sent
    const paymentData = {
      merchant_id: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || "",
      merchant_key: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || "",
      return_url: `${window.location.origin}/checkout/payment/success?orderId=test123`,
      cancel_url: `${window.location.origin}/checkout/payment/cancel?orderId=test123`,
      notify_url: `${window.location.origin}/api/payfast/notify`,
      m_payment_id: "ORDER_test123_1234567890",
      amount: "55.00",
      item_name: "Order #test123",
      item_description: "Payment for order test123",
      email_address: "test@example.com",
      name_first: "Test",
      name_last: "User",
    };

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

    const signature = CryptoJS.MD5(queryString).toString();

    setResult(`=== PAYMENT DATA STRUCTURE TEST ===
Full Payment Data: ${JSON.stringify(paymentData, null, 2)}

=== FILTERED DATA ===
Filtered Data: ${JSON.stringify(filteredData, null, 2)}

=== SIGNATURE GENERATION ===
Query String: ${queryString}
Generated Signature: ${signature}

=== ANALYSIS ===
This shows what signature would be generated with the full payment data structure.
Compare this with your working signature to see if the issue is extra fields.

Query String Length: ${queryString.length} characters
Number of Parameters: ${queryString.split('&').length}

Parameters:
${queryString.split('&').map((param, index) => `  ${index + 1}. ${param}`).join('\n')}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Exact Signature Test</h1>
      
      <div className="bg-green-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Your Working Data</h2>
        <div className="font-mono text-sm">
          <p><strong>merchant_id:</strong> 10038198</p>
          <p><strong>merchant_key:</strong> 8yshtxb2mu1oa</p>
          <p><strong>amount:</strong> 300</p>
          <p><strong>item_name:</strong> shoes</p>
          <p><strong>signature:</strong> a21a30c5faabecfa9cbbab6bf3cabc20</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={testExactSignature}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Test Exact Working Data
        </button>
        <button
          onClick={testWithYourCredentials}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Test With Your Credentials
        </button>
        <button
          onClick={testPaymentDataStructure}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
        >
          Test Full Payment Data
        </button>
      </div>

      {result && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <pre className="text-xs whitespace-pre-wrap overflow-x-auto">{result}</pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">What this will tell us:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Test 1:</strong> Verifies our signature generation method works with your exact data</li>
          <li><strong>Test 2:</strong> Checks if your environment variables are correct</li>
          <li><strong>Test 3:</strong> Shows what signature is generated with full payment data</li>
        </ul>
      </div>
    </div>
  );
}
