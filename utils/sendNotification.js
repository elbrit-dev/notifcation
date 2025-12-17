export async function sendNotification({ subscriberId, title, body, workflowId, payload }) {
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
    throw new Error(data.error || 'Failed to send notification');
  }

  return data;
}

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

