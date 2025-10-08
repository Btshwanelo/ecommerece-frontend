"use client";

import { useState } from "react";
import CryptoJS from "crypto-js";

export default function DebugSignatureStepByStep() {
  const [result, setResult] = useState<string>("");

  const debugStepByStep = () => {
    // Your exact working data
    const exactData = {
      merchant_id: "10038198",
      merchant_key: "8yshtxb2mu1oa",
      amount: "300",
      item_name: "shoes",
    };

    const targetSignature = "a21a30c5faabecfa9cbbab6bf3cabc20";

    // Step 1: Show original data
    let debug = "=== STEP-BY-STEP SIGNATURE DEBUG ===\n\n";
    debug += "STEP 1: Original Data\n";
    debug += JSON.stringify(exactData, null, 2) + "\n\n";

    // Step 2: Filter data (remove empty values and signature)
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

    debug += "STEP 2: Filtered Data (after removing empty values)\n";
    debug += JSON.stringify(filteredData, null, 2) + "\n\n";

    // Step 3: Sort keys alphabetically
    const sortedKeys = Object.keys(filteredData).sort();
    debug += "STEP 3: Sorted Keys (alphabetical order)\n";
    debug += JSON.stringify(sortedKeys, null, 2) + "\n\n";

    // Step 4: Create query string with URL encoding
    const queryString = sortedKeys
      .map((key) => `${key}=${encodeURIComponent(filteredData[key])}`)
      .join("&");

    debug += "STEP 4: Query String (with URL encoding)\n";
    debug += `"${queryString}"\n\n`;

    // Step 5: Show each parameter separately
    debug += "STEP 5: Individual Parameters\n";
    sortedKeys.forEach((key, index) => {
      const encoded = encodeURIComponent(filteredData[key]);
      debug += `${index + 1}. ${key}=${filteredData[key]} → ${key}=${encoded}\n`;
    });
    debug += "\n";

    // Step 6: Generate MD5 hash
    const signature = CryptoJS.MD5(queryString).toString();
    debug += "STEP 6: MD5 Hash Generation\n";
    debug += `Input: "${queryString}"\n`;
    debug += `MD5: ${signature}\n\n`;

    // Step 7: Compare with target
    debug += "STEP 7: Comparison\n";
    debug += `Target: ${targetSignature}\n`;
    debug += `Generated: ${signature}\n`;
    debug += `Match: ${signature === targetSignature ? '✅ YES' : '❌ NO'}\n\n`;

    // Step 8: Try alternative approaches
    debug += "=== ALTERNATIVE APPROACHES ===\n\n";

    // Try without URL encoding
    const queryStringNoEncoding = sortedKeys
      .map((key) => `${key}=${filteredData[key]}`)
      .join("&");
    const signatureNoEncoding = CryptoJS.MD5(queryStringNoEncoding).toString();
    
    debug += "ALTERNATIVE 1: Without URL Encoding\n";
    debug += `Query: "${queryStringNoEncoding}"\n`;
    debug += `Signature: ${signatureNoEncoding}\n`;
    debug += `Match: ${signatureNoEncoding === targetSignature ? '✅ YES' : '❌ NO'}\n\n`;

    // Try with different order (not alphabetical)
    const queryStringOriginalOrder = Object.keys(exactData)
      .map((key) => `${key}=${encodeURIComponent(exactData[key])}`)
      .join("&");
    const signatureOriginalOrder = CryptoJS.MD5(queryStringOriginalOrder).toString();
    
    debug += "ALTERNATIVE 2: Original Order (not alphabetical)\n";
    debug += `Query: "${queryStringOriginalOrder}"\n`;
    debug += `Signature: ${signatureOriginalOrder}\n`;
    debug += `Match: ${signatureOriginalOrder === targetSignature ? '✅ YES' : '❌ NO'}\n\n`;

    // Try with Node.js crypto (if available)
    try {
      const crypto = require('crypto');
      const nodeSignature = crypto.createHash('md5').update(queryString).digest('hex');
      debug += "ALTERNATIVE 3: Node.js crypto\n";
      debug += `Signature: ${nodeSignature}\n`;
      debug += `Match: ${nodeSignature === targetSignature ? '✅ YES' : '❌ NO'}\n\n`;
    } catch (e) {
      debug += "ALTERNATIVE 3: Node.js crypto not available\n\n";
    }

    // Try manual MD5 calculation
    debug += "=== MANUAL VERIFICATION ===\n";
    debug += "Let's verify the expected query string manually:\n";
    debug += "Expected: amount=300&item_name=shoes&merchant_id=10038198&merchant_key=8yshtxb2mu1oa\n";
    debug += `Actual: ${queryString}\n`;
    debug += `Match: ${queryString === "amount=300&item_name=shoes&merchant_id=10038198&merchant_key=8yshtxb2mu1oa" ? '✅ YES' : '❌ NO'}\n\n`;

    setResult(debug);
  };

  const testWithManualQuery = () => {
    const targetSignature = "a21a30c5faabecfa9cbbab6bf3cabc20";
    
    // Try the exact query string that should work
    const manualQuery = "amount=300&item_name=shoes&merchant_id=10038198&merchant_key=8yshtxb2mu1oa";
    const signature = CryptoJS.MD5(manualQuery).toString();
    
    setResult(`=== MANUAL QUERY TEST ===
Manual Query String: "${manualQuery}"
Generated Signature: ${signature}
Target Signature: ${targetSignature}
Match: ${signature === targetSignature ? '✅ YES - FOUND THE ISSUE!' : '❌ NO - Still not working'}

=== ANALYSIS ===
${signature === targetSignature 
  ? 'The manual query works! The issue is in our data processing logic.'
  : 'Even the manual query fails. There might be an issue with the MD5 implementation or the expected signature.'}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Step-by-Step Signature Debug</h1>
      
      <div className="bg-red-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Your Working Data</h2>
        <div className="font-mono text-sm">
          <p><strong>merchant_id:</strong> 10038198</p>
          <p><strong>merchant_key:</strong> 8yshtxb2mu1oa</p>
          <p><strong>amount:</strong> 300</p>
          <p><strong>item_name:</strong> shoes</p>
          <p><strong>Expected signature:</strong> a21a30c5faabecfa9cbbab6bf3cabc20</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={debugStepByStep}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
        >
          Debug Step by Step
        </button>
        <button
          onClick={testWithManualQuery}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Test Manual Query String
        </button>
      </div>

      {result && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Results:</h3>
          <pre className="text-xs whitespace-pre-wrap overflow-x-auto">{result}</pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">What this will reveal:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Exact data processing steps</li>
          <li>Query string generation</li>
          <li>MD5 hash generation</li>
          <li>Alternative approaches</li>
          <li>Manual verification</li>
        </ul>
      </div>
    </div>
  );
}
