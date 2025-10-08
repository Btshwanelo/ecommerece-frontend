"use client";

import { useState } from "react";
import CryptoJS from "crypto-js";

export default function VerifySignaturePage() {
  const [result, setResult] = useState<string>("");

  const verifyTargetSignature = () => {
    // Your working signature
    const targetSignature = "a21a30c5faabecfa9cbbab6bf3cabc20";
    
    // Test with the working example approach
    const testData: Record<string, string> = {
      merchant_id: "10038198",
      merchant_key: "8yshtxb2mu1oa",
      amount: "200",
      item_name: "subscription",
    };

    // PayFast signature generation (matching working example)
    const filteredData = Object.keys(testData)
      .filter(
        (key) =>
          testData[key] !== "" &&
          testData[key] !== null &&
          testData[key] !== undefined &&
          key !== "signature"
      )
      .reduce((obj, key) => {
        obj[key] = testData[key];
        return obj;
      }, {} as Record<string, string>);

    const queryString = Object.keys(filteredData)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(filteredData[key])}`)
      .join("&");

    const signature = CryptoJS.MD5(queryString).toString();

    setResult(`=== SIGNATURE VERIFICATION ===
Target signature: ${targetSignature}
Generated signature: ${signature}
Match: ${signature === targetSignature ? '✅ YES' : '❌ NO'}

=== DETAILS ===
Test data: ${JSON.stringify(testData)}
Query string: ${queryString}
String to sign: ${queryString}

=== WORKING EXAMPLE TEST ===
Expected from working example: 35773c2456df895197ee211c354933f2
Generated: ${signature}
Match with working example: ${signature === "35773c2456df895197ee211c354933f2" ? '✅ YES' : '❌ NO'}`);
  };

  const testWithYourCredentials = () => {
    // Test with your actual Payfast credentials
    const yourData: Record<string, string> = {
      merchant_id: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || "",
      merchant_key: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || "",
      amount: "100.00",
      item_name: "Test Item",
      email_address: "test@example.com",
      name_first: "Test",
      name_last: "User",
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
Your data: ${JSON.stringify(yourData)}
Query string: ${queryString}
Generated signature: ${signature}

=== ENVIRONMENT VARIABLES ===
Merchant ID: ${process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || 'Not set'}
Merchant Key: ${process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || 'Not set'}
Passphrase: ${process.env.NEXT_PUBLIC_PAYFAST_PASSPHRASE || 'Not set'}
Sandbox: ${process.env.NEXT_PUBLIC_PAYFAST_SANDBOX || 'Not set'}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Payfast Signature Verification</h1>
      
      <div className="bg-yellow-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Target Signature</h2>
        <p className="font-mono text-lg">a21a30c5faabecfa9cbbab6bf3cabc20</p>
        <p className="text-sm text-gray-600 mt-1">This is the signature that works with Payfast sandbox</p>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={verifyTargetSignature}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Verify Target Signature
        </button>
        <button
          onClick={testWithYourCredentials}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Test With Your Credentials
        </button>
      </div>

      {result && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Results:</h3>
          <pre className="text-sm whitespace-pre-wrap overflow-x-auto">{result}</pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">What this does:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Tests the exact signature generation method from your working example</li>
          <li>Verifies if it produces your target signature</li>
          <li>Tests with your actual Payfast credentials</li>
          <li>Shows environment variable status</li>
        </ul>
      </div>
    </div>
  );
}
