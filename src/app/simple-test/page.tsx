"use client";

import { useState } from "react";

export default function SimpleTestPage() {
  const [result, setResult] = useState<string>("");

  const testImport = () => {
    let info = "=== Simple Import Test ===\n\n";
    
    try {
      // Try to import OrderService
      const OrderService = require("@/services/v2/orderService").default;
      
      info += "✅ OrderService imported via require\n";
      info += `✅ Type: ${typeof OrderService}\n`;
      info += `✅ Constructor: ${OrderService.constructor.name}\n`;
      
      // Check for the method
      if (OrderService.updateOrderStatus) {
        info += "✅ updateOrderStatus method exists\n";
        info += `✅ Method type: ${typeof OrderService.updateOrderStatus}\n`;
      } else {
        info += "❌ updateOrderStatus method NOT FOUND\n";
      }
      
      // List all properties
      info += "\n📋 All properties:\n";
      Object.getOwnPropertyNames(OrderService).forEach(prop => {
        info += `  - ${prop}: ${typeof OrderService[prop]}\n`;
      });
      
    } catch (error: any) {
      info += `❌ Error: ${error.message}\n`;
    }
    
    setResult(info);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Simple Import Test</h1>
      
      <button
        onClick={testImport}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 mb-6"
      >
        Test Import
      </button>

      {result && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <pre className="text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
}
