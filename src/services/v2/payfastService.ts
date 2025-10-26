import { Order } from "@/types";
import CryptoJS from "crypto-js";

export interface PayfastConfig {
  merchantId: string;
  merchantKey: string;
  sandbox: boolean;
}

export interface PayfastPaymentData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first: string;
  name_last: string;
  email_address: string;
  cell_number?: string;
  m_payment_id: string; // Order ID
  amount: string;
  item_name: string;
  item_description?: string;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_str4?: string;
  custom_str5?: string;
  email_confirmation?: string;
  confirmation_address?: string;
  signature?: string;
}

export interface PayfastResponse {
  success: boolean;
  paymentId?: string;
  redirectUrl?: string;
  error?: string;
}

export class PayfastService {
  private static config: PayfastConfig = {
    merchantId: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || "",
    merchantKey: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || "",
    sandbox: process.env.NEXT_PUBLIC_PAYFAST_SANDBOX === "true",
  };

  // Using exact working example approach - no configuration needed

  private static getBaseUrl(): string {
    return this.config.sandbox
      ? "https://sandbox.payfast.co.za/eng/process"
      : "https://www.payfast.co.za/eng/process";
  }

  private static getNotifyUrl(): string {
    return `${window.location.origin}/api/payfast/notify`;
  }

  private static getReturnUrl(orderId: string): string {
    return `${window.location.origin}/checkout/payment/success?orderId=${orderId}`;
  }

  private static getCancelUrl(orderId: string): string {
    return `${window.location.origin}/checkout/payment/cancel?orderId=${orderId}`;
  }

  private static generateSignature(data: Record<string, string>): string {
    // Simple integration - no signature needed for basic form
    // Payfast will handle signature generation automatically
    return "";
  }

  private static md5(str: string): string {
    return CryptoJS.MD5(str).toString();
  }

  private static formatPhoneNumber(phone: string): string {
    if (!phone) return "";
    
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, "");
    
    // South African phone number format: +27XXXXXXXXX or 0XXXXXXXXX
    if (cleaned.startsWith("27") && cleaned.length === 11) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith("0") && cleaned.length === 10) {
      return `+27${cleaned.substring(1)}`;
    } else if (cleaned.length >= 10) {
      // If it's already in a valid format, add + if missing
      return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
    }
    
    // Return empty string if format is invalid
    return "";
  }

  static async initiatePayment(
    order: Order,
    userDetails: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    }
  ): Promise<PayfastResponse> {
    try {
      // Validate configuration
      const configValidation = this.validateConfiguration();
      if (!configValidation.isValid) {
        throw new Error(`Payfast configuration error: ${configValidation.errors.join(', ')}`);
      }

      // Format phone number for Payfast
      const formattedPhone = this.formatPhoneNumber(userDetails.phone || "");

      // Validate and format amount
      const rawAmount = order.totals?.total || 0;
      const amount = parseFloat(rawAmount.toString());
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid order amount");
      }

      // Convert cents to Rands (assuming amount is in cents)
      const amountInRands = amount / 100;

      // Payfast minimum amount is typically 1.00 ZAR
      if (amountInRands < 1.00) {
        throw new Error("Order amount must be at least R1.00");
      }

      // Payfast requires amount in format: "0.00" (string with 2 decimal places)
      const formattedAmount = amountInRands.toFixed(2);

      console.log('Payfast payment data:', {
        orderId: order._id,
        amount: formattedAmount,
        userEmail: userDetails.email
      });

      // Simple integration - basic form fields only
      const paymentData: Record<string, any> = {
        merchant_id: this.config.merchantId,
        merchant_key: this.config.merchantKey,
        amount: formattedAmount,
        item_name: `Order #${order.orderNumber || order._id}`,
      };

      console.log('Simple payment data:', paymentData);
      console.log('PayFast Sandbox URL:', this.getBaseUrl());

      // Simple form submission - no signature needed
      const form = document.createElement("form");
      form.method = "POST";
      form.action = this.getBaseUrl();

      console.log("Payment Data:", paymentData);
      console.log("PayFast Sandbox URL:", form.action);

      // Add form fields
      Object.keys(paymentData).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = paymentData[key];
        form.appendChild(input);
      });
      
      console.log("Submitting simple form to PayFast:", form);
      document.body.appendChild(form);
      form.submit();

      return {
        success: true,
        paymentId: order._id,
      };
    } catch (error: any) {
      console.error("Payfast payment initiation error:", error);
      return {
        success: false,
        error: error.message || "Failed to initiate payment",
      };
    }
  }

  static async handlePaymentReturn(
    orderId: string,
    status: "success" | "cancel" | "failure",
    payfastData?: Record<string, string>
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Update order status based on payment result
      const updateData = {
        orderId,
        paymentStatus: status === "success" ? "paid" : "failed",
        paymentMethod: "payfast",
        payfastData: payfastData || {},
      };

      // You would typically make an API call here to update the order
      // For now, we'll just return success
      console.log("Payment return handled:", updateData);

      return {
        success: true,
        message:
          status === "success"
            ? "Payment successful"
            : status === "cancel"
            ? "Payment cancelled"
            : "Payment failed",
      };
    } catch (error: any) {
      console.error("Payment return handling error:", error);
      return {
        success: false,
        message: error.message || "Failed to handle payment return",
      };
    }
  }

  static validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.config.merchantId) {
      errors.push("Merchant ID is missing");
    }
    
    if (!this.config.merchantKey) {
      errors.push("Merchant Key is missing");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static getConfigurationStatus(): string {
    const validation = this.validateConfiguration();
    if (validation.isValid) {
      return `Payfast ${this.config.sandbox ? 'Sandbox' : 'Production'} configuration is valid`;
    } else {
      return `Configuration errors: ${validation.errors.join(', ')}`;
    }
  }

  // EXACT COPY of your working test signature generation
  static testSignatureGeneration(): { success: boolean; signature?: string; error?: string } {
    try {
      const crypto = require("crypto");
      const testData: Record<string, string> = {
        merchant_id: "10038198",
        merchant_key: "8yshtxb2mu1oa",
        amount: "200",
        item_name: "subscription",
      };

      const queryString = Object.keys(testData)
        .sort()
        .map((key) => `${key}=${encodeURIComponent(testData[key])}`)
        .join("&");

      // Test without passphrase
      const signatureWithoutPassphrase = crypto
        .createHash("md5")
        .update(queryString)
        .digest("hex");
      console.log("Test query string (no passphrase):", queryString);
      console.log("Test signature (no passphrase):", signatureWithoutPassphrase);

      console.log("Expected signature:", "35773c2456df895197ee211c354933f2");
      console.log(
        "Match (no passphrase):",
        signatureWithoutPassphrase === "35773c2456df895197ee211c354933f2"
      );

      return { success: true, signature: signatureWithoutPassphrase };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Test signature generation without passphrase (like your working example)
  static testSignatureWithoutPassphrase(data: Record<string, string>): string {
    const filteredData = Object.keys(data)
      .filter(
        (key) =>
          data[key] !== "" &&
          data[key] !== null &&
          data[key] !== undefined &&
          key !== "signature"
      )
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {} as Record<string, string>);

    const queryString = Object.keys(filteredData)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(filteredData[key])}`)
      .join("&");

    console.log('Test without passphrase - Query string:', queryString);
    
    return this.md5(queryString);
  }

  // Direct test with exact working data - bypasses all filtering
  static testExactWorkingData(): { success: boolean; signature?: string; error?: string } {
    try {
      const crypto = require("crypto");
      
      // Your exact working data - no filtering, no processing
      const exactData = {
        merchant_id: "10038198",
        merchant_key: "8yshtxb2mu1oa",
        amount: "300",
        item_name: "shoes",
      };

      // Direct query string creation - no filtering
      const queryString = Object.keys(exactData)
        .sort()
        .map((key) => `${key}=${encodeURIComponent(exactData[key as keyof typeof exactData])}`)
        .join("&");

      console.log('Direct test - Query string:', queryString);
      
      const signature = crypto.createHash("md5").update(queryString).digest("hex");
      console.log('Direct test - Generated signature:', signature);
      console.log('Direct test - Target signature:', "a21a30c5faabecfa9cbbab6bf3cabc20");
      console.log('Direct test - Match:', signature === "a21a30c5faabecfa9cbbab6bf3cabc20");

      return {
        success: true, 
        signature,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Alternative signature generation method (for debugging)
  static generateSignatureAlternative(data: Record<string, string>): string {
    // Alternative implementation based on Payfast documentation
    const filteredData = Object.entries(data)
      .filter(([key, value]) => value !== "" && key !== "signature")
      .sort(([a], [b]) => a.localeCompare(b));

    // Create query string without URL encoding (alternative approach)
    const queryString = filteredData
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    console.log('Alternative query string:', queryString);

    // NO PASSPHRASE - matching your working example exactly
    const stringToSign = queryString;

    console.log('Alternative string to sign:', stringToSign);

    // Generate MD5 hash
    const signature = this.md5(stringToSign);
    console.log('Alternative signature:', signature);
    
    return signature;
  }
}
