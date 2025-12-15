# Plasmic Authentication Bypass Guide

## Problem
Plasmic's built-in authentication system is blocking access even though our custom authentication is working perfectly. The user is authenticated with "admin" role, but Plasmic still shows "You don't have access to this page".

## Solution: Disable Plasmic's Built-in Authentication

### Step 1: Code Changes (Already Done)

We've already made the necessary code changes:

1. **Updated `plasmic-init.js`**:
   - Added `auth: { enabled: false }` to disable Plasmic's built-in auth
   - Added custom `getUserAndToken` handler that returns `null`

2. **Updated `pages/[[...catchall]].jsx`**:
   - Removed `userAuthToken` and `user` props from `PlasmicRootProvider`
   - This prevents Plasmic from using its built-in auth system

### Step 2: Plasmic Studio Configuration

You need to configure your Plasmic Studio project to disable authentication:

1. **Go to your Plasmic Studio project**: https://studio.plasmic.app
2. **Navigate to Settings**: Click on the gear icon in the sidebar
3. **Go to Authentication section**: Look for "Authentication" or "Auth" settings
4. **Disable Authentication**: 
   - Set "Authentication" to "Disabled" or "None"
   - Remove any authentication providers
   - Set "Default min role" to "None" or remove role requirements

### Step 3: Page-Level Authentication Settings

For each page that's showing access denied:

1. **Open the page in Plasmic Studio**
2. **Go to Page Settings**: Click on the page settings (gear icon)
3. **Look for Authentication/Privacy settings**:
   - Set "Authentication required" to "No"
   - Set "Minimum role" to "None" or remove role requirements
   - Set "Access control" to "Public" or "No restrictions"

### Step 4: Component-Level Authentication

If specific components have authentication settings:

1. **Select the component** in Plasmic Studio
2. **Go to Component Settings**
3. **Look for Authentication/Visibility settings**:
   - Set "Authentication required" to "No"
   - Set "Minimum role" to "None"
   - Set "Visibility" to "Always visible"

### Step 5: Test the Changes

1. **Visit `/test-auth`** to verify authentication is working
2. **Check the console logs** to confirm user data is loaded
3. **Try accessing `/sass`** again

## Alternative: Plasmic Studio Project Settings

If you can't find the authentication settings in Plasmic Studio:

1. **Go to Project Settings**
2. **Look for "Authentication" or "Security" section**
3. **Disable all authentication features**
4. **Save the changes**

## Verification

After making these changes:

1. **Check the browser console** - you should see:
   ```
   ✅ ERPNext user data received: baranidharan@elbrit.org
   📊 User source: employee
   🔑 ERPNext user role: admin
   ```

2. **Visit `/test-auth`** - should show all user data correctly

3. **Try accessing `/sass`** - should now work without "access denied"

## Troubleshooting

If you still see "access denied":

1. **Clear browser cache and localStorage**:
   ```javascript
   localStorage.clear();
   ```

2. **Check Plasmic Studio project settings** for any remaining auth requirements

3. **Verify the page doesn't have role-based access control** in Plasmic Studio

4. **Check if there are any Plasmic Studio environment variables** that might be enabling auth

## Our Custom Authentication Flow

Our authentication system works as follows:

1. **Firebase Authentication**: User logs in via Microsoft SSO or phone
2. **ERPNext Verification**: We verify the user exists in ERPNext Employee table
3. **Role Assignment**: User gets "admin" role if found in ERPNext
4. **Custom Token**: We generate our own authentication token
5. **Local Storage**: User data is stored in localStorage for persistence

The issue was that Plasmic's built-in auth system was interfering with our custom auth system. By disabling Plasmic's auth, our custom system can work properly. 