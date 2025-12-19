# Notification & Inbox Settings Summary

## 📋 Current Configuration Status

### ✅ **1. OneSignal Push Notifications**

**Status:** ✅ Configured

**Settings:**
- **OneSignal App ID:** `ae84e191-00f5-445c-8e43-173709b8a553`
- **Initialization:** Global initialization in `pages/_document.js`
- **SDK Version:** OneSignal Web SDK v16
- **Localhost Support:** Enabled (`allowLocalhostAsSecureOrigin: true`)
- **Global Access:** OneSignal exposed to `window.OneSignal`

**Location:** `pages/_document.js` (lines 76-92)

---

### ✅ **2. Novu Integration**

**Status:** ✅ Configured

**Environment Variables Required:**
- `NOVU_SECRET_KEY` - Server-side API key (for sending notifications)
- `NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER` - Client-side app identifier (for Inbox)
- `NOVU_INTEGRATION_IDENTIFIER` - Optional (only if multiple OneSignal integrations)

**Current Static Defaults (Hardcoded):**
- **Application Identifier:** `sCfOsfXhHZNc` (fallback if env var not set)
- **Subscriber ID:** `IN003` (fallback if not authenticated)

**Location:** `components/NovuInbox.js` (lines 65-67, 92)

---

### ✅ **3. Novu Inbox Component**

**Status:** ✅ Configured (No tabs/filters - simple inbox)

**Component:** `components/NovuInbox.js`

**Features:**
- ✅ SSR-safe (returns null during server-side rendering)
- ✅ Client-side only rendering (prevents hydration errors)
- ✅ Static defaults for testing without login
- ✅ Automatic subscriber ID detection from:
  - Props (`subscriberId`)
  - AuthContext user data (`employeeId`)
  - localStorage (`employeeId`)
  - Static fallback (`IN003`)

**Props Available:**
- `applicationIdentifier` - Novu app ID (default: `sCfOsfXhHZNc`)
- `subscriberId` - Subscriber ID (default: `IN003`)
- `userPayload` - User data object (firstName, lastName, email, phone, avatar)
- `backendUrl` - EU region backend URL (optional)
- `socketUrl` - EU region socket URL (optional)
- `className` - CSS classes
- `style` - Inline styles
- `keyless` - Demo mode toggle (default: false)

**Current Configuration:**
- **Application Identifier:** `sCfOsfXhHZNc`
- **Subscriber ID:** `IN003`
- **Keyless Mode:** Should be **OFF** in Plasmic (for real notifications)
- **Tabs/Filters:** ❌ Removed (simple inbox view)

---

### ✅ **4. Subscriber Management**

**Status:** ✅ Automatic on Login

**Process:**
1. User logs in via `/api/erpnext/auth`
2. OneSignal IDs are retrieved:
   - `oneSignalPlayerId` (OneSignal Player ID)
   - `oneSignalSubscriptionId` (Push Subscription ID - **primary device token**)
3. Novu subscriber is created/updated with:
   - Subscriber ID: Employee ID (e.g., `IN003`)
   - User data: firstName, lastName, email, phone
   - OneSignal credentials: Subscription ID (primary), Player ID (fallback)

**Device Token Priority:**
1. `PushSubscription.token` (if available)
2. `PushSubscription.id` (subscription ID)
3. `onesignalId` (player ID - fallback)

**Location:** 
- `pages/api/erpnext/auth.js` (lines 68-506)
- `components/AuthContext.js` (OneSignal ID retrieval)

---

### ✅ **5. Notification Sending**

**Status:** ✅ Configured

**API Endpoint:** `/api/notifications/send`

**Method:** POST

**Required Fields:**
- `subscriberId` - Employee ID (e.g., `IN003`)
- `title` - Notification title
- `body` - Notification message

**Optional Fields:**
- `workflowId` - Novu workflow identifier (default: `'default'`)
- `payload` - Additional data object

**Example:**
```javascript
fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscriberId: 'IN003',
    title: 'Test Notification',
    body: 'This is a test message',
    payload: { /* optional data */ }
  })
});
```

**Location:** `pages/api/notifications/send.js`

---

### ✅ **6. Manual Subscriber Creation**

**Status:** ✅ Available (for testing without login)

**API Endpoint:** `/api/novu/create-subscriber`

**Method:** POST

**Fields:**
- `subscriberId` - Employee ID (e.g., `IN003`)
- `email` - User email
- `displayName` - User full name (parsed to firstName/lastName)
- `oneSignalId` - OneSignal Player ID
- `oneSignalSubscriptionId` - Push Subscription ID

**Location:** `pages/api/novu/create-subscriber.js`

---

### ⚠️ **7. Environment Variables**

**Required for Production:**

**Server-side (API routes):**
```env
NOVU_SECRET_KEY=your_secret_key_here
```

**Client-side (Inbox component):**
```env
NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER=sCfOsfXhHZNc
```

**Optional:**
```env
NOVU_INTEGRATION_IDENTIFIER=  # Only if multiple OneSignal integrations
NEXT_PUBLIC_NOVU_BACKEND_URL=  # Only for EU region
NEXT_PUBLIC_NOVU_SOCKET_URL=   # Only for EU region
```

**Current Status:**
- Static defaults are hardcoded in `NovuInbox.js`:
  - Application Identifier: `sCfOsfXhHZNc`
  - Subscriber ID: `IN003`
- These work without env vars, but env vars should be set for production

---

### 📊 **8. Notification Flow**

**Complete Flow:**
1. **User Login** → `AuthContext` retrieves OneSignal IDs
2. **Auth API** → `/api/erpnext/auth` creates/updates Novu subscriber
3. **Device Token** → OneSignal Subscription ID sent to Novu
4. **Notification Sent** → `/api/notifications/send` triggers Novu workflow
5. **Novu Workflow** → Routes to OneSignal for push delivery
6. **Inbox Display** → `NovuInbox` component shows notifications

---

### 🔧 **9. Current Issues/Fixes Applied**

**Fixed:**
- ✅ React Error #310 (hydration mismatch) - Fixed by SSR-safe rendering
- ✅ Device token changed from Player ID to Subscription ID
- ✅ Static defaults for testing without login
- ✅ Tabs/filters removed (simple inbox)

**Important Notes:**
- **Keyless Mode:** Must be **OFF** in Plasmic Studio for real notifications
- **Subscriber Must Exist:** Subscriber (`IN003`) must be created in Novu before inbox works
- **No Tabs:** Inbox shows all notifications in a single view (tabs removed)

---

### 📝 **10. Testing Checklist**

**To Test Notifications:**
1. ✅ OneSignal initialized (check browser console)
2. ✅ Subscriber exists in Novu (`IN003`)
3. ✅ Keyless mode is **OFF** in Plasmic
4. ✅ Application Identifier set: `sCfOsfXhHZNc`
5. ✅ Send test notification via `/api/notifications/send`
6. ✅ Check inbox for notification
7. ✅ Check device for push notification

---

## 🎯 **Summary**

**What's Working:**
- ✅ OneSignal push notifications initialized
- ✅ Novu Inbox component configured
- ✅ Subscriber auto-creation on login
- ✅ Notification sending API
- ✅ Static defaults for testing (`sCfOsfXhHZNc`, `IN003`)
- ✅ SSR-safe rendering

**What's Configured:**
- Application Identifier: `sCfOsfXhHZNc`
- Subscriber ID: `IN003` (static default)
- OneSignal App ID: `ae84e191-00f5-445c-8e43-173709b8a553`
- Device Token: OneSignal Subscription ID (primary)

**What's Removed:**
- ❌ Tabs (All/Primary/Secondary)
- ❌ Notification counts
- ❌ Filter functionality

**Next Steps:**
1. Ensure `NOVU_SECRET_KEY` is set in Netlify environment variables
2. Ensure `NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER` is set (or use static default)
3. Disable keyless mode in Plasmic Studio
4. Create subscriber `IN003` in Novu if not exists
5. Test notification sending and inbox display

