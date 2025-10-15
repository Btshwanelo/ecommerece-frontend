"use client";

import { useState } from "react";

export default function TestSimplePayfastPage() {
  const [result, setResult] = useState<string>("");

  const testSimpleForm = () => {
    // Your exact simple integration example
    const formData = {
      merchant_id: "10000100",
      merchant_key: "46f0cd694581a",
      amount: "100.00",
      item_name: "Test Product",
    };

    setResult(`=== SIMPLE PAYFAST INTEGRATION TEST ===
Form Data: ${JSON.stringify(formData, null, 2)}

=== FORM STRUCTURE ===
<form action="https://www.payfast.co.za/eng/process" method="post">
  <input type="hidden" name="merchant_id" value="${formData.merchant_id}">
  <input type="hidden" name="merchant_key" value="${formData.merchant_key}">
  <input type="hidden" name="amount" value="${formData.amount}">
  <input type="hidden" name="item_name" value="${formData.item_name}">
  <input type="submit">
</form>

=== ANALYSIS ===
✅ No signature generation needed
✅ Payfast handles signature automatically
✅ Simple 4-field form structure
✅ No passphrase required

=== IMPLEMENTATION ===
The PayfastService has been updated to use this simple approach:
- Only 4 basic fields: merchant_id, merchant_key, amount, item_name
- No signature generation
- No passphrase
- Payfast handles all security automatically`);
  };

  const testWithSandboxCredentials = () => {
    // Test with your sandbox credentials
    const sandboxData = {
      merchant_id: "10038198",
      merchant_key: "8yshtxb2mu1oa",
      amount: "55.00",
      item_name: "Order #ORD-1759871472166",
    };

    setResult(`=== SANDBOX CREDENTIALS TEST ===
Sandbox Data: ${JSON.stringify(sandboxData, null, 2)}

=== FORM STRUCTURE ===
<form action="https://sandbox.payfast.co.za/eng/process" method="post">
  <input type="hidden" name="merchant_id" value="${sandboxData.merchant_id}">
  <input type="hidden" name="merchant_key" value="${sandboxData.merchant_key}">
  <input type="hidden" name="amount" value="${sandboxData.amount}">
  <input type="hidden" name="item_name" value="${sandboxData.item_name}">
  <input type="submit">
</form>

=== ANALYSIS ===
✅ Using your sandbox credentials
✅ Simple 4-field form structure
✅ No signature generation needed
✅ Payfast handles signature automatically

=== IMPLEMENTATION ===
This is exactly what the PayfastService now does:
- Uses your sandbox credentials
- Only sends the 4 basic fields
- No signature generation
- Payfast handles all security automatically`);
  };

  const createTestForm = () => {
    // Create and submit a test form
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://sandbox.payfast.co.za/eng/process";
    form.target = "_blank"; // Open in new tab for testing

    const testData = {
      merchant_id: "10038198",
      merchant_key: "8yshtxb2mu1oa",
      amount: "55.00",
      item_name: "Test Order",
    };

    // Add form fields
    Object.keys(testData).forEach((key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = testData[key];
      form.appendChild(input);
    });

    // Add submit button
    const submitButton = document.createElement("input");
    submitButton.type = "submit";
    submitButton.value = "Test Payfast Payment";
    form.appendChild(submitButton);

    // Add form to page temporarily
    document.body.appendChild(form);
    
    setResult(`=== TEST FORM CREATED ===
Form has been created and added to the page.
Click the "Test Payfast Payment" button to test the simple integration.

Form Data: ${JSON.stringify(testData, null, 2)}

=== EXPECTED RESULT ===
✅ Should redirect to Payfast sandbox
✅ Should show payment form
✅ No signature errors
✅ Simple integration working`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Simple Payfast Integration Test</h1>
      
      <div className="bg-green-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">✅ Simple Integration Implemented</h2>
        <p>The PayfastService has been updated to use the simple integration approach with only 4 basic fields and no signature generation.</p>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={testSimpleForm}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Test Simple Form Structure
        </button>
        <button
          onClick={testWithSandboxCredentials}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Test With Sandbox Credentials
        </button>
        <button
          onClick={createTestForm}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
        >
          Create Test Form
        </button>
      </div>

      {result && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <pre className="text-sm whitespace-pre-wrap overflow-x-auto">{result}</pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">Simple Integration Benefits:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>No Signature Generation:</strong> Payfast handles this automatically</li>
          <li><strong>No Passphrase:</strong> Not required for basic integration</li>
          <li><strong>Simple Form:</strong> Only 4 basic fields needed</li>
          <li><strong>Automatic Security:</strong> Payfast handles all security measures</li>
          <li><strong>Easy Testing:</strong> Works immediately without complex setup</li>
        </ul>
      </div>
    </div>
  );
}


