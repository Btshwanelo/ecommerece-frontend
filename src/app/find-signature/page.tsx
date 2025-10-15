"use client";

import { useState } from "react";
import CryptoJS from "crypto-js";

export default function FindSignaturePage() {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [targetSignature] = useState("a21a30c5faabecfa9cbbab6bf3cabc20");

  const generateSignature = (data: Record<string, string>, useUrlEncoding: boolean = true) => {
    const filteredData = Object.entries(data)
      .filter(([key, value]) => value !== "" && key !== "signature")
      .sort(([a], [b]) => a.localeCompare(b));

    const queryString = filteredData
      .map(([key, value]) => 
        useUrlEncoding 
          ? `${key}=${encodeURIComponent(value)}`
          : `${key}=${value}`
      )
      .join("&");

    const stringToSign = data.passphrase
      ? useUrlEncoding
        ? `${queryString}&passphrase=${encodeURIComponent(data.passphrase)}`
        : `${queryString}&passphrase=${data.passphrase}`
      : queryString;

    return CryptoJS.MD5(stringToSign).toString();
  };

  const findMatchingSignature = async () => {
    setIsSearching(true);
    setResults([]);
    
    const commonValues = {
      merchant_ids: ["10000100", "10000101", "10000102"],
      merchant_keys: ["46f0cd694581a", "46f0cd694581b", "46f0cd694581c"],
      amounts: ["100.00", "50.00", "25.00"],
      item_names: ["Test Item", "Test Product", "Sample Item"],
      emails: ["test@example.com", "sandbox@payfast.co.za", "demo@test.com"],
      first_names: ["Test", "Demo", "Sample"],
      last_names: ["User", "Customer", "Buyer"],
      passphrases: ["jt7NOE43FZPn", "testpassphrase", "sandbox123", ""]
    };

    const found: string[] = [];
    let count = 0;

    for (const merchant_id of commonValues.merchant_ids) {
      for (const merchant_key of commonValues.merchant_keys) {
        for (const amount of commonValues.amounts) {
          for (const item_name of commonValues.item_names) {
            for (const email of commonValues.emails) {
              for (const first_name of commonValues.first_names) {
                for (const last_name of commonValues.last_names) {
                  for (const passphrase of commonValues.passphrases) {
                    count++;
                    
                    const testData = {
                      merchant_id,
                      merchant_key,
                      amount,
                      item_name,
                      email_address: email,
                      name_first: first_name,
                      name_last: last_name,
                      passphrase
                    };

                    // Test with URL encoding
                    const sig1 = generateSignature(testData, true);
                    if (sig1 === targetSignature) {
                      found.push(`✅ FOUND (URL Encoded): ${JSON.stringify(testData)}`);
                    }

                    // Test without URL encoding
                    const sig2 = generateSignature(testData, false);
                    if (sig2 === targetSignature) {
                      found.push(`✅ FOUND (No URL Encoding): ${JSON.stringify(testData)}`);
                    }

                    // Update results every 100 iterations
                    if (count % 100 === 0) {
                      setResults([...found, `Searched ${count} combinations...`]);
                      await new Promise(resolve => setTimeout(resolve, 10)); // Allow UI to update
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    setResults([...found, `Search complete. Tested ${count} combinations.`]);
    setIsSearching(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Find Payfast Signature Data</h1>
      
      <div className="bg-yellow-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Target Signature</h2>
        <p className="font-mono text-lg">{targetSignature}</p>
        <p className="text-sm text-gray-600 mt-1">Searching for data that generates this signature</p>
      </div>

      <div className="mb-6">
        <button
          onClick={findMatchingSignature}
          disabled={isSearching}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSearching ? "Searching..." : "Find Matching Data"}
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Results:</h3>
        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-gray-500">No results yet. Click "Find Matching Data" to start searching.</p>
          ) : (
            <div className="space-y-2">
              {results.map((result, index) => (
                <div key={index} className="text-sm font-mono bg-white p-2 rounded">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">What this does:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Tests common Payfast sandbox values</li>
          <li>Checks both URL-encoded and non-encoded versions</li>
          <li>Finds the exact data that generates your target signature</li>
          <li>Shows you the correct format to use in your service</li>
        </ul>
      </div>
    </div>
  );
}


