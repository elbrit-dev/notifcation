import { sendNotification, sendNotificationToMultiple } from './sendNotification';

export async function notifyOrderShipped(order) {
  try {
    await sendNotification({
      subscriberId: order.customerEmployeeId,
      title: 'Order Shipped',
      body: `Your order #${order.id} has been shipped! Tracking: ${order.trackingNumber}`,
      payload: {
        orderId: order.id,
        trackingNumber: order.trackingNumber,
        status: 'shipped',
        url: `/orders/${order.id}`
      }
    });
  } catch {
  }
}

export async function notifyNewMessage(recipientEmployeeId, senderName, messagePreview) {
  try {
    await sendNotification({
      subscriberId: recipientEmployeeId,
      title: `New message from ${senderName}`,
      body: messagePreview,
      payload: {
        type: 'message',
        senderName,
        url: '/messages'
      }
    });
  } catch {
  }
}

export async function notifyTaskAssignment(task, assigneeIds) {
  try {
    await sendNotificationToMultiple({
      subscriberIds: assigneeIds,
      title: 'New Task Assigned',
      body: `You have been assigned to: ${task.title}`,
      payload: {
        taskId: task.id,
        taskTitle: task.title,
        priority: task.priority,
        url: `/tasks/${task.id}`
      }
    });
  } catch {
  }
}

export async function notifyApprovalNeeded(approverEmployeeId, itemType, itemId, requesterName) {
  try {
    await sendNotification({
      subscriberId: approverEmployeeId,
      title: 'Approval Required',
      body: `${requesterName} is requesting approval for ${itemType}`,
      payload: {
        type: 'approval',
        itemType,
        itemId,
        requesterName,
        url: `/approvals/${itemId}`
      }
    });
  } catch {
  }
}

export async function notifySystemAlert(employeeId, alertType, message) {
  try {
    await sendNotification({
      subscriberId: employeeId,
      title: `System Alert: ${alertType}`,
      body: message,
      payload: {
        type: 'system',
        alertType,
        timestamp: new Date().toISOString()
      }
    });
  } catch {
  }
}

