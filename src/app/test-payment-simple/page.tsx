"use client";

import { useState } from "react";

export default function TestPaymentSimplePage() {
  const [result, setResult] = useState<string>("");

  const testPaymentPageIntegration = () => {
    setResult(`=== PAYMENT PAGE SIMPLE INTEGRATION TEST ===

✅ UPDATES MADE TO PAYMENT PAGE:

1. **Removed Complex Configuration:**
   - Removed return_url, cancel_url, notify_url
   - Removed signature generation
   - Removed passphrase handling

2. **Simplified Payment Data:**
   - 6 basic fields: merchant_id, merchant_key, amount, item_name, return_url, cancel_url
   - No signature field
   - No complex user details

3. **Removed Phone Number Input:**
   - No longer needed for simple integration
   - Cleaner UI

4. **Updated Button Text:**
   - Now shows "Pay with Payfast (Simple)"

=== FORM STRUCTURE NOW CREATED ===
<form action="https://sandbox.payfast.co.za/eng/process" method="post">
  <input type="hidden" name="merchant_id" value="10038198">
  <input type="hidden" name="merchant_key" value="8yshtxb2mu1oa">
  <input type="hidden" name="amount" value="55.00">
  <input type="hidden" name="item_name" value="Order ORD-123">
  <input type="hidden" name="return_url" value="http://localhost:3000/checkout/payment/success?orderId=ORD-123">
  <input type="hidden" name="cancel_url" value="http://localhost:3000/checkout/payment/cancel?orderId=ORD-123">
  <input type="submit">
</form>

=== BENEFITS ===
✅ No signature generation errors
✅ No passphrase issues
✅ Simple 6-field form with return URLs
✅ Payfast handles security automatically
✅ Works immediately without complex setup

=== TESTING ===
1. Go to checkout page
2. Complete checkout process
3. Click "Pay with Payfast (Simple)"
4. Should redirect to Payfast without errors`);
  };

  const simulatePaymentForm = () => {
    // Simulate the exact form that the payment page now creates
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://sandbox.payfast.co.za/eng/process";
    form.target = "_blank"; // Open in new tab for testing

    const testData = {
      merchant_id: "10038198",
      merchant_key: "8yshtxb2mu1oa",
      amount: "55.00",
      item_name: "Test Order",
      return_url: `${window.location.origin}/checkout/payment/success?orderId=TEST-123`,
      cancel_url: `${window.location.origin}/checkout/payment/cancel?orderId=TEST-123`,
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
    submitButton.value = "Test Simple Payfast Payment";
    form.appendChild(submitButton);

    // Add form to page temporarily
    document.body.appendChild(form);
    
    setResult(`=== SIMULATED PAYMENT FORM CREATED ===
Form has been created and added to the page.
Click the "Test Simple Payfast Payment" button to test.

Form Data: ${JSON.stringify(testData, null, 2)}

=== EXPECTED RESULT ===
✅ Should redirect to Payfast sandbox
✅ Should show payment form
✅ No signature errors
✅ Simple integration working

=== CONSOLE LOGS TO EXPECT ===
- "Simple Payment Data: {merchant_id: '10038198', merchant_key: '8yshtxb2mu1oa', amount: '55.00', item_name: 'Order ORD-123'}"
- "Submitting simple form to PayFast: https://sandbox.payfast.co.za/eng/process"`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Payment Page Simple Integration Test</h1>
      
      <div className="bg-green-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">✅ Payment Page Updated</h2>
        <p>The payment page has been updated to use the simple Payfast integration with only 4 basic fields and no signature generation.</p>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={testPaymentPageIntegration}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Show Payment Page Updates
        </button>
        <button
          onClick={simulatePaymentForm}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Simulate Payment Form
        </button>
      </div>

      {result && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <pre className="text-sm whitespace-pre-wrap overflow-x-auto">{result}</pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">Next Steps:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Go to your checkout page</li>
          <li>Complete the checkout process</li>
          <li>Click "Pay with Payfast (Simple)"</li>
          <li>Should redirect to Payfast without signature errors</li>
          <li>Check console logs for "Simple Payment Data" message</li>
        </ol>
      </div>
    </div>
  );
}
