# Fix Novu Inbox 400 Bad Request Error

## Problem

You're seeing this error in the console:
```
POST https://api.novu.co/v1/inbox/session 400 (Bad Request)
```

## Root Cause

The Novu Inbox is trying to initialize a session for a subscriber that **doesn't exist** in your Novu account yet.

## Solution

### Step 1: Create the Subscriber in Novu

Before the inbox can work, the subscriber must exist in Novu. Use one of these methods:

#### Option A: Use the API Endpoint (Recommended)

Open your browser console on your live site and run:

```javascript
fetch('/api/novu/create-subscriber', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscriberId: 'IN003',  // Your employee ID
    email: 'mounika@elbrit.org',
    displayName: 'mounika M',
    oneSignalSubscriptionId: '85eacb69-525c-41c5-8c24-1d59a64e7b90',
    externalId: 'mounika@elbrit.org',
    oneSignalId: 'c4ec3fc2-e56c-45e4-a0b5-80de63a2e6d5'
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ Subscriber created:', data);
  // Reload page to initialize inbox
  setTimeout(() => window.location.reload(), 1000);
});
```

#### Option B: Create via Novu Dashboard

1. Go to https://web.novu.co/subscribers
2. Click "Create Subscriber"
3. Enter:
   - **Subscriber ID**: `IN003` (must match your employeeId)
   - **Email**: `mounika@elbrit.org`
   - **First Name**: `mounika`
   - **Last Name**: `M`
4. Save

Then update OneSignal credentials:
1. Click on the subscriber
2. Go to "Credentials" tab
3. Add OneSignal device token: `85eacb69-525c-41c5-8c24-1d59a64e7b90`

### Step 2: Verify Subscriber Exists

Check in Novu Dashboard:
1. Go to https://web.novu.co/subscribers
2. Search for subscriber ID: `IN003`
3. Verify it exists and has OneSignal credentials

### Step 3: Reload the Page

After creating the subscriber, reload your app page. The inbox should now initialize without the 400 error.

## Verification

After creating the subscriber, check the browser console. You should see:

```
✅ OneSignal initialized and exposed to window
📬 Novu Inbox initializing with: { subscriberId: 'IN003', ... }
```

Instead of:
```
❌ POST https://api.novu.co/v1/inbox/session 400 (Bad Request)
```

## Common Issues

### Issue 1: Subscriber ID Mismatch

**Problem**: The subscriber ID in Novu doesn't match the employeeId

**Solution**: 
- Check what `employeeId` is stored in localStorage: `localStorage.getItem('employeeId')`
- Make sure the subscriber in Novu uses the exact same ID

### Issue 2: Subscriber Created But Still Getting 400

**Problem**: Subscriber exists but inbox still fails

**Solution**:
1. Check the subscriber object format in console logs
2. Verify `NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER` is set correctly
3. Clear browser cache and reload
4. Check Novu dashboard for any errors

### Issue 3: Application Identifier Not Set

**Problem**: Missing or incorrect application identifier

**Solution**:
1. Get your Application Identifier from: https://web.novu.co/settings/environments
2. Set it in your environment variables: `NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER=your_id_here`
3. Redeploy your app

## Quick Test Script

Run this in your browser console to test everything:

```javascript
(async function testNovuSetup() {
  console.log('🧪 Testing Novu Setup...');
  
  // Check subscriber ID
  const employeeId = localStorage.getItem('employeeId');
  console.log('📋 Employee ID:', employeeId);
  
  // Check app identifier
  const appId = process.env.NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER;
  console.log('📋 App Identifier:', appId || '❌ NOT SET');
  
  // Try to create subscriber if needed
  if (employeeId) {
    console.log('💡 To create subscriber, run:');
    console.log(`
fetch('/api/novu/create-subscriber', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscriberId: '${employeeId}',
    email: 'your-email@example.com',
    displayName: 'Your Name'
  })
})
.then(res => res.json())
.then(data => console.log('✅', data));
    `);
  }
})();
```

## Summary

**The 400 error means:**
- ❌ Subscriber doesn't exist in Novu
- ❌ Subscriber ID mismatch
- ❌ Application identifier incorrect

**To fix:**
1. ✅ Create subscriber using `/api/novu/create-subscriber` endpoint
2. ✅ Verify subscriber exists in Novu dashboard
3. ✅ Ensure subscriber ID matches employeeId
4. ✅ Reload the page

After creating the subscriber, the inbox will initialize successfully and you'll see notifications!

