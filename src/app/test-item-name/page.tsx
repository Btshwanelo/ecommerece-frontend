"use client";

import { useState } from "react";
import CryptoJS from "crypto-js";

export default function TestItemNamePage() {
  const [result, setResult] = useState<string>("");

  const testItemNameVariations = () => {
    const baseData = {
      merchant_id: "10038198",
      merchant_key: "8yshtxb2mu1oa",
      amount: "55.00",
    };

    const itemNameVariations = [
      "shoes", // Your working example
      "Order #ORD-1759871472166", // Current item name (decoded)
      "Order%20%23ORD-1759871472166", // Current item name (encoded)
      "test", // Simple test
      "Order #test", // Simple with hash
    ];

    let results = "=== ITEM NAME VARIATIONS TEST ===\n\n";

    itemNameVariations.forEach((itemName, index) => {
      const queryString = `amount=${baseData.amount}&item_name=${encodeURIComponent(itemName)}&merchant_id=${baseData.merchant_id}&merchant_key=${baseData.merchant_key}`;
      const signature = CryptoJS.MD5(queryString).toString();
      
      results += `Test ${index + 1}: ${itemName}\n`;
      results += `Query: ${queryString}\n`;
      results += `Signature: ${signature}\n`;
      results += `Match with target: ${signature === "a21a30c5faabecfa9cbbab6bf3cabc20" ? '✅ YES' : '❌ NO'}\n\n`;
    });

    setResult(results);
  };

  const testExactCurrentData = () => {
    // Test with the exact current data
    const currentData = {
      merchant_id: "10038198",
      merchant_key: "8yshtxb2mu1oa",
      amount: "55.00",
      item_name: "Order #ORD-1759871472166", // Decoded version
    };

    const queryString = Object.keys(currentData)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(currentData[key])}`)
      .join("&");

    const signature = CryptoJS.MD5(queryString).toString();

    setResult(`=== EXACT CURRENT DATA TEST ===
Current Data: ${JSON.stringify(currentData, null, 2)}

=== QUERY STRING GENERATION ===
Query String: ${queryString}

=== SIGNATURE GENERATION ===
Generated Signature: ${signature}

=== COMPARISON ===
Target Signature: a21a30c5faabecfa9cbbab6bf3cabc20
Generated Signature: ${signature}
Match: ${signature === "a21a30c5faabecfa9cbbab6bf3cabc20" ? '✅ YES' : '❌ NO'}

=== ANALYSIS ===
${signature === "a21a30c5faabecfa9cbbab6bf3cabc20" 
  ? '✅ The signature generation is working correctly!'
  : '❌ The signature generation is still not matching your working example.'}

=== DECODED QUERY ===
amount=55.00&item_name=Order #ORD-1759871472166&merchant_id=10038198&merchant_key=8yshtxb2mu1oa`);
  };

  const testWithWorkingAmount = () => {
    // Test with the working amount (300) but current item name
    const testData = {
      merchant_id: "10038198",
      merchant_key: "8yshtxb2mu1oa",
      amount: "300", // Working amount
      item_name: "Order #ORD-1759871472166", // Current item name
    };

    const queryString = Object.keys(testData)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(testData[key])}`)
      .join("&");

    const signature = CryptoJS.MD5(queryString).toString();

    setResult(`=== WORKING AMOUNT TEST ===
Test Data: ${JSON.stringify(testData, null, 2)}

=== QUERY STRING GENERATION ===
Query String: ${queryString}

=== SIGNATURE GENERATION ===
Generated Signature: ${signature}

=== COMPARISON ===
Target Signature: a21a30c5faabecfa9cbbab6bf3cabc20
Generated Signature: ${signature}
Match: ${signature === "a21a30c5faabecfa9cbbab6bf3cabc20" ? '✅ YES' : '❌ NO'}

=== ANALYSIS ===
${signature === "a21a30c5faabecfa9cbbab6bf3cabc20" 
  ? '✅ The issue is with the amount, not the item name!'
  : '❌ The issue is with the item name or something else.'}

=== DECODED QUERY ===
amount=300&item_name=Order #ORD-1759871472166&merchant_id=10038198&merchant_key=8yshtxb2mu1oa`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Item Name Test</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Current Data</h2>
        <div className="font-mono text-sm">
          <p><strong>amount:</strong> 55.00</p>
          <p><strong>item_name:</strong> Order #ORD-1759871472166</p>
          <p><strong>merchant_id:</strong> 10038198</p>
          <p><strong>merchant_key:</strong> 8yshtxb2mu1oa</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={testItemNameVariations}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Test Item Name Variations
        </button>
        <button
          onClick={testExactCurrentData}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Test Exact Current Data
        </button>
        <button
          onClick={testWithWorkingAmount}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
        >
          Test With Working Amount
        </button>
      </div>

      {result && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <pre className="text-sm whitespace-pre-wrap overflow-x-auto">{result}</pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">What this will tell us:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>If the issue is with the item name format</li>
          <li>If the issue is with the amount format</li>
          <li>Which combination produces the correct signature</li>
        </ul>
      </div>
    </div>
  );
}
