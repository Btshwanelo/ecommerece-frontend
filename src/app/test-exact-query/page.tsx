"use client";

import { useState } from "react";
import CryptoJS from "crypto-js";

export default function TestExactQueryPage() {
  const [result, setResult] = useState<string>("");

  const testExactQuery = () => {
    // Your exact query string from the logs
    const exactQuery = "amount=55.00&item_name=Order%20%23ORD-1759871472166&merchant_id=10038198&merchant_key=8yshtxb2mu1oa";
    const generatedSignature = "d57d7d99a6088faf78e021867ac47f9c";
    const targetSignature = "a21a30c5faabecfa9cbbab6bf3cabc20";

    // Test with CryptoJS
    const cryptoJSSignature = CryptoJS.MD5(exactQuery).toString();
    
    // Test with Node.js crypto (if available)
    let nodeSignature = "";
    try {
      const crypto = require('crypto');
      nodeSignature = crypto.createHash('md5').update(exactQuery).digest('hex');
    } catch (e) {
      nodeSignature = "Node.js crypto not available";
    }

    setResult(`=== EXACT QUERY TEST ===
Query String: "${exactQuery}"

=== SIGNATURE GENERATION ===
CryptoJS MD5: ${cryptoJSSignature}
Node.js crypto: ${nodeSignature}
Generated (from logs): ${generatedSignature}
Target (your working): ${targetSignature}

=== COMPARISONS ===
CryptoJS vs Generated: ${cryptoJSSignature === generatedSignature ? '✅ MATCH' : '❌ NO MATCH'}
CryptoJS vs Target: ${cryptoJSSignature === targetSignature ? '✅ MATCH' : '❌ NO MATCH'}
Node.js vs Generated: ${nodeSignature === generatedSignature ? '✅ MATCH' : '❌ NO MATCH'}
Node.js vs Target: ${nodeSignature === targetSignature ? '✅ MATCH' : '❌ NO MATCH'}

=== ANALYSIS ===
${cryptoJSSignature === generatedSignature 
  ? '✅ CryptoJS is working correctly - the issue is with the query string or expected signature'
  : '❌ CryptoJS is not producing the expected signature'}

=== DECODED QUERY ===
amount=55.00&item_name=Order #ORD-1759871472166&merchant_id=10038198&merchant_key=8yshtxb2mu1oa`);
  };

  const testWithWorkingData = () => {
    // Your working data
    const workingQuery = "amount=300&item_name=shoes&merchant_id=10038198&merchant_key=8yshtxb2mu1oa";
    const targetSignature = "a21a30c5faabecfa9cbbab6bf3cabc20";

    // Test with CryptoJS
    const cryptoJSSignature = CryptoJS.MD5(workingQuery).toString();
    
    // Test with Node.js crypto (if available)
    let nodeSignature = "";
    try {
      const crypto = require('crypto');
      nodeSignature = crypto.createHash('md5').update(workingQuery).digest('hex');
    } catch (e) {
      nodeSignature = "Node.js crypto not available";
    }

    setResult(`=== WORKING DATA TEST ===
Working Query: "${workingQuery}"

=== SIGNATURE GENERATION ===
CryptoJS MD5: ${cryptoJSSignature}
Node.js crypto: ${nodeSignature}
Target Signature: ${targetSignature}

=== COMPARISONS ===
CryptoJS vs Target: ${cryptoJSSignature === targetSignature ? '✅ MATCH' : '❌ NO MATCH'}
Node.js vs Target: ${nodeSignature === targetSignature ? '✅ MATCH' : '❌ NO MATCH'}

=== ANALYSIS ===
${cryptoJSSignature === targetSignature 
  ? '✅ CryptoJS works with your working data - the issue is with the current query string'
  : '❌ CryptoJS is not working with your working data either'}

=== DECODED QUERY ===
amount=300&item_name=shoes&merchant_id=10038198&merchant_key=8yshtxb2mu1oa`);
  };

  const testWithSimpleData = () => {
    // Test with simple data to isolate the issue
    const simpleQuery = "amount=55.00&item_name=test&merchant_id=10038198&merchant_key=8yshtxb2mu1oa";
    
    // Test with CryptoJS
    const cryptoJSSignature = CryptoJS.MD5(simpleQuery).toString();
    
    // Test with Node.js crypto (if available)
    let nodeSignature = "";
    try {
      const crypto = require('crypto');
      nodeSignature = crypto.createHash('md5').update(simpleQuery).digest('hex');
    } catch (e) {
      nodeSignature = "Node.js crypto not available";
    }

    setResult(`=== SIMPLE DATA TEST ===
Simple Query: "${simpleQuery}"

=== SIGNATURE GENERATION ===
CryptoJS MD5: ${cryptoJSSignature}
Node.js crypto: ${nodeSignature}

=== ANALYSIS ===
This tests if the issue is with the complex item_name or something else.

=== DECODED QUERY ===
amount=55.00&item_name=test&merchant_id=10038198&merchant_key=8yshtxb2mu1oa`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Exact Query Test</h1>
      
      <div className="bg-red-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Current Issue</h2>
        <div className="font-mono text-sm">
          <p><strong>Query:</strong> amount=55.00&item_name=Order%20%23ORD-1759871472166&merchant_id=10038198&merchant_key=8yshtxb2mu1oa</p>
          <p><strong>Generated:</strong> d57d7d99a6088faf78e021867ac47f9c</p>
          <p><strong>Target:</strong> a21a30c5faabecfa9cbbab6bf3cabc20</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={testExactQuery}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
        >
          Test Exact Query from Logs
        </button>
        <button
          onClick={testWithWorkingData}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Test With Working Data
        </button>
        <button
          onClick={testWithSimpleData}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Test With Simple Data
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
          <li>If the MD5 implementation is working correctly</li>
          <li>If the issue is with the query string format</li>
          <li>If the issue is with the expected signature</li>
        </ul>
      </div>
    </div>
  );
}
