# Push Notifications in Inbox - Setup Guide

## Overview

To see push notification content in the inbox, your Novu workflow must have **both channels** configured:
1. **In-App Channel** - Displays notifications in the inbox
2. **Push Channel** - Sends browser/system push notifications via OneSignal

Both channels will show the **same content** (title and body) from your notification.

## Step-by-Step Setup

### 1. Configure Novu Workflow

Go to your Novu Dashboard: https://web.novu.co/workflows

#### Create/Edit Your Workflow:

1. **Create or edit the "default" workflow** (or your custom workflow)

2. **Add In-App Channel:**
   - Click "Add Step" → Select "In-App"
   - Configure:
     - **Title**: `{{title}}`
     - **Content**: `{{body}}`
   - This makes notifications appear in the inbox

3. **Add Push Channel:**
   - Click "Add Step" → Select "Push"
   - Configure:
     - **Provider**: OneSignal
     - **Title**: `{{title}}`
     - **Body**: `{{body}}`
   - This sends browser/system push notifications

4. **Save the workflow**

### 2. Verify Both Channels Are Active

Your workflow should look like this:

```
┌─────────────────┐
│ Workflow Trigger│
└────────┬────────┘
         │
         ├───► In-App Step (for inbox)
         │     Title: {{title}}
         │     Content: {{body}}
         │
         └───► Push Step (for browser notifications)
               Provider: OneSignal
               Title: {{title}}
               Body: {{body}}
```

### 3. Test the Setup

Send a test notification:

```javascript
fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscriberId: 'IN003',
    title: 'Test Notification',
    body: 'This should appear in both inbox and as push notification!'
  })
});
```

**Expected Results:**
- ✅ Push notification appears as browser/system notification
- ✅ Same notification appears in the Novu Inbox
- ✅ Both show the same title and body

## What Content Appears

### In the Inbox:
- **Title**: From `title` field
- **Body**: From `body` field
- **Timestamp**: When notification was sent
- **Read/Unread**: Status indicator

### As Push Notification:
- **Title**: Same `title` field
- **Body**: Same `body` field
- **Icon**: Your app icon
- **Click Action**: Opens your app (can be configured)

## Current Notification API

Your current API already sends to both channels (if workflow is configured correctly):

```javascript
// pages/api/notifications/send.js
const result = await novu.trigger(workflowIdentifier, {
  to: {
    subscriberId: String(subscriberId)
  },
  payload: {
    title: String(title),    // Used by both In-App and Push
    body: String(body),      // Used by both In-App and Push
    ...(payload || {})
  }
});
```

## Troubleshooting

### Push notifications work but don't appear in inbox?

**Problem**: Workflow only has Push channel, missing In-App channel

**Solution**: 
1. Go to Novu Dashboard → Workflows
2. Edit your workflow
3. Add In-App channel step
4. Configure with `{{title}}` and `{{body}}`
5. Save

### Notifications appear in inbox but no push notifications?

**Problem**: Workflow only has In-App channel, missing Push channel

**Solution**:
1. Go to Novu Dashboard → Workflows
2. Edit your workflow
3. Add Push channel step
4. Select OneSignal as provider
5. Configure with `{{title}}` and `{{body}}`
6. Save

### Neither appears?

**Check:**
1. ✅ Subscriber exists in Novu (subscriberId matches employeeId)
2. ✅ Subscriber has OneSignal credentials (for push)
3. ✅ Workflow has both channels configured
4. ✅ Browser notification permission is granted
5. ✅ User is logged in (for inbox)

## Verification Checklist

- [ ] Workflow has **In-App** channel configured
- [ ] Workflow has **Push** channel configured
- [ ] Both channels use `{{title}}` and `{{body}}`
- [ ] Push channel uses OneSignal provider
- [ ] Subscriber has OneSignal credentials in Novu
- [ ] Browser notification permission is granted
- [ ] Test notification sent successfully
- [ ] Notification appears in inbox
- [ ] Push notification received

## Example: Complete Workflow Configuration

### In-App Channel Settings:
```
Title: {{title}}
Content: {{body}}
```

### Push Channel Settings:
```
Provider: OneSignal
Title: {{title}}
Body: {{body}}
```

### Notification Payload:
```javascript
{
  subscriberId: 'IN003',
  title: 'Order Shipped',
  body: 'Your order #12345 has been shipped!',
  payload: {
    orderId: '12345',
    url: '/orders/12345'
  }
}
```

### Result:
- ✅ Push notification: "Order Shipped - Your order #12345 has been shipped!"
- ✅ Inbox notification: Same content appears in Novu Inbox widget

## Summary

**To see push notifications in the inbox:**
1. Configure workflow with **both** In-App and Push channels
2. Both channels use the same `{{title}}` and `{{body}}` variables
3. Send notifications using the existing API
4. Notifications will appear in both places with the same content

The content shown in the inbox is **exactly the same** as the push notification content - both use the `title` and `body` from your notification payload.

