/**
 * Utility function to send push notifications via Novu
 * 
 * This function sends notifications that will:
 * 1. Be delivered as push notifications via OneSignal
 * 2. Appear in the Novu Inbox component
 * 
 * @param {Object} options - Notification options
 * @param {string} options.subscriberId - Employee ID or subscriber ID (required)
 * @param {string} options.title - Notification title (required)
 * @param {string} options.body - Notification message (required)
 * @param {string} options.workflowId - Optional: Novu workflow identifier
 * @param {Object} options.payload - Optional: Additional data to pass with notification
 * 
 * @returns {Promise<Object>} Response with success status and transaction ID
 * 
 * @example
 * // Send a simple notification
 * await sendNotification({
 *   subscriberId: 'IN002',
 *   title: 'New Message',
 *   body: 'You have a new message from John'
 * });
 * 
 * @example
 * // Send notification with custom payload
 * await sendNotification({
 *   subscriberId: 'IN002',
 *   title: 'Order Update',
 *   body: 'Your order #12345 has been shipped',
 *   payload: {
 *     orderId: '12345',
 *     status: 'shipped',
 *     url: '/orders/12345'
 *   }
 * });
 */
export async function sendNotification({ subscriberId, title, body, workflowId, payload }) {
  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriberId,
        title,
        body,
        workflowId,
        payload
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Failed to send notification');
    }

    return data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

/**
 * Send notification to multiple subscribers
 * 
 * @param {Object} options - Notification options
 * @param {string[]} options.subscriberIds - Array of subscriber IDs
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification message
 * @param {string} options.workflowId - Optional: Novu workflow identifier
 * @param {Object} options.payload - Optional: Additional data
 * 
 * @returns {Promise<Object[]>} Array of results for each subscriber
 */
export async function sendNotificationToMultiple({ subscriberIds, title, body, workflowId, payload }) {
  const results = await Promise.allSettled(
    subscriberIds.map(subscriberId =>
      sendNotification({ subscriberId, title, body, workflowId, payload })
    )
  );

  return results.map((result, index) => ({
    subscriberId: subscriberIds[index],
    success: result.status === 'fulfilled',
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason : null
  }));
}

