"use client";

import { useState } from "react";
import CryptoJS from "crypto-js";

export default function TestMD5Page() {
  const [result, setResult] = useState<string>("");

  const testMD5Implementation = () => {
    const testString = "amount=300&item_name=shoes&merchant_id=10038198&merchant_key=8yshtxb2mu1oa";
    const expectedSignature = "a21a30c5faabecfa9cbbab6bf3cabc20";
    
    // Test with CryptoJS
    const cryptoJSSignature = CryptoJS.MD5(testString).toString();
    
    // Test with different methods
    const cryptoJSLowercase = CryptoJS.MD5(testString).toString().toLowerCase();
    const cryptoJSUppercase = CryptoJS.MD5(testString).toString().toUpperCase();
    
    // Test with different input formats
    const testStringWithSpaces = " amount=300&item_name=shoes&merchant_id=10038198&merchant_key=8yshtxb2mu1oa ";
    const cryptoJSTrimmed = CryptoJS.MD5(testStringWithSpaces.trim()).toString();
    
    setResult(`=== MD5 IMPLEMENTATION TEST ===
Test String: "${testString}"
Expected Signature: ${expectedSignature}

=== CRYPTOJS RESULTS ===
CryptoJS MD5: ${cryptoJSSignature}
CryptoJS Lowercase: ${cryptoJSLowercase}
CryptoJS Uppercase: ${cryptoJSUppercase}
CryptoJS Trimmed: ${cryptoJSTrimmed}

=== COMPARISONS ===
CryptoJS Match: ${cryptoJSSignature === expectedSignature ? '✅ YES' : '❌ NO'}
Lowercase Match: ${cryptoJSLowercase === expectedSignature ? '✅ YES' : '❌ NO'}
Uppercase Match: ${cryptoJSUppercase === expectedSignature ? '✅ YES' : '❌ NO'}
Trimmed Match: ${cryptoJSTrimmed === expectedSignature ? '✅ YES' : '❌ NO'}

=== KNOWN MD5 TESTS ===
MD5("hello"): ${CryptoJS.MD5("hello").toString()}
MD5(""): ${CryptoJS.MD5("").toString()}
MD5("test"): ${CryptoJS.MD5("test").toString()}

=== ANALYSIS ===
${cryptoJSSignature === expectedSignature 
  ? '✅ CryptoJS MD5 is working correctly!'
  : '❌ CryptoJS MD5 is not producing the expected result. There might be an issue with the implementation or the expected signature.'}`);
  };

  const testDifferentInputs = () => {
    const inputs = [
      "amount=300&item_name=shoes&merchant_id=10038198&merchant_key=8yshtxb2mu1oa",
      "amount=300&item_name=shoes&merchant_id=10038198&merchant_key=8yshtxb2mu1oa",
      "merchant_id=10038198&merchant_key=8yshtxb2mu1oa&amount=300&item_name=shoes",
      "merchant_key=8yshtxb2mu1oa&amount=300&item_name=shoes&merchant_id=10038198",
      "item_name=shoes&merchant_id=10038198&merchant_key=8yshtxb2mu1oa&amount=300"
    ];

    const expectedSignature = "a21a30c5faabecfa9cbbab6bf3cabc20";
    
    let results = "=== DIFFERENT INPUT ORDER TEST ===\n\n";
    
    inputs.forEach((input, index) => {
      const signature = CryptoJS.MD5(input).toString();
      const match = signature === expectedSignature;
      results += `Input ${index + 1}: ${input}\n`;
      results += `Signature: ${signature}\n`;
      results += `Match: ${match ? '✅ YES' : '❌ NO'}\n\n`;
    });

    setResult(results);
  };

  const testWithOnlineMD5 = () => {
    const testString = "amount=300&item_name=shoes&merchant_id=10038198&merchant_key=8yshtxb2mu1oa";
    const expectedSignature = "a21a30c5faabecfa9cbbab6bf3cabc20";
    const cryptoJSSignature = CryptoJS.MD5(testString).toString();
    
    setResult(`=== ONLINE MD5 VERIFICATION ===
Test String: "${testString}"
Expected Signature: ${expectedSignature}
CryptoJS Result: ${cryptoJSSignature}

=== MANUAL VERIFICATION STEPS ===
1. Copy this string: ${testString}
2. Go to: https://www.md5hashgenerator.com/
3. Paste the string and generate MD5
4. Compare with expected: ${expectedSignature}
5. Compare with CryptoJS: ${cryptoJSSignature}

=== EXPECTED RESULTS ===
If online MD5 matches expected: ✅ The signature is correct, issue is in our code
If online MD5 matches CryptoJS: ✅ Our MD5 is working, issue is with expected signature
If neither match: ❌ There's a fundamental issue with the test data

=== QUICK CHECK ===
You can also try: https://md5.gromweb.com/?md5=${testString}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">MD5 Implementation Test</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Testing MD5 Function</h2>
        <p>Let's verify if the MD5 implementation is working correctly with your exact data.</p>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={testMD5Implementation}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Test MD5 Implementation
        </button>
        <button
          onClick={testDifferentInputs}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Test Different Input Orders
        </button>
        <button
          onClick={testWithOnlineMD5}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
        >
          Get Online MD5 Verification
        </button>
      </div>

      {result && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <pre className="text-xs whitespace-pre-wrap overflow-x-auto">{result}</pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">What this will tell us:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>If our MD5 implementation is working correctly</li>
          <li>If the issue is with input formatting</li>
          <li>If the expected signature is correct</li>
          <li>How to verify with online tools</li>
        </ul>
      </div>
    </div>
  );
}


