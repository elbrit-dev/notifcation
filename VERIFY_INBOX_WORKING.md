# Verify Inbox is Working

## Quick Test

Since push notifications are working, let's verify the inbox is also displaying them.

### Step 1: Test Notification

Run this in your browser console:

```javascript
(async function testInbox() {
  const employeeId = localStorage.getItem('employeeId') || 'IN003';
  
  console.log('📤 Sending test notification to:', employeeId);
  
  const response = await fetch('/api/notifications/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscriberId: employeeId,
      title: 'Inbox Test',
      body: 'This should appear in both push notification AND inbox!'
    })
  });
  
  const result = await response.json();
  console.log('✅ Notification sent:', result);
  console.log('\n📋 Now check:');
  console.log('1. Push notification appeared? ✅');
  console.log('2. Same notification in inbox widget? 👀');
})();
```

### Step 2: Check the Inbox Widget

After sending the notification, check your Novu Inbox widget:

**✅ Working correctly if you see:**
- Notification appears in the inbox widget
- Shows title: "Inbox Test"
- Shows body: "This should appear in both push notification AND inbox!"
- Has a timestamp (e.g., "Just now")
- Has an unread indicator

**❌ Not working if you see:**
- Inbox shows "Quiet for now. Check back later."
- Inbox is empty
- Only push notification appears, not in inbox

## Why Push Works But Inbox Doesn't

If push notifications work but inbox doesn't show them, your Novu workflow is **missing the In-App channel**.

### Fix: Add In-App Channel to Workflow

1. Go to: https://web.novu.co/workflows
2. Edit your "default" workflow (or the one you're using)
3. **Add In-App Channel:**
   - Click "Add Step" → Select "In-App"
   - Configure:
     - **Title**: `{{title}}`
     - **Content**: `{{body}}`
4. **Save the workflow**

Your workflow should have **both**:
- ✅ **Push Channel** (already working)
- ✅ **In-App Channel** (needed for inbox)

## Verification Checklist

- [ ] Push notifications are working ✅ (you confirmed this)
- [ ] Subscriber exists in Novu (IN003)
- [ ] Workflow has **In-App channel** configured
- [ ] Workflow has **Push channel** configured
- [ ] Both channels use `{{title}}` and `{{body}}`
- [ ] Inbox widget is rendered on the page
- [ ] Subscriber ID matches (IN003)
- [ ] No 400 errors in console

## What You Should See

### Push Notification:
```
🔔 Inbox Test
This should appear in both push notification AND inbox!
```

### Inbox Widget:
```
┌─────────────────────────────────┐
│ 🔔 Inbox Test          Just now │
│                                 │
│ This should appear in both     │
│ push notification AND inbox!    │
│                                 │
│ [● Unread]                      │
└─────────────────────────────────┘
```

## Troubleshooting

### Issue: Push works, inbox empty

**Solution**: Add In-App channel to your workflow (see above)

### Issue: Inbox shows "Quiet for now"

**Possible causes:**
1. Workflow missing In-App channel
2. Subscriber ID mismatch
3. Notifications sent to different subscriber ID

**Check:**
```javascript
// Check subscriber ID
console.log('Subscriber ID:', localStorage.getItem('employeeId'));

// Check if inbox is initialized
// Look for this in console:
// "📬 Novu Inbox initializing with: { subscriberId: 'IN003', ... }"
```

### Issue: Inbox shows error

**Check console for:**
- 400 errors → Subscriber doesn't exist
- 401 errors → Application identifier wrong
- Other errors → Check Novu dashboard

## Summary

**If push notifications work:**
- ✅ Your workflow has Push channel
- ✅ OneSignal is configured correctly
- ✅ Subscriber has credentials

**To make inbox work:**
- ➕ Add In-App channel to the same workflow
- ✅ Use same `{{title}}` and `{{body}}` variables
- ✅ Save workflow
- ✅ Test again

Both channels will show the **same content** - the `title` and `body` from your notification!

