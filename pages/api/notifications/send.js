import { Novu } from '@novu/api';

/**
 * API endpoint to send push notifications via Novu
 * 
 * This endpoint sends notifications that will:
 * 1. Be delivered as push notifications via OneSignal
 * 2. Appear in the Novu Inbox component
 * 
 * POST /api/notifications/send
 * 
 * Body:
 * {
 *   subscriberId: string (required) - Employee ID or subscriber ID
 *   title: string (required) - Notification title
 *   body: string (required) - Notification message
 *   workflowId?: string (optional) - Novu workflow identifier (default: uses in-app + push)
 *   payload?: object (optional) - Additional data to pass with notification
 * }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subscriberId, title, body, workflowId, payload } = req.body;

    // Validate required fields
    if (!subscriberId || !title || !body) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['subscriberId', 'title', 'body']
      });
    }

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
      // Use serverURL for EU region if needed
      // serverURL: "https://eu.api.novu.co",
    });

    // Prepare notification payload
    const notificationPayload = {
      title,
      body,
      ...(payload || {})
    };

    // Trigger notification using Novu workflow
    // The workflow should have both In-App and Push channels configured
    // If workflowId is not provided, you need to create a workflow in Novu dashboard
    // and use its identifier here, or use 'default' if you have a default workflow
    
    const workflowIdentifier = workflowId || 'default';
    
    // Novu trigger API format: novu.trigger(workflowId, { to, payload })
    // The 'to' object can include subscriberId and subscriber data
    const triggerPayload = {
      to: {
        subscriberId: String(subscriberId)
      },
      payload: {
        title: String(title),
        body: String(body)
      }
    };
    
    // Add any additional payload data
    if (payload && typeof payload === 'object') {
      triggerPayload.payload = {
        ...triggerPayload.payload,
        ...payload
      };
    }
    
    console.log('📤 Triggering Novu notification:', {
      workflowId: workflowIdentifier,
      subscriberId: String(subscriberId),
      payloadKeys: Object.keys(triggerPayload.payload),
      to: triggerPayload.to
    });
    
    // Correct format: novu.trigger(workflowId, { to, payload })
    const result = await novu.trigger(workflowIdentifier, triggerPayload);

    console.log('✅ Notification sent successfully:', {
      subscriberId,
      notificationId: result.data?.transactionId,
      workflowId: workflowId || 'default'
    });

    return res.status(200).json({
      success: true,
      message: 'Notification sent successfully',
      transactionId: result.data?.transactionId,
      subscriberId,
      title,
      body
    });

  } catch (error) {
    console.error('❌ Error sending notification:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      workflowId: workflowId || 'default',
      subscriberId
    });
    
    // Handle specific Novu API errors
    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'Failed to send notification',
        details: error.response.data,
        message: error.message,
        workflowId: workflowId || 'default'
      });
    }

    return res.status(500).json({
      error: 'Failed to send notification',
      message: error.message,
      details: error.stack
    });
  }
}

