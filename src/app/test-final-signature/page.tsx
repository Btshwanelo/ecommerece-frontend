"use client";

import { useState } from "react";
import { PayfastService } from "@/services/v2/payfastService";

export default function TestFinalSignaturePage() {
  const [result, setResult] = useState<string>("");

  const testWithExactWorkingData = () => {
    // Your exact working data from Payfast sandbox
    const exactData = {
      merchant_id: "10038198",
      merchant_key: "8yshtxb2mu1oa",
      amount: "300",
      item_name: "shoes",
    };

    const targetSignature = "a21a30c5faabecfa9cbbab6bf3cabc20";

    // Test with the current PayfastService
    const signature = PayfastService.testExactWorkingData();
    
    setResult(`=== FINAL SIGNATURE TEST ===
Your Working Data: ${JSON.stringify(exactData, null, 2)}
Target Signature: ${targetSignature}

=== PAYFAST SERVICE TEST ===
Result: ${JSON.stringify(signature, null, 2)}

=== ANALYSIS ===
${signature.match ? '✅ SUCCESS - Signature matches!' : '❌ FAILED - Signature does not match'}

=== NEXT STEPS ===
${signature.match 
  ? 'The Payfast service is now working correctly. Try your payment flow again.'
  : 'The signature generation is still not working. We need to investigate further.'}`);
  };

  const testWithCurrentPaymentData = () => {
    // Test with the actual payment data structure being sent
    const paymentData = {
      merchant_id: "10038198",
      merchant_key: "8yshtxb2mu1oa",
      return_url: "http://localhost:3001/checkout/payment/success?orderId=test123",
      cancel_url: "http://localhost:3001/checkout/payment/cancel?orderId=test123",
      notify_url: "http://localhost:3001/api/payfast/notify",
      m_payment_id: "ORDER_test123_1234567890",
      amount: "55.00",
      item_name: "Order #test123",
      item_description: "Payment for order test123",
      email_address: "test@example.com",
      name_first: "John",
      name_last: "Doe",
      cell_number: "+27726589446",
    };

    // Test signature generation
    const signature = PayfastService.testSignatureWithoutPassphrase(paymentData);
    
    setResult(`=== CURRENT PAYMENT DATA TEST ===
Payment Data: ${JSON.stringify(paymentData, null, 2)}

=== SIGNATURE GENERATION ===
Generated Signature: ${signature}

=== COMPARISON ===
Your Working Signature: a21a30c5faabecfa9cbbab6bf3cabc20
Generated Signature: ${signature}
Match: ${signature === "a21a30c5faabecfa9cbbab6bf3cabc20" ? '✅ YES' : '❌ NO'}

=== ANALYSIS ===
${signature === "a21a30c5faabecfa9cbbab6bf3cabc20" 
  ? '✅ The signature generation is working correctly!'
  : '❌ The signature generation is still not matching your working example.'}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Final Signature Test</h1>
      
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
          onClick={testWithExactWorkingData}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Test With Exact Working Data
        </button>
        <button
          onClick={testWithCurrentPaymentData}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Test With Current Payment Data
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
          <li>If the Payfast service is now working with your exact data</li>
          <li>If the signature generation matches your working example</li>
          <li>If the current payment data structure is causing issues</li>
        </ul>
      </div>
    </div>
  );
}
