# Notification Tabs Guide

## Overview

The Novu Inbox now supports tabs with notification counts:
- **All Notifications** - Shows all notifications
- **Primary** - Shows notifications tagged as "primary"
- **Secondary** - Shows notifications tagged as "secondary"

## How to Tag Notifications

### Method 1: Using Tags in Workflow (Recommended)

1. **In Novu Dashboard:**
   - Go to your workflow
   - Add tags to the workflow (e.g., "primary" or "secondary")
   - Tags can be added in the workflow settings

2. **When sending notifications:**
   - Notifications from workflows with "primary" tag will appear in Primary tab
   - Notifications from workflows with "secondary" tag will appear in Secondary tab

### Method 2: Using Data Payload

When sending notifications, include `priority` or `type` in the payload data:

```javascript
// Send Primary notification
await fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscriberId: 'IN003',
    title: 'Important Update',
    body: 'This is a primary notification',
    payload: {
      priority: 'primary', // or type: 'primary', category: 'primary'
      // ... other data
    }
  })
});

// Send Secondary notification
await fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscriberId: 'IN003',
    title: 'General Update',
    body: 'This is a secondary notification',
    payload: {
      priority: 'secondary', // or type: 'secondary', category: 'secondary'
      // ... other data
    }
  })
});
```

### Method 3: Update Workflow to Include Tags

In your Novu workflow editor:
1. Select the workflow
2. Go to Settings
3. Add tags: `primary` or `secondary`
4. Save the workflow

## Notification Counts

- Counts are fetched automatically every 30 seconds
- Counts update when you switch tabs
- The count shows the total number of notifications in each category

## Filtering Logic

The tabs filter notifications based on:
1. **Tags**: Workflow tags (e.g., `tags: ['primary']`)
2. **Data attributes**: Payload data (e.g., `data: { priority: 'primary' }`)

Currently configured to check:
- Tags: `'primary'`, `'Primary'`, `'secondary'`, `'Secondary'`
- Data: `priority`, `type`, or `category` fields

## Customization

To change the filtering criteria, edit `components/NovuInbox.js`:

```javascript
const tabs = [
  {
    label: `All Notifications (${notificationCounts.all})`,
    filter: {},
  },
  {
    label: `Primary (${notificationCounts.primary})`,
    filter: {
      tags: ['primary'], // Change this to match your tags
      // OR
      // data: { priority: 'primary' } // Change this to match your data structure
    },
  },
  {
    label: `Secondary (${notificationCounts.secondary})`,
    filter: {
      tags: ['secondary'], // Change this to match your tags
      // OR
      // data: { priority: 'secondary' } // Change this to match your data structure
    },
  },
];
```

## Testing

1. Send a notification with `priority: 'primary'` in payload
2. Check if it appears in the Primary tab
3. Send a notification with `priority: 'secondary'` in payload
4. Check if it appears in the Secondary tab
5. Verify counts update correctly

