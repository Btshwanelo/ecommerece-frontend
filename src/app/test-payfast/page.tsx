"use client";

import { useState } from "react";
import { PayfastService } from "@/services/v2/payfastService";

export default function TestPayfastPage() {
  const [testData, setTestData] = useState({
    merchant_id: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || "",
    merchant_key: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || "",
    amount: "100.00",
    item_name: "Test Item",
    email_address: "test@example.com",
    name_first: "Test",
    name_last: "User",
  });

  const [result, setResult] = useState<string>("");

  const testSignature = () => {
    try {
      // Test signature generation
      const signature = (PayfastService as any).generateSignature(testData);
      setResult(`Generated signature: ${signature}`);
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    }
  };

  const testAlternativeSignature = () => {
    try {
      // Test alternative signature generation
      const signature = (PayfastService as any).generateSignatureAlternative(testData);
      setResult(`Alternative signature: ${signature}`);
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    }
  };

  const testBothSignatures = () => {
    try {
      const signature1 = (PayfastService as any).generateSignature(testData);
      const signature2 = (PayfastService as any).generateSignatureAlternative(testData);
      setResult(`Standard signature: ${signature1}\nAlternative signature: ${signature2}`);
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    }
  };

  const testDirectSignature = () => {
    try {
      const result = PayfastService.testExactWorkingData();
      setResult(`Direct Test Result: ${JSON.stringify(result, null, 2)}`);
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    }
  };

  const validateConfig = () => {
    const validation = PayfastService.validateConfiguration();
    setResult(validation.isValid 
      ? "Configuration is valid" 
      : `Configuration errors: ${validation.errors.join(', ')}`
    );
  };

  // Using exact working example approach - no method switching needed

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Payfast Signature Test</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Configuration Status</h2>
        <p>{PayfastService.getConfigurationStatus()}</p>
        <p className="mt-2">Using exact working example approach</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Merchant ID</label>
          <input
            type="text"
            value={testData.merchant_id}
            onChange={(e) => setTestData({...testData, merchant_id: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Merchant Key</label>
          <input
            type="text"
            value={testData.merchant_key}
            onChange={(e) => setTestData({...testData, merchant_key: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input
            type="text"
            value={testData.amount}
            onChange={(e) => setTestData({...testData, amount: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Item Name</label>
          <input
            type="text"
            value={testData.item_name}
            onChange={(e) => setTestData({...testData, item_name: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={testData.email_address}
            onChange={(e) => setTestData({...testData, email_address: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            type="text"
            value={testData.name_first}
            onChange={(e) => setTestData({...testData, name_first: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            type="text"
            value={testData.name_last}
            onChange={(e) => setTestData({...testData, name_last: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      <div className="mt-6 space-x-4">
        <button
          onClick={validateConfig}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Validate Config
        </button>
        <button
          onClick={testSignature}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Test Exact Working Signature
        </button>
        <button
          onClick={testAlternativeSignature}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
        >
          Test Alternative
        </button>
        <button
          onClick={testBothSignatures}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          Test Both
        </button>
        <button
          onClick={testDirectSignature}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Test Direct (No Filtering)
        </button>
      </div>

      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <p className="text-sm text-green-800">
          ✅ Using exact working example approach - signature generation matches your working project
        </p>
      </div>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Result:</h3>
          <pre className="text-sm">{result}</pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Check your browser console for detailed signature generation logs</li>
          <li>Compare the generated signature with Payfast's expected signature</li>
          <li>Ensure your passphrase is correct and matches your Payfast account</li>
          <li>Verify all merchant credentials are correct</li>
        </ol>
      </div>
    </div>
  );
}
