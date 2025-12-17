import { Novu } from '@novu/api';

/**
 * Test endpoint to send notification to IN003
 * 
 * GET /api/notifications/test
 * 
 * This endpoint sends a test notification to subscriber IN003
 * No authentication required - for testing purposes only
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get Novu secret key
    const novuSecretKey = process.env.NOVU_SECRET_KEY || process.env.NEXT_PUBLIC_NOVU_SECRET_KEY;
    if (!novuSecretKey) {
      console.error('❌ NOVU_SECRET_KEY not configured');
      return res.status(500).json({
        error: 'Novu secret key not configured',
        message: 'Please set NOVU_SECRET_KEY in your environment variables'
      });
    }

    // Initialize Novu client
    const novu = new Novu({
      secretKey: novuSecretKey,
    });

    // Test subscriber ID
    const testSubscriberId = 'IN003';
    
    // First, ensure subscriber exists with email
    try {
      await novu.subscribers.identify(testSubscriberId, {
        email: 'mounika@elbrit.org',
        firstName: 'Mounika',
        lastName: 'Elbrit'
      });
      console.log('✅ Subscriber identified/created:', testSubscriberId);
    } catch (subError) {
      console.warn('⚠️ Subscriber identification issue (may already exist):', subError.message);
    }

    // Send test notification
    const result = await novu.trigger('default', {
      to: {
        subscriberId: String(testSubscriberId) // Ensure it's a string
      },
      payload: {
        title: 'Order Shipped',
        body: 'Your order has been shipped!'
      }
    });

    console.log('✅ Test notification sent successfully:', {
      subscriberId: testSubscriberId,
      email: 'mounika@elbrit.org',
      transactionId: result.data?.transactionId
    });

    return res.status(200).json({
      success: true,
      message: 'Test notification sent successfully',
      subscriberId: testSubscriberId,
      email: 'mounika@elbrit.org',
      transactionId: result.data?.transactionId,
      title: 'Order Shipped',
      body: 'Your order has been shipped!'
    });

  } catch (error) {
    console.error('❌ Error sending test notification:', error);
    
    // Handle specific Novu API errors
    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'Failed to send test notification',
        details: error.response.data,
        message: error.message
      });
    }

    return res.status(500).json({
      error: 'Failed to send test notification',
      message: error.message
    });
  }
}

