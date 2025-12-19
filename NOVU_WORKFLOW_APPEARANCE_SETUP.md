# Novu Workflow Appearance Setup Guide

## Overview

To get notifications that look like the example (with purple bell icon, action buttons, etc.), you need to configure your **Novu Workflow** in the Novu Dashboard.

## Step-by-Step Setup

### 1. Configure In-App Notification Template

1. **Go to Novu Dashboard** → Workflows
2. **Select your workflow** (or create a new one)
3. **Click on the "In-App" channel** in the workflow editor

### 2. Add Notification Content

In the In-App Editor, configure:

#### **Title:**
```
{{payload.title}}
```

#### **Body/Message:**
```
{{payload.body}}
```

#### **Icon:**
- Use a bell icon or custom icon
- Set color to purple: `#8b5cf6` or `#7c3aed`

### 3. Add Action Buttons

In the In-App Editor, add action buttons:

#### **Primary Action Button:**
- **Label:** `{{payload.primaryAction}}` or "Primary action"
- **Action Type:** Button
- **Style:** 
  - Background: Purple (`#8b5cf6`)
  - Text Color: White
  - Border Radius: 6px

#### **Secondary Action Button:**
- **Label:** `{{payload.secondaryAction}}` or "Secondary action"
- **Action Type:** Button
- **Style:**
  - Background: Transparent
  - Text Color: Gray (`#6b7280`)
  - Border: 1px solid gray (`#d1d5db`)
  - Border Radius: 6px

### 4. Configure Redirect URL (Optional)

In the In-App Editor:
- **Redirect URL:** `{{payload.url}}` or your custom URL
- This is where users go when clicking the notification

### 5. Add Data Object (For Filtering)

In the Developers section:
- **Data object:** Add `type` property
- This is used for tab filtering (approval/appointment)

## Sending Notifications with Buttons

When sending notifications, include action buttons in the payload:

```javascript
await fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscriberId: 'IN003',
    title: 'Test Notification',
    body: 'This is a test notification!',
    payload: {
      type: 'appointment',  // For tab filtering
      primaryAction: 'Primary action',  // Button label
      secondaryAction: 'Secondary action',  // Button label
      url: '/tasks/123'  // Redirect URL (optional)
    }
  })
});
```

## Workflow Template Example

Your Novu workflow In-App template should look like:

```
┌─────────────────────────────────┐
│ 🔔 Test Notification            │  ← Icon + Title
│                                 │
│ This is a test notification!   │  ← Body
│                                 │
│ [Primary action] [Secondary]   │  ← Action Buttons
│                                 │
│ 59m ago                         │  ← Timestamp
└─────────────────────────────────┘
```

## CSS Styling

I've added custom CSS in `styles/novu-inbox.css` that will:
- ✅ Style the purple bell icon
- ✅ Style action buttons (purple primary, gray secondary)
- ✅ Style tabs with purple active state
- ✅ Add hover effects
- ✅ Style timestamps

The CSS is automatically loaded with the `NovuInbox` component.

## Testing

1. **Configure your workflow** in Novu Dashboard with:
   - Icon (purple bell)
   - Title and body placeholders
   - Action buttons
   - Data object with `type` field

2. **Send a test notification:**
   ```javascript
   fetch('/api/notifications/send', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       subscriberId: 'IN003',
       title: 'Test Notification',
       body: 'This is a test notification!',
       payload: {
         type: 'appointment',
         primaryAction: 'Primary action',
         secondaryAction: 'Secondary action'
       }
     })
   });
   ```

3. **Check the inbox** - should show:
   - Purple bell icon
   - Title and body
   - Two action buttons
   - Timestamp
   - Appears in correct tab

## Notes

- **Icon and buttons** are configured in Novu Dashboard workflow, not in code
- **CSS styling** is handled by `styles/novu-inbox.css`
- **Tab filtering** works based on `type` in payload
- **Action buttons** need to be configured in the workflow template

