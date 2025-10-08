"use client";

import { useState, useEffect } from "react";

export default function DebugOrderServicePage() {
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    const checkOrderService = async () => {
      let info = "=== OrderService Debug Information ===\n\n";
      
      try {
        // Dynamic import to avoid build-time issues
        const { OrderService } = await import("@/services/v2/orderService");
        
        info += "✅ OrderService imported successfully\n";
        info += `✅ OrderService type: ${typeof OrderService}\n`;
        info += `✅ OrderService constructor: ${OrderService.constructor.name}\n\n`;
        
        // Check for updateOrderStatus method
        if (typeof OrderService.updateOrderStatus === 'function') {
          info += "✅ updateOrderStatus method exists\n";
          info += `✅ Method type: ${typeof OrderService.updateOrderStatus}\n`;
          
          // Get method signature
          const methodString = OrderService.updateOrderStatus.toString();
          info += `✅ Method signature: ${methodString.substring(0, 150)}...\n\n`;
        } else {
          info += "❌ updateOrderStatus method NOT FOUND\n\n";
        }
        
        // List all available methods
        info += "📋 All OrderService methods:\n";
        const allMethods = Object.getOwnPropertyNames(OrderService);
        allMethods.forEach(method => {
          const methodType = typeof (OrderService as any)[method];
          info += `  ${methodType === 'function' ? '✅' : '❌'} ${method} (${methodType})\n`;
        });
        
        info += "\n📋 All OrderService prototype methods:\n";
        const prototypeMethods = Object.getOwnPropertyNames(OrderService.prototype);
        prototypeMethods.forEach(method => {
          const methodType = typeof (OrderService.prototype as any)[method];
          info += `  ${methodType === 'function' ? '✅' : '❌'} ${method} (${methodType})\n`;
        });
        
        // Test static methods specifically
        info += "\n🔧 Static methods test:\n";
        const staticMethods = [
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
        
        staticMethods.forEach(method => {
          const exists = typeof (OrderService as any)[method] === 'function';
          info += `  ${exists ? '✅' : '❌'} ${method}\n`;
        });
        
      } catch (error: any) {
        info += `❌ Error importing OrderService: ${error.message}\n`;
        info += `❌ Error stack: ${error.stack}\n`;
      }
      
      setDebugInfo(info);
    };
    
    checkOrderService();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">OrderService Debug Page</h1>
      
      <div className="bg-red-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">🚨 Debugging OrderService Import Issue</h2>
        <p>This page uses dynamic imports to check if the OrderService methods are available at runtime.</p>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Information:</h3>
        <pre className="text-sm whitespace-pre-wrap overflow-x-auto">{debugInfo}</pre>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">🔧 Expected Results</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>OrderService should import successfully</li>
            <li>updateOrderStatus should be a function</li>
            <li>All static methods should be available</li>
            <li>No import errors should occur</li>
          </ul>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold mb-2">🚨 Common Issues</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Module not properly exported</li>
            <li>Import path resolution issues</li>
            <li>TypeScript compilation errors</li>
            <li>Browser caching issues</li>
            <li>Hot reload not working</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold mb-2">🔄 Next Steps</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Check the debug information above</li>
          <li>If method is missing, check the OrderService file</li>
          <li>If import fails, check the file path</li>
          <li>Try hard refresh (Ctrl+F5 or Cmd+Shift+R)</li>
          <li>Restart the development server</li>
        </ol>
      </div>
    </div>
  );
}
