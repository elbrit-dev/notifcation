import { Novu } from '@novu/api';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subscriberId, title, body, workflowId, payload } = req.body;

    if (!subscriberId || !title || !body) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['subscriberId', 'title', 'body']
      });
    }

    const novuSecretKey = process.env.NOVU_SECRET_KEY || process.env.NEXT_PUBLIC_NOVU_SECRET_KEY;
    if (!novuSecretKey) {
      return res.status(500).json({
        error: 'Novu secret key not configured'
      });
    }

    const novu = new Novu({
      secretKey: novuSecretKey,
    });

    const workflowIdentifier = workflowId || 'default';
    
    const result = await novu.trigger(workflowIdentifier, {
      to: {
        subscriberId: String(subscriberId)
      },
      payload: {
        title: String(title),
        body: String(body),
        ...(payload || {})
      }
    });

    return res.status(200).json({
      success: true,
      transactionId: result.data?.transactionId
    });

  } catch (error) {
    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'Failed to send notification',
        details: error.response.data
      });
    }

    return res.status(500).json({
      error: 'Failed to send notification'
    });
  }
}

