# erp.elbrit.org Connection Issue - Fixed

## Problem

The `erp.elbrit.org` server was showing "refused to connect" error when trying to embed Raven Chat in an iframe. This was caused by:

**Content Security Policy (CSP) Violation:**
- The server at `erp.elbrit.org` has a security header: `frame-ancestors 'none'`
- This prevents the page from being embedded in ANY iframe (including your app)
- This is a server-side security feature that cannot be bypassed from the client

## Solution

Updated the `RavenChatEmbed` component to:

1. **Detect Connection Failures**: Uses a 5-second timeout to detect when the iframe fails to load
2. **Show User-Friendly Error Message**: Instead of a blank/error screen, users now see:
   - Clear error message explaining the issue
   - A button to open Raven Chat in a new window/tab
3. **Graceful Fallback**: Users can still access the chat by clicking the button

## What Changed

### Before:
- Iframe would fail silently or show browser error
- Users couldn't access the chat
- No clear explanation of what went wrong

### After:
- Clear error message: "erp.elbrit.org refused to connect"
- Explanation: "The chat server has security restrictions that prevent it from being embedded"
- Action button: "Open Raven Chat in New Window" - opens the chat in a new tab

## How It Works

1. Component tries to load the iframe
2. If it doesn't load within 5 seconds, shows error state
3. Error state displays a friendly message with a button
4. Button opens `https://erp.elbrit.org/raven` in a new window

## Permanent Fix (Server-Side)

To allow iframe embedding, the administrator of `erp.elbrit.org` needs to update the CSP header:

**Current:**
```
frame-ancestors 'none'
```

**Should be:**
```
frame-ancestors 'self' https://your-domain.com
```

Or to allow all domains (less secure):
```
frame-ancestors *
```

This change must be made on the `erp.elbrit.org` server configuration (nginx, Apache, or application server).

## Testing

The component now handles:
- ✅ CSP violations (blocked iframes)
- ✅ Connection timeouts
- ✅ Network errors
- ✅ Provides fallback option (open in new window)

Users will no longer see a confusing error - they'll get a clear message and a way to access the chat.

