export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subscriberId } = req.query;

    if (!subscriberId) {
      return res.status(400).json({
        error: 'Missing required parameter: subscriberId'
      });
    }

    const novuSecretKey = process.env.NOVU_SECRET_KEY || process.env.NEXT_PUBLIC_NOVU_SECRET_KEY;
    if (!novuSecretKey) {
      return res.status(500).json({
        error: 'Novu secret key not configured'
      });
    }

    // Use REST API directly to fetch notifications
    const headers = {
      Authorization: `ApiKey ${novuSecretKey}`,
      'Content-Type': 'application/json',
    };

    // Fetch notifications using REST API
    const notificationsResponse = await fetch(
      `https://api.novu.co/v1/subscribers/${encodeURIComponent(subscriberId)}/notifications?page=0&limit=1000`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!notificationsResponse.ok) {
      const errorText = await notificationsResponse.text();
      throw new Error(`Failed to fetch notifications: ${notificationsResponse.status} - ${errorText}`);
    }

    const notificationsData = await notificationsResponse.json();
    const notifications = notificationsData.data || [];

    // Count notifications by category
    const counts = {
      all: notifications.length,
      primary: 0,
      secondary: 0,
      unread: 0
    };

    notifications.forEach((notification) => {
      // Count unread
      if (!notification.read) {
        counts.unread++;
      }

      // Check for primary/secondary tags or data attributes
      const tags = notification.tags || [];
      const data = notification.payload?.data || notification.data || {};
      
      // Check if notification has "primary" tag or priority/type in data
      const isPrimary = 
        tags.includes('primary') || 
        tags.includes('Primary') ||
        data.priority === 'primary' ||
        data.type === 'primary' ||
        data.category === 'primary';

      // Check if notification has "secondary" tag or priority/type in data
      const isSecondary = 
        tags.includes('secondary') || 
        tags.includes('Secondary') ||
        data.priority === 'secondary' ||
        data.type === 'secondary' ||
        data.category === 'secondary';

      if (isPrimary) {
        counts.primary++;
      } else if (isSecondary) {
        counts.secondary++;
      } else {
        // If no tag/data specified, you might want to default to secondary
        // Or count as primary. Adjust based on your needs.
        // For now, we'll only count explicitly tagged ones
      }
    });

    return res.status(200).json({
      success: true,
      counts
    });

  } catch (error) {
    console.error('Error fetching notification counts:', error);
    
    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'Failed to fetch notification counts',
        details: error.response.data
      });
    }

    return res.status(500).json({
      error: 'Failed to fetch notification counts',
      message: error.message
    });
  }
}

