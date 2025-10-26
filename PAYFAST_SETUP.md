# Payfast Integration Setup

This guide will help you set up Payfast sandbox integration for your e-commerce application.

## 1. Environment Variables

Create a `.env.local` file in your frontend directory with the following variables:

```env
# Payfast Configuration
NEXT_PUBLIC_PAYFAST_MERCHANT_ID=your_merchant_id_here
NEXT_PUBLIC_PAYFAST_MERCHANT_KEY=your_merchant_key_here
NEXT_PUBLIC_PAYFAST_PASSPHRASE=your_passphrase_here
NEXT_PUBLIC_PAYFAST_SANDBOX=true

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://your-api-server.com/api/v2
```

## 2. Getting Payfast Sandbox Credentials

1. Visit [Payfast Sandbox](https://sandbox.payfast.co.za/)
2. Create a sandbox account
3. Get your merchant credentials:
   - Merchant ID
   - Merchant Key
   - Passphrase (if you set one)

## 3. Payment Flow

The integration follows this flow:

1. **Checkout Page**: User selects Payfast as payment method
2. **Payment Page**: User clicks "Pay with Payfast"
3. **Payfast Redirect**: User is redirected to Payfast for payment
4. **Return URLs**:
   - **Success**: `/checkout/payment/success?orderId=ORDER_ID`
   - **Cancel**: `/checkout/payment/cancel?orderId=ORDER_ID`
   - **Notify**: `/api/payfast/notify` (server-to-server)

## 4. Files Created/Modified

### New Files:
- `src/services/v2/payfastService.ts` - Payfast integration service
- `src/app/api/payfast/notify/route.ts` - Payfast notification handler
- `src/app/checkout/payment/success/page.tsx` - Payment success page
- `src/app/checkout/payment/cancel/page.tsx` - Payment cancellation page

### Modified Files:
- `src/app/checkout/payment/page.tsx` - Updated to use Payfast
- `src/services/v2/orderService.ts` - Added Payfast data support

## 5. Testing

### Test Cards (Sandbox):
- **Visa**: 4000000000000002
- **Mastercard**: 5200000000000007
- **American Express**: 370000000000002

### Test Scenarios:
1. **Successful Payment**: Use any valid test card
2. **Failed Payment**: Use card number 4000000000000119
3. **Cancelled Payment**: Click cancel on Payfast page

## 6. Production Setup

For production:

1. Change `NEXT_PUBLIC_PAYFAST_SANDBOX=false`
2. Use your live Payfast credentials
3. Update the base URL in `payfastService.ts` to production Payfast URL
4. Ensure your notify URL is accessible from Payfast servers

## 7. Security Notes

- Never expose your passphrase in client-side code
- Validate all Payfast notifications on your server
- Use HTTPS in production
- Implement proper signature validation

## 8. Amount Requirements

Payfast has specific requirements for payment amounts:

- **Minimum amount**: R1.00 (1.00 ZAR)
- **Format**: Must be a valid decimal number with 2 decimal places
- **Example**: `"25.99"` (string format)
- **Validation**: System automatically validates and formats amounts

## 9. Phone Number Format

The system automatically formats South African phone numbers for Payfast:

- **Input formats accepted**:
  - `082 123 4567` (local format)
  - `+27 82 123 4567` (international format)
  - `27821234567` (digits only)

- **Output format**: `+27821234567` (Payfast required format)

- **Optional field**: Phone number is optional for payments

## 10. Troubleshooting

### Common Issues:

1. **"Configuration is incomplete"**: Check your environment variables
2. **"Invalid signature"**: Verify your passphrase and merchant credentials
3. **"Order not found"**: Ensure the order ID is valid and exists
4. **"Cell number format is invalid"**: Phone number will be automatically formatted or omitted if invalid
5. **"Amount must be a valid payment amount"**: Ensure cart total is properly calculated and >= R1.00
6. **"Order amount must be at least R1.00"**: Minimum amount validation failed
7. **"Generated signature does not match submitted signature"**: Check your passphrase and merchant credentials

### Debug Mode:
Enable console logging by checking the browser's developer tools for detailed error messages.

### Signature Debugging:
If you're getting signature errors, use these debugging tools:

1. **Environment Variables Check**: Visit `/debug-payfast` to verify your configuration
2. **Signature Test Page**: Visit `/test-payfast` to test signature generation
3. **Browser Console**: Check for detailed signature generation logs

Console logs to look for:
- `Filtered data for signature:` - Shows the data being used for signature
- `Query string:` - Shows the formatted query string
- `String to sign:` - Shows the final string being hashed
- `Generated signature:` - Shows the MD5 hash result
- `Final payment data:` - Shows the complete data being sent to Payfast

Common signature issues:
- **Wrong passphrase**: Ensure your passphrase matches exactly (case-sensitive)
- **Missing passphrase**: Some Payfast accounts require a passphrase
- **URL encoding**: The system automatically handles URL encoding
- **Parameter order**: Parameters are automatically sorted alphabetically
- **Environment variables**: Ensure all variables are properly set and accessible

## 11. Support

For Payfast-specific issues, refer to:
- [Payfast Documentation](https://developers.payfast.co.za/)
- [Payfast Support](https://www.payfast.co.za/support/)
