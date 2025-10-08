"use client";

import { useState } from "react";
import CryptoJS from "crypto-js";

export default function TestSignaturePage() {
  const [testData, setTestData] = useState({
    merchant_id: "",
    merchant_key: "",
    amount: "100.00",
    item_name: "Test Item",
    email_address: "test@example.com",
    name_first: "Test",
    name_last: "User",
    passphrase: "",
  });

  const [result, setResult] = useState<string>("");
  const [targetSignature] = useState("a21a30c5faabecfa9cbbab6bf3cabc20");

  const generateSignature = (data: Record<string, string>, useUrlEncoding: boolean = true) => {
    // Remove empty values and signature field
    const filteredData = Object.entries(data)
      .filter(([key, value]) => value !== "" && key !== "signature")
      .sort(([a], [b]) => a.localeCompare(b));

    // Create query string
    const queryString = filteredData
      .map(([key, value]) => 
        useUrlEncoding 
          ? `${key}=${encodeURIComponent(value)}`
          : `${key}=${value}`
      )
      .join("&");

    // Add passphrase if provided
    const stringToSign = data.passphrase
      ? useUrlEncoding
        ? `${queryString}&passphrase=${encodeURIComponent(data.passphrase)}`
        : `${queryString}&passphrase=${data.passphrase}`
      : queryString;

    // Generate MD5 hash
    const signature = CryptoJS.MD5(stringToSign).toString();
    
    return {
      filteredData,
      queryString,
      stringToSign,
      signature,
      matches: signature === targetSignature
    };
  };

  const testSignature = () => {
    const result1 = generateSignature(testData, true); // With URL encoding
    const result2 = generateSignature(testData, false); // Without URL encoding
    
    setResult(`=== WITH URL ENCODING ===
Filtered data: ${JSON.stringify(result1.filteredData)}
Query string: ${result1.queryString}
String to sign: ${result1.stringToSign}
Generated signature: ${result1.signature}
Matches target: ${result1.matches ? '✅ YES' : '❌ NO'}

=== WITHOUT URL ENCODING ===
Filtered data: ${JSON.stringify(result2.filteredData)}
Query string: ${result2.queryString}
String to sign: ${result2.stringToSign}
Generated signature: ${result2.signature}
Matches target: ${result2.matches ? '✅ YES' : '❌ NO'}

=== TARGET SIGNATURE ===
Expected: ${targetSignature}`);
  };

  const testWithCommonValues = () => {
    const commonTestData = {
      merchant_id: "10000100",
      merchant_key: "46f0cd694581a",
      amount: "100.00",
      item_name: "Test Item",
      email_address: "test@example.com",
      name_first: "Test",
      name_last: "User",
      passphrase: "jt7NOE43FZPn",
    };

    setTestData(commonTestData);
    testSignature();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Payfast Signature Reverse Engineering</h1>
      
      <div className="bg-yellow-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Target Signature</h2>
        <p className="font-mono text-lg">{targetSignature}</p>
        <p className="text-sm text-gray-600 mt-1">This is the signature that works with Payfast sandbox</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Test Data</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Merchant ID</label>
              <input
                type="text"
                value={testData.merchant_id}
                onChange={(e) => setTestData({...testData, merchant_id: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="10000100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Merchant Key</label>
              <input
                type="text"
                value={testData.merchant_key}
                onChange={(e) => setTestData({...testData, merchant_key: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="46f0cd694581a"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="text"
                value={testData.amount}
                onChange={(e) => setTestData({...testData, amount: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="100.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Item Name</label>
              <input
                type="text"
                value={testData.item_name}
                onChange={(e) => setTestData({...testData, item_name: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Test Item"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={testData.email_address}
                onChange={(e) => setTestData({...testData, email_address: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="test@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                value={testData.name_first}
                onChange={(e) => setTestData({...testData, name_first: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Test"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                type="text"
                value={testData.name_last}
                onChange={(e) => setTestData({...testData, name_last: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="User"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Passphrase</label>
              <input
                type="text"
                value={testData.passphrase}
                onChange={(e) => setTestData({...testData, passphrase: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="jt7NOE43FZPn"
              />
            </div>
          </div>

          <div className="mt-6 space-x-4">
            <button
              onClick={testSignature}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Test Signature
            </button>
            <button
              onClick={testWithCommonValues}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Use Common Values
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Results</h3>
          {result && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="text-xs whitespace-pre-wrap overflow-x-auto">{result}</pre>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Enter your Payfast sandbox credentials</li>
          <li>Click "Test Signature" to see both encoding methods</li>
          <li>Look for the ✅ YES indicator to find the correct method</li>
          <li>Use the matching method in your Payfast service</li>
        </ol>
      </div>
    </div>
  );
}
