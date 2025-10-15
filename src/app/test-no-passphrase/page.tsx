"use client";

import { useState } from "react";
import { PayfastService } from "@/services/v2/payfastService";

export default function TestNoPassphrasePage() {
  const [result, setResult] = useState<string>("");

  const testCurrentData = () => {
    // Test with the exact current data from your logs
    const currentData = {
      merchant_id: "10038198",
      merchant_key: "8yshtxb2mu1oa",
      amount: "5500",
      item_name: "subscrioto",
    };

    const signature = (PayfastService as any).generateSignature(currentData);
    const targetSignature = "a21a30c5faabecfa9cbbab6bf3cabc20";

    setResult(`=== CURRENT DATA TEST (NO PASSPHRASE) ===
Current Data: ${JSON.stringify(currentData, null, 2)}

=== SIGNATURE GENERATION ===
Generated Signature: ${signature}
Target Signature: ${targetSignature}
Match: ${signature === targetSignature ? '✅ YES - PERFECT MATCH!' : '❌ NO - Still not matching'}

=== ANALYSIS ===
${signature === targetSignature 
  ? '✅ The signature generation is now working correctly!'
  : '❌ The signature generation is still not matching your working example.'}

=== QUERY STRING ===
amount=55.00&item_name=Order%20%23ORD-1759871472166&merchant_id=10038198&merchant_key=8yshtxb2mu1oa`);
  };

  const testWorkingData = () => {
    // Test with your working data
    const workingData = {
      merchant_id: "10038198",
      merchant_key: "8yshtxb2mu1oa",
      amount: "300",
      item_name: "shoes",
    };

    const signature = (PayfastService as any).generateSignature(workingData);
    const targetSignature = "a21a30c5faabecfa9cbbab6bf3cabc20";

    setResult(`=== WORKING DATA TEST (NO PASSPHRASE) ===
Working Data: ${JSON.stringify(workingData, null, 2)}

=== SIGNATURE GENERATION ===
Generated Signature: ${signature}
Target Signature: ${targetSignature}
Match: ${signature === targetSignature ? '✅ YES - PERFECT MATCH!' : '❌ NO - Still not matching'}

=== ANALYSIS ===
${signature === targetSignature 
  ? '✅ The signature generation works with your working data!'
  : '❌ The signature generation is not working with your working data either.'}

=== QUERY STRING ===
amount=300&item_name=shoes&merchant_id=10038198&merchant_key=8yshtxb2mu1oa`);
  };

  const testExactWorkingData = () => {
    const result = PayfastService.testExactWorkingData();
    
    setResult(`=== EXACT WORKING DATA TEST ===
${JSON.stringify(result, null, 2)}

=== ANALYSIS ===
${result.success && result.match 
  ? '✅ The exact working data test is successful!'
  : '❌ The exact working data test is failing.'}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">No Passphrase Test</h1>
      
      <div className="bg-green-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">✅ Passphrase Removed</h2>
        <p>All passphrase references have been completely removed from the PayfastService.</p>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={testCurrentData}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Test Current Data (55.00)
        </button>
        <button
          onClick={testWorkingData}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Test Working Data (300)
        </button>
        <button
          onClick={testExactWorkingData}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
        >
          Test Exact Working Data
        </button>
      </div>

      {result && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <pre className="text-sm whitespace-pre-wrap overflow-x-auto">{result}</pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">What to expect:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Working Data Test:</strong> Should produce the target signature "a21a30c5faabecfa9cbbab6bf3cabc20"</li>
          <li><strong>Current Data Test:</strong> May not match the target signature (different amount/item_name)</li>
          <li><strong>Exact Working Data Test:</strong> Should be successful and match the target signature</li>
        </ul>
      </div>
    </div>
  );
}


