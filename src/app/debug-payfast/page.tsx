"use client";

import { useState } from "react";

export default function DebugPayfastPage() {
  const [envVars, setEnvVars] = useState({
    merchantId: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || "",
    merchantKey: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || "",
    passPhrase: process.env.NEXT_PUBLIC_PAYFAST_PASSPHRASE || "",
    sandbox: process.env.NEXT_PUBLIC_PAYFAST_SANDBOX || "",
  });

  const checkEnvVars = () => {
    const issues = [];
    
    if (!envVars.merchantId) issues.push("NEXT_PUBLIC_PAYFAST_MERCHANT_ID is missing");
    if (!envVars.merchantKey) issues.push("NEXT_PUBLIC_PAYFAST_MERCHANT_KEY is missing");
    if (!envVars.passPhrase) issues.push("NEXT_PUBLIC_PAYFAST_PASSPHRASE is missing");
    if (!envVars.sandbox) issues.push("NEXT_PUBLIC_PAYFAST_SANDBOX is missing");

    return {
      isValid: issues.length === 0,
      issues
    };
  };

  const validation = checkEnvVars();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Payfast Environment Variables Debug</h1>
      
      <div className={`p-4 rounded-lg mb-6 ${validation.isValid ? 'bg-green-100' : 'bg-red-100'}`}>
        <h2 className="text-lg font-semibold mb-2">
          Configuration Status: {validation.isValid ? 'Valid' : 'Invalid'}
        </h2>
        {validation.issues.length > 0 && (
          <ul className="list-disc list-inside">
            {validation.issues.map((issue, index) => (
              <li key={index} className="text-red-700">{issue}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Merchant ID</label>
          <div className="p-3 bg-gray-100 rounded-lg font-mono text-sm">
            {envVars.merchantId || "Not set"}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Merchant Key</label>
          <div className="p-3 bg-gray-100 rounded-lg font-mono text-sm">
            {envVars.merchantKey || "Not set"}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Passphrase</label>
          <div className="p-3 bg-gray-100 rounded-lg font-mono text-sm">
            {envVars.passPhrase ? "***" + envVars.passPhrase.slice(-4) : "Not set"}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sandbox Mode</label>
          <div className="p-3 bg-gray-100 rounded-lg font-mono text-sm">
            {envVars.sandbox || "Not set"}
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Environment Variables Setup:</h3>
        <p className="text-sm mb-2">Create a <code>.env.local</code> file in your frontend directory with:</p>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`NEXT_PUBLIC_PAYFAST_MERCHANT_ID=your_merchant_id_here
NEXT_PUBLIC_PAYFAST_MERCHANT_KEY=your_merchant_key_here
NEXT_PUBLIC_PAYFAST_PASSPHRASE=your_passphrase_here
NEXT_PUBLIC_PAYFAST_SANDBOX=true`}
        </pre>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">Common Issues:</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Environment variables must start with <code>NEXT_PUBLIC_</code> to be accessible in the browser</li>
          <li>Restart your development server after adding environment variables</li>
          <li>Check that your <code>.env.local</code> file is in the correct directory</li>
          <li>Ensure there are no spaces around the <code>=</code> sign</li>
        </ul>
      </div>

      <div className="mt-6">
        <a
          href="/test-payfast"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block"
        >
          Go to Signature Test Page
        </a>
      </div>
    </div>
  );
}
