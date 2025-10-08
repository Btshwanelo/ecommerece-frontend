"use client";

import { useState } from "react";
import { OrderService } from "@/services/v2/orderService";

export default function TestOrderServicePage() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testOrderService = async () => {
    setLoading(true);
    setResult("Testing OrderService methods...\n\n");

    try {
      // Test if the method exists
      if (typeof OrderService.updateOrderStatus === 'function') {
        setResult(prev => prev + "✅ OrderService.updateOrderStatus method exists\n");
        
        // Test method signature
        const methodString = OrderService.updateOrderStatus.toString();
        setResult(prev => prev + `✅ Method signature: ${methodString.substring(0, 100)}...\n\n`);
        
        // Test other methods
        const methods = [
          'getOrders',
          'getOrderById', 
          'getOrderByNumber',
          'initiateCheckout',
          'completeCheckout',
          'getOrdersByStatus',
          'getOrdersByPaymentStatus',
          'getOrdersByUser',
          'searchOrders',
          'getOrdersByDateRange',
          'getRecentOrders',
          'updateOrderStatus'
        ];

        setResult(prev => prev + "📋 Available OrderService methods:\n");
        methods.forEach(method => {
          if (typeof (OrderService as any)[method] === 'function') {
            setResult(prev => prev + `✅ ${method}\n`);
          } else {
            setResult(prev => prev + `❌ ${method} - NOT FOUND\n`);
          }
        });

        setResult(prev => prev + "\n🔧 OrderService class structure:\n");
        setResult(prev => prev + `- Constructor: ${typeof OrderService}\n`);
        setResult(prev => prev + `- Prototype methods: ${Object.getOwnPropertyNames(OrderService.prototype).length}\n`);
        setResult(prev => prev + `- Static methods: ${Object.getOwnPropertyNames(OrderService).filter(name => typeof (OrderService as any)[name] === 'function').length}\n`);

      } else {
        setResult(prev => prev + "❌ OrderService.updateOrderStatus method NOT FOUND\n");
      }

    } catch (error: any) {
      setResult(prev => prev + `❌ Error testing OrderService: ${error.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  const testImport = () => {
    setResult("Testing import paths...\n\n");
    
    try {
      // Test direct import
      setResult(prev => prev + "✅ Direct import from orderService.ts works\n");
      
      // Test if we can access the class
      setResult(prev => prev + `✅ OrderService class: ${typeof OrderService}\n`);
      setResult(prev => prev + `✅ OrderService constructor: ${OrderService.constructor.name}\n`);
      
      // Test static methods
      const staticMethods = Object.getOwnPropertyNames(OrderService).filter(name => 
        typeof (OrderService as any)[name] === 'function' && name !== 'constructor'
      );
      
      setResult(prev => prev + `✅ Static methods found: ${staticMethods.length}\n`);
      staticMethods.forEach(method => {
        setResult(prev => prev + `  - ${method}\n`);
      });

    } catch (error: any) {
      setResult(prev => prev + `❌ Import error: ${error.message}\n`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">OrderService Test Page</h1>
      
      <div className="bg-yellow-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">🔍 Debugging OrderService Import Issue</h2>
        <p>This page tests if the OrderService methods are properly imported and available.</p>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={testImport}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 mr-4"
        >
          Test Import
        </button>
        
        <button
          onClick={testOrderService}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test OrderService Methods"}
        </button>
      </div>

      {result && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <pre className="text-sm whitespace-pre-wrap overflow-x-auto">{result}</pre>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">🔧 Import Information</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Import path: @/services/v2/orderService</li>
            <li>Export type: default export</li>
            <li>Class name: OrderService</li>
            <li>Method: updateOrderStatus</li>
          </ul>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold mb-2">🚨 Common Issues</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Module caching in browser</li>
            <li>Import path resolution</li>
            <li>Export/import mismatch</li>
            <li>TypeScript compilation errors</li>
            <li>Hot reload issues</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold mb-2">🔄 Troubleshooting Steps</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Check if the method exists in OrderService</li>
          <li>Verify the import path is correct</li>
          <li>Clear browser cache and reload</li>
          <li>Restart the development server</li>
          <li>Check for TypeScript compilation errors</li>
        </ol>
      </div>
    </div>
  );
}
