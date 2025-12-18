# Fix: Push Notifications Not Showing in Inbox

## Problem

Push notifications are working, but they're not appearing in the Novu Inbox widget. The inbox shows "Novu Keyless Environment" demo notification instead.

## Root Causes

1. **Inbox in Keyless Mode** - Shows demo notifications, not real ones
2. **Subscriber Not Connected** - Inbox not linked to your subscriber (IN003)
3. **Missing Application Identifier** - Inbox can't connect to your Novu account
4. **User Not Authenticated** - Inbox requires authentication to show notifications

## Solutions

### Solution 1: Check Inbox Component Configuration

Make sure the `NovuInbox` component is NOT in keyless mode:

```jsx
// ❌ WRONG - Shows demo notifications
<NovuInbox keyless={true} />

// ✅ CORRECT - Shows real notifications
<NovuInbox />
// or
<NovuInbox subscriberId="IN003" />
```

### Solution 2: Verify Subscriber Connection

The inbox must be connected to your subscriber. Check in browser console:

```javascript
// Check subscriber ID
console.log('Employee ID:', localStorage.getItem('employeeId'));

// Check if user is authenticated
console.log('User:', JSON.parse(localStorage.getItem('erpnextUser') || '{}'));

// Check application identifier
console.log('App ID:', process.env.NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER);
```

### Solution 3: Ensure Proper Initialization

The inbox needs:
1. ✅ Application Identifier set (`NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER`)
2. ✅ Subscriber ID (employeeId: IN003)
3. ✅ User authenticated
4. ✅ Subscriber exists in Novu

### Solution 4: Verify Workflow Configuration

Your workflow (shown in dashboard) has both channels, but verify the **In-App channel** is configured correctly:

1. Go to: https://web.novu.co/workflows
2. Edit "default" workflow
3. Click on **In-App Step**
4. Verify:
   - **Title**: `{{title}}`
   - **Content**: `{{body}}`
5. Save

## Debugging Steps

### Step 1: Check Console Logs

Look for this in browser console:
```
📬 Novu Inbox initializing with: {
  subscriberId: 'IN003',
  applicationIdentifier: '...',
  subscriber: { ... }
}
```

If you see this, the inbox is properly initialized.

### Step 2: Check for Errors

Look for:
- ❌ `400 Bad Request` → Subscriber doesn't exist
- ❌ `401 Unauthorized` → Application identifier wrong
- ❌ `Please log in` → User not authenticated

### Step 3: Test Notification

Send a test notification and check if it appears:

```javascript
fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscriberId: 'IN003',
    title: 'Test Inbox',
    body: 'This should appear in inbox!'
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ Sent:', data);
  console.log('👀 Check inbox widget now!');
});
```

## Common Issues

### Issue 1: Inbox Shows "Keyless Environment"

**Cause**: Inbox is in keyless mode or not connected to subscriber

**Fix**:
1. Make sure `keyless={false}` or not set (defaults to false)
2. Verify subscriber ID is passed: `subscriberId="IN003"`
3. Check user is authenticated
4. Verify application identifier is set

### Issue 2: Inbox Empty But Push Works

**Cause**: Workflow missing In-App channel OR subscriber ID mismatch

**Fix**:
1. Add In-App channel to workflow (if missing)
2. Verify subscriber ID matches: `IN003`
3. Check notifications are sent to correct subscriber ID

### Issue 3: Inbox Shows "Please log in"

**Cause**: User not authenticated or subscriber ID not found

**Fix**:
1. Make sure user is logged in
2. Check `localStorage.getItem('employeeId')` returns `IN003`
3. Verify `localStorage.getItem('erpnextUser')` exists

## Quick Fix Script

Run this in browser console to verify everything:

```javascript
(async function verifyInboxSetup() {
  console.log('🔍 Verifying Inbox Setup...\n');
  
  // Check subscriber ID
  const employeeId = localStorage.getItem('employeeId');
  console.log('1. Subscriber ID:', employeeId || '❌ NOT FOUND');
  
  // Check authentication
  const user = localStorage.getItem('erpnextUser');
  console.log('2. User authenticated:', user ? '✅' : '❌');
  
  // Check app identifier
  const appId = process.env.NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER;
  console.log('3. App Identifier:', appId || '❌ NOT SET');
  
  // Check if subscriber exists
  if (employeeId) {
    console.log('\n💡 To create/verify subscriber, run:');
    console.log(`
fetch('/api/novu/create-subscriber', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscriberId: '${employeeId}',
    email: 'mounika@elbrit.org',
    displayName: 'mounika M',
    oneSignalSubscriptionId: '85eacb69-525c-41c5-8c24-1d59a64e7b90'
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ Subscriber:', data);
  window.location.reload();
});
    `);
  }
  
  console.log('\n📋 Summary:');
  if (employeeId && user && appId) {
    console.log('✅ All checks passed! Inbox should work.');
    console.log('💡 If inbox still shows keyless mode, check:');
    console.log('   - NovuInbox component has keyless={false}');
    console.log('   - Subscriber exists in Novu dashboard');
  } else {
    console.log('❌ Some checks failed. Fix the issues above.');
  }
})();
```

## Summary

**Why push notifications don't show in inbox:**

1. **Inbox in keyless mode** → Remove `keyless={true}` prop
2. **Subscriber not connected** → Ensure subscriber ID (IN003) is passed
3. **Workflow missing In-App channel** → Add In-App channel to workflow
4. **Subscriber ID mismatch** → Verify notifications sent to same ID as inbox subscriber
5. **User not authenticated** → Make sure user is logged in

**To fix:**
- ✅ Ensure `keyless={false}` (or not set)
- ✅ Pass `subscriberId="IN003"` or ensure employeeId is in localStorage
- ✅ Verify workflow has In-App channel
- ✅ Send notifications to same subscriber ID (IN003)
- ✅ Reload page after creating subscriber

