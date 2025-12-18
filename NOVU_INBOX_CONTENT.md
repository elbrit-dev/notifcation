# Novu Inbox Content Guide

## What Content is Shown in the Inbox?

The Novu Inbox displays **In-App notifications** that are sent through your Novu workflow. Here's what appears:

### 1. **Notification Title** (`title`)
- The main heading of the notification
- Example: "New Message", "Order Update", "Task Assigned"

### 2. **Notification Body/Message** (`body`)
- The main content/description of the notification
- Example: "You have a new message from John", "Your order #12345 has been shipped"

### 3. **Timestamp**
- When the notification was sent/received
- Automatically displayed by Novu Inbox

### 4. **Read/Unread Status**
- Visual indicator showing if notification has been read
- Unread notifications typically appear with a badge or different styling

### 5. **Additional Payload Data** (if configured in workflow)
- Custom data passed in the `payload` object
- Can include:
  - URLs for navigation
  - Custom fields (orderId, messageId, etc.)
  - Action buttons (if configured in workflow)

## How Notifications Are Sent

When you send a notification using the API:

```javascript
fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscriberId: 'IN003',           // Employee ID
    title: 'New Message',             // ✅ Shown in inbox
    body: 'You have a new message',  // ✅ Shown in inbox
    payload: {                        // Optional: Used by workflow
      messageId: '123',
      url: '/messages/123',
      customField: 'value'
    }
  })
});
```

## What Gets Displayed

### In the Inbox Widget:
1. **Title**: The `title` field from your notification
2. **Body/Message**: The `body` field from your notification
3. **Time**: Automatically added by Novu
4. **Status**: Read/Unread indicator

### Example Notification in Inbox:
```
┌─────────────────────────────────────┐
│ 🔔 New Message             10:30 AM │
│                                     │
│ You have a new message from John   │
│                                     │
│ [Unread badge]                      │
└─────────────────────────────────────┘
```

## Workflow Configuration

For notifications to appear in the inbox, your Novu workflow must have:

1. **In-App Channel** configured
   - This is what displays notifications in the inbox
   - Uses the `title` and `body` from your payload

2. **Push Channel** (optional)
   - Sends browser/system push notifications
   - Also uses `title` and `body`

### Workflow Template Variables:
In your Novu workflow, you can use:
- `{{title}}` - The notification title
- `{{body}}` - The notification body/message
- `{{payload.customField}}` - Any custom field from payload

## Notification Structure

```javascript
{
  // Required fields (shown in inbox)
  subscriberId: 'IN003',        // Who receives it
  title: 'Notification Title',  // ✅ Displayed in inbox
  body: 'Notification message', // ✅ Displayed in inbox
  
  // Optional fields
  workflowId: 'default',        // Which workflow to use
  payload: {                    // Additional data
    url: '/path/to/resource',   // Can be used for navigation
    orderId: '12345',           // Custom data
    status: 'shipped'           // Custom data
  }
}
```

## What the Inbox Shows

### Default Inbox Display:
- **List of notifications** (newest first)
- **Title** of each notification
- **Body/Message** preview
- **Timestamp** (relative: "2 minutes ago", "1 hour ago")
- **Read/Unread status**
- **Empty state**: "Quiet for now. Check back later." (when no notifications)

### Notification Details:
When you click on a notification, you can see:
- Full message content
- Timestamp
- Any action buttons (if configured in workflow)
- Link to related resource (if URL provided in payload)

## Customization

The Novu Inbox component can be customized with:

```jsx
<NovuInbox
  className="custom-inbox"
  style={{ width: '400px', height: '600px' }}
  // Additional props passed to Novu's Inbox component
/>
```

## Important Notes

1. **Only In-App notifications appear in inbox**
   - Push notifications appear as browser/system notifications
   - Both use the same `title` and `body`

2. **Subscriber ID must match**
   - The `subscriberId` in the notification must match the logged-in user's `employeeId`
   - This is how Novu knows which notifications to show

3. **Workflow must have In-App channel**
   - Without the In-App channel, notifications won't appear in the inbox
   - They'll only be sent as push notifications (if Push channel is configured)

4. **Real-time updates**
   - The inbox updates in real-time when new notifications arrive
   - Uses WebSocket connection to Novu

## Example: Complete Notification Flow

```javascript
// 1. Send notification
await fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscriberId: 'IN003',
    title: 'Order Shipped',
    body: 'Your order #12345 has been shipped!',
    payload: {
      orderId: '12345',
      trackingNumber: 'TRACK123',
      url: '/orders/12345'
    }
  })
});

// 2. What appears in inbox:
//    Title: "Order Shipped"
//    Body: "Your order #12345 has been shipped!"
//    Time: "Just now"
//    Status: Unread
```

## Summary

**The inbox shows:**
- ✅ Notification title
- ✅ Notification body/message
- ✅ Timestamp
- ✅ Read/unread status
- ✅ List of all notifications for the user

**The inbox does NOT show:**
- ❌ Push notification delivery status
- ❌ Workflow execution details
- ❌ Raw payload data (unless configured in workflow template)

