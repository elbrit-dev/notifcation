# Push Notification Implementation Guide

Production-ready implementation for sending push notifications using OneSignal and Novu, displayed in the Novu Inbox.

## Overview

The notification flow:
1. **OneSignal** delivers push notifications to devices
2. **Novu** manages workflows and routing
3. **Novu Inbox** displays notifications in your app

## Prerequisites

✅ OneSignal initialized and configured  
✅ Novu account set up  
✅ OneSignal integration connected in Novu  
✅ Subscribers created with OneSignal credentials (automatic on login)

## Environment Variables

Make sure these are set in your `.env.local`:

```env
# Novu Secret Key (server-side only)
NOVU_SECRET_KEY=your_novu_secret_key_here

# Novu Application Identifier (client-side)
NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER=sCfOsfXhHZNc

# Optional: OneSignal Integration Identifier (if you have multiple)
NOVU_INTEGRATION_IDENTIFIER=
```

## How to Send Notifications

### Method 1: Using the API Endpoint

Send a POST request to `/api/notifications/send`:

```javascript
const response = await fetch('/api/notifications/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    subscriberId: 'IN002', // Employee ID
    title: 'New Message',
    body: 'You have a new message from John',
    payload: {
      // Optional: Additional data
      messageId: '123',
      url: '/messages/123'
    }
  })
});

const data = await response.json();
console.log('Notification sent:', data);
```

### Method 2: Using the Utility Function

Import and use the `sendNotification` utility:

```javascript
import { sendNotification } from '@/utils/sendNotification';

// Send a simple notification
await sendNotification({
  subscriberId: 'IN002',
  title: 'Order Update',
  body: 'Your order #12345 has been shipped',
  payload: {
    orderId: '12345',
    status: 'shipped',
    url: '/orders/12345'
  }
});
```

### Method 3: Using the SendNotificationButton Component

Add the button component to your page:

```jsx
import SendNotificationButton from '@/components/SendNotificationButton';

function MyPage() {
  return (
    <div>
      <h1>My Page</h1>
      <SendNotificationButton
        title="Custom Title"
        body="Custom message"
        buttonText="Send Notification"
      />
    </div>
  );
}
```

## Setting Up Novu Workflow

To ensure notifications are sent via OneSignal AND appear in the inbox:

1. **Go to Novu Dashboard** → Workflows
2. **Create a new workflow** (or edit existing)
3. **Add two channels:**
   - **In-App** channel (for inbox display)
   - **Push** channel (for OneSignal delivery)
4. **Configure the Push channel:**
   - Select OneSignal as the provider
   - Set title: `{{title}}`
   - Set body: `{{body}}`
5. **Save the workflow**

### Using Default Workflow

If you don't specify a `workflowId`, the API will use a default workflow. Make sure you have a workflow named "default" with both In-App and Push channels configured.

## Production Usage Examples

### Example 1: Send Notification from API Route

```javascript
// pages/api/orders/[id]/ship.js
import { sendNotification } from '@/utils/sendNotification';

export default async function handler(req, res) {
  // ... your order shipping logic ...
  
  // Send notification to customer
  await sendNotification({
    subscriberId: order.customerEmployeeId,
    title: 'Order Shipped',
    body: `Your order #${order.id} has been shipped!`,
    payload: {
      orderId: order.id,
      trackingNumber: order.trackingNumber,
      url: `/orders/${order.id}`
    }
  });
  
  // ... rest of your logic ...
}
```

### Example 2: Send Notification from Server Action

```javascript
// utils/orderActions.js
import { sendNotification } from './sendNotification';

export async function shipOrder(orderId) {
  // ... ship order logic ...
  
  // Notify customer
  await sendNotification({
    subscriberId: order.customerEmployeeId,
    title: 'Order Shipped',
    body: `Your order #${orderId} is on the way!`,
    payload: {
      orderId,
      status: 'shipped'
    }
  });
}
```

### Example 3: Send to Multiple Users

```javascript
import { sendNotificationToMultiple } from '@/utils/sendNotification';

// Notify all team members
await sendNotificationToMultiple({
  subscriberIds: ['IN001', 'IN002', 'IN003'],
  title: 'New Task Assigned',
  body: 'A new task has been assigned to your team',
  payload: {
    taskId: '123',
    url: '/tasks/123'
  }
});
```

## Notification Payload Structure

The notification payload can include:

```javascript
{
  subscriberId: 'IN002',        // Required: Employee ID
  title: 'Notification Title',  // Required: Notification title
  body: 'Notification message', // Required: Notification body
  workflowId: 'workflow-id',   // Optional: Specific workflow to use
  payload: {                    // Optional: Additional data
    customField: 'value',
    url: '/path/to/resource',
    // Any custom data you want to pass
  }
}
```

## Troubleshooting

### Notifications not appearing in inbox?

1. **Check subscriber ID**: Make sure the `subscriberId` matches the logged-in user's employeeId
2. **Check workflow**: Ensure your workflow has both In-App and Push channels
3. **Check console**: Look for errors in browser console and server logs
4. **Check Novu dashboard**: Verify the notification was triggered in Novu dashboard

### Push notifications not being delivered?

1. **Check OneSignal setup**: Verify OneSignal is initialized and permission is granted
2. **Check credentials**: Ensure subscriber has OneSignal credentials in Novu
3. **Check browser permission**: User must grant notification permission
4. **Check OneSignal dashboard**: Verify the push was sent from OneSignal dashboard

### "No subscriber ID found" error?

- Make sure user is logged in
- Check that `employeeId` is stored in localStorage
- Verify the user has an `employeeId` in their ERPNext profile

## Integration Checklist

1. ✅ Set up Novu workflow with In-App + Push channels
2. ✅ Configure environment variables (`NOVU_SECRET_KEY`, `NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER`)
3. ✅ Integrate `sendNotification()` into your business logic
4. ✅ Ensure subscribers are created on login (already implemented in `auth.js`)
5. ✅ Verify notifications appear in inbox and as push notifications

## Verification

After implementation, verify:
- **Push Notifications**: Appear as browser/system notifications
- **Inbox**: Notifications visible in Novu Inbox component
- **Server Logs**: Check for successful notification sends

For more details, see:
- [Novu Documentation](https://docs.novu.co)
- [OneSignal Documentation](https://documentation.onesignal.com)

