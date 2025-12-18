# Fix: Inbox Not Showing Real Notifications (Keyless Mode)

## Problem

The Novu Inbox is showing "Novu Keyless Environment" demo notifications instead of your real push notifications.

## Root Cause

The **Keyless** toggle is **enabled** in Plasmic Studio settings for the NovuInbox component.

## Solution

### Step 1: Disable Keyless Mode in Plasmic

1. **Select the Novu Inbox component** in Plasmic Studio
2. **Open the Settings panel** (right sidebar)
3. **Find "Novu Inbox props" section**
4. **Toggle "Keyless" to OFF** (should be gray/unselected, not blue)
5. **Save/Publish your changes**

### Step 2: Verify Settings

After disabling keyless mode, verify these settings:

- ✅ **Keyless**: `OFF` (disabled)
- ✅ **Application identifier**: `sCfOsfXhHZNc` (or your app ID)
- ✅ **Subscriber ID**: `IN003` (or leave empty to use employeeId from auth)

### Step 3: Test

After disabling keyless mode:

1. **Reload your page**
2. **Send a test notification:**
   ```javascript
   fetch('/api/notifications/send', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       subscriberId: 'IN003',
       title: 'Test Notification',
       body: 'This should appear in inbox now!'
     })
   });
   ```
3. **Check the inbox** - should show your real notification, not demo

## What Keyless Mode Does

**Keyless Mode (ON):**
- ❌ Shows demo notifications only
- ❌ Not connected to your Novu account
- ❌ Won't show your real push notifications
- ✅ Useful for testing UI only

**Keyless Mode (OFF):**
- ✅ Shows real notifications from your Novu account
- ✅ Connected to your subscriber (IN003)
- ✅ Displays actual push notifications in inbox
- ✅ Production-ready

## Quick Fix

**In Plasmic Studio:**
1. Select Novu Inbox component
2. Settings panel → "Novu Inbox props"
3. **Turn OFF "Keyless" toggle**
4. Save

**Result:**
- Inbox will connect to your real Novu account
- Will show actual notifications sent to subscriber IN003
- Push notifications will appear in inbox

## Summary

**The issue:** Keyless mode is enabled → Shows demo notifications  
**The fix:** Disable keyless mode in Plasmic → Shows real notifications

After disabling keyless mode, your push notifications will appear in the inbox!

