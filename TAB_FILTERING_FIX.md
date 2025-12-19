



# Fix: Notifications Not Showing in Tabs

## Problem
Notifications appear in "All" tab but not in "Approval" or "Appointment" tabs.

## Solution

The filter has been updated to use **data attributes** instead of tags. Now you need to ensure notifications are sent with the correct data.

### **Method 1: Using Data Payload (Current Setup)**

When sending notifications, include `type` in the payload:

```javascript
// Appointment notification
await fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscriberId: 'IN003',
    title: 'New Appointment',
    body: 'You have an appointment scheduled',
    payload: {
      type: 'appointment'  // ✅ This makes it appear in Appointment tab
    }
  })
});

// Approval notification
await fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscriberId: 'IN003',
    title: 'Approval Required',
    body: 'Please approve this request',
    payload: {
      type: 'approval'  // ✅ This makes it appear in Approval tab
    }
  })
});
```

### **Method 2: Using Workflow Tags (Alternative)**

If you prefer to use workflow tags instead:

1. **In Novu Dashboard:**
   - Go to your workflow
   - Add tags: `"appointment"` or `"approval"` to the workflow
   - Save the workflow

2. **Update the filter in `NovuInbox.js`:**
   Change from:
   ```javascript
   data: { type: 'appointment' }
   ```
   To:
   ```javascript
   tags: ['appointment']
   ```

## Current Filter Configuration

**Approval Tab:**
- Filters by: `data: { type: 'approval' }`

**Appointment Tab:**
- Filters by: `data: { type: 'appointment' }`

## Testing

1. **Send a test notification with type:**
   ```javascript
   fetch('/api/notifications/send', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       subscriberId: 'IN003',
       title: 'Test Appointment',
       body: 'This should appear in Appointment tab',
       payload: {
         type: 'appointment'
       }
     })
   });
   ```

2. **Check the inbox:**
   - Should appear in "All" tab
   - Should appear in "Appointment" tab
   - Should NOT appear in "Approval" tab

## If Still Not Working

If notifications still don't show in tabs:

1. **Check existing notifications:**
   - They might not have `type: 'appointment'` or `type: 'approval'` in payload
   - Only NEW notifications sent with the type will be filtered

2. **Try both filter methods:**
   - We can update the component to support both `tags` and `data` filters
   - Or switch back to `tags: ['appointment']` if you're using workflow tags

3. **Verify in Novu Dashboard:**
   - Check if your workflow has the tags set
   - Check if notifications have the correct payload data

