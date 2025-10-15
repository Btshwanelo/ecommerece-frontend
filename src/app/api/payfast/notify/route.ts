import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/services/v2';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const payfastData = Object.fromEntries(formData.entries());
    
    console.log('Payfast notify received:', payfastData);

    // Validate the signature (you should implement proper signature validation)
    const orderId = payfastData.m_payment_id as string;
    const paymentStatus = payfastData.payment_status as string;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }

    // Update order status based on payment result
    let orderStatus = 'pending';
    let paymentMethod = 'payfast';

    if (paymentStatus === 'COMPLETE') {
      orderStatus = 'paid';
    } else if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
      orderStatus = 'failed';
    }

    // Update the order in your backend
    try {
      const updateResponse = await OrderService.completeCheckout({
        orderId,
        paymentMethod,
        paymentStatus: orderStatus,
        payfastData,
      });

      if (updateResponse.success) {
        console.log('Order updated successfully:', orderId, orderStatus);
        return NextResponse.text('OK');
      } else {
        console.error('Failed to update order:', updateResponse.error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
      }
    } catch (error: any) {
      console.error('Error updating order:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Payfast notify error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  // Handle GET requests (some payment gateways send GET for notifications)
  return POST(request);
}


