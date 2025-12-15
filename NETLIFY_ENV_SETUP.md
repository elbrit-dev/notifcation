# Netlify Environment Variables Setup Guide

## Problem
Netlify deployment fails with error:
```
Your environment variables exceed the 4KB limit imposed by AWS Lambda
```

This happens because Netlify passes **all** environment variables to Lambda functions, including `NEXT_PUBLIC_*` variables which are only needed at build time and are already embedded in the JavaScript bundle.

## Solution

You need to configure environment variables in Netlify UI to separate build-time and runtime variables.

### Step 1: Identify Variables

**Build-time only (NEXT_PUBLIC_* - already embedded in bundle):**
These do NOT need to be passed to Lambda functions:
- `NEXT_PUBLIC_APP_DOMAIN`
- `NEXT_PUBLIC_AZURE_TENANT_ID`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_MICROSOFT_GRAPH_ENDPOINT`
- `NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER`
- `NEXT_PUBLIC_ONESIGNAL_APP_ID`
- `NEXT_PUBLIC_PLASMIC_PROJECT_ID`
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `NEXT_PUBLIC_TRUECALLER_APP_HASH`
- `NEXT_PUBLIC_TRUECALLER_APP_ID`
- `NEXT_PUBLIC_TRUECALLER_COUNTRY_CODE`
- `NEXT_PUBLIC_TRUECALLER_PARTNER_NAME`
- `NEXT_PUBLIC_TRUECALLER_SERVICE_ID`

**Runtime variables (needed in Lambda functions):**
These MUST be available to API routes:
- `ERPNEXT_URL`
- `ERPNEXT_API_KEY`
- `ERPNEXT_API_SECRET`
- `NOVU_SECRET_KEY`
- `NOVU_INTEGRATION_IDENTIFIER` (optional)
- `PLASMIC_CMS_DATABASE_ID`
- `PLASMIC_TABLE_CONFIGS_ID`
- `PLASMIC_CMS_SECRET_TOKEN`
- `PLASMIC_CMS_PUBLIC_TOKEN`

**Build-time variables (used during build but not in Lambda):**
- `PLASMIC_API_TOKEN` (used during build for Plasmic initialization)
- `PLASMIC_AUTH_SECRET` (used during build)
- `PLASMIC_WORKSPACE_ID` (used during build)
- `PLASMIC_VERSION_TAG` (used during build)
- `FIREBASE_PRIVATE_KEY` (if used server-side, otherwise build-time)
- `FIREBASE_CLIENT_EMAIL` (if used server-side, otherwise build-time)
- `FIREBASE_PROJECT_ID` (if used server-side, otherwise build-time)
- `AZURE_HR_GROUP_ID` (if used server-side, otherwise build-time)
- `AZURE_IT_GROUP_ID` (if used server-side, otherwise build-time)

### Step 2: Configure in Netlify UI

Unfortunately, Netlify doesn't support excluding environment variables from Lambda functions via configuration files. You have two options:

#### Option A: Reduce Variable Sizes (Quick Fix)

1. Go to **Netlify Dashboard → Site Settings → Environment Variables**
2. Check if any variables have unnecessarily long values
3. Consider using shorter IDs or removing redundant variables
4. For `FIREBASE_PRIVATE_KEY`, ensure it's formatted correctly (single line with `\n` characters)

#### Option B: Use Netlify Build Plugin (Recommended)

Create a custom build plugin to filter environment variables before they're passed to Lambda.

### Step 3: Alternative - Use Netlify Environment Variable Scoping

1. Go to **Netlify Dashboard → Site Settings → Environment Variables**
2. Keep all variables as they are (they're needed for the build)
3. The issue is that Netlify passes them all to Lambda

**Workaround:** Since Netlify Next.js plugin handles this automatically, the real solution is to reduce the total size. Try:

1. **Minimize `FIREBASE_PRIVATE_KEY`**: Ensure it's properly formatted (replace actual newlines with `\n` string)
2. **Remove unused variables**: Delete any environment variables you're not using
3. **Shorten values**: If possible, use shorter API keys or tokens

### Step 4: Verify API Routes Only Use Server-Side Vars

The following API routes use these server-side environment variables:

- `/api/erpnext/auth.js`: `ERPNEXT_URL`, `ERPNEXT_API_KEY`, `ERPNEXT_API_SECRET`, `NOVU_SECRET_KEY`, `NOVU_INTEGRATION_IDENTIFIER`
- `/api/plasmic-cms.js`: `PLASMIC_CMS_DATABASE_ID`, `PLASMIC_TABLE_CONFIGS_ID`, `PLASMIC_CMS_SECRET_TOKEN`, `PLASMIC_CMS_PUBLIC_TOKEN`

All `NEXT_PUBLIC_*` variables are accessed via `process.env` but are embedded at build time, so they don't need to be in Lambda environment.

## Recommended Action

Since Netlify's Next.js plugin automatically handles Next.js deployments, the best immediate solution is:

1. **Run the check script**: Use `npm run check:env` to analyze your environment variable sizes
2. **Check variable sizes**: Ensure no single variable is unnecessarily large
3. **Format `FIREBASE_PRIVATE_KEY` properly** (if used): It should be a single-line string with `\n` characters, not actual newlines
4. **Remove unused variables**: Clean up any environment variables that are no longer needed
5. **Reduce large values**: If you have very long API keys or tokens, see if you can use shorter alternatives

## Quick Fix Steps

### Step 1: Check Current Sizes
```bash
npm run check:env
```

This will show you:
- Which variables are build-time vs runtime
- Total size of runtime variables (must be < 4KB)
- Largest variables that might need optimization

### Step 2: Optimize in Netlify UI

1. Go to **Netlify Dashboard → Your Site → Site Settings → Environment Variables**
2. For each variable, check:
   - Is it actually being used?
   - Can the value be shortened?
   - Is it formatted correctly? (no unnecessary spaces, proper encoding)

### Step 3: Remove Unused Variables

Based on the codebase analysis, these variables might not be needed server-side:
- `FIREBASE_PRIVATE_KEY` - Only needed if using Firebase Admin SDK server-side (not detected in code)
- `FIREBASE_CLIENT_EMAIL` - Only needed if using Firebase Admin SDK server-side (not detected in code)
- `AZURE_HR_GROUP_ID` - Check if actually used in API routes
- `AZURE_IT_GROUP_ID` - Check if actually used in API routes
- `PLASMIC_API_TOKEN` - May only be needed at build time
- `PLASMIC_AUTH_SECRET` - May only be needed at build time
- `PLASMIC_WORKSPACE_ID` - May only be needed at build time
- `PLASMIC_VERSION_TAG` - Only needed at build time

**Important**: If you remove any variables, make sure they're not used in your API routes. Test your deployment after removing variables.

## Long-term Solution

Unfortunately, Netlify doesn't currently support excluding environment variables from Lambda functions via configuration. The Netlify Next.js plugin automatically passes all environment variables to Lambda functions.

If you continue to exceed the 4KB limit, consider:
1. **Using Netlify Edge Functions** instead of Lambda (if compatible with your use case)
2. **Moving secrets to a secrets manager** (AWS Secrets Manager, etc.) and fetching them at runtime
3. **Splitting your application** to reduce the number of environment variables needed
4. **Contacting Netlify Support** - they may have additional solutions or workarounds

