# Fix Environment Variable Size Issue

## Problem
Netlify deployment fails with:
```
Your environment variables exceed the 4KB limit imposed by AWS Lambda
```

## Quick Fix Steps

### Step 1: Check Variable Sizes

The largest variable is likely `FIREBASE_PRIVATE_KEY`. Check its format:

1. Go to **Netlify Dashboard → Site Settings → Environment Variables**
2. Find `FIREBASE_PRIVATE_KEY`
3. It should be a **single-line string** with `\n` characters (not actual newlines)

**Correct format:**
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n
```

**Wrong format (has actual line breaks):**
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----
```

### Step 2: Optimize FIREBASE_PRIVATE_KEY

If your `FIREBASE_PRIVATE_KEY` has actual newlines:

1. Copy the entire key value
2. Replace all actual newlines with `\n` (backslash + n)
3. Make it a single line
4. Update it in Netlify

**Example conversion:**
```bash
# Before (multi-line, ~2500 bytes)
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----

# After (single-line with \n, ~2500 bytes but properly formatted)
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n
```

### Step 3: Remove Unused Variables

Check if these are actually needed:

- `FIREBASE_PRIVATE_KEY` - Only if using Firebase Admin SDK server-side
- `FIREBASE_CLIENT_EMAIL` - Only if using Firebase Admin SDK server-side  
- `AZURE_HR_GROUP_ID` - Check if used in API routes
- `AZURE_IT_GROUP_ID` - Check if used in API routes

### Step 4: Verify Runtime Variables

These are the **only** variables that need to be in Lambda (must be < 4KB total):

**Required for API routes:**
- `ERPNEXT_URL`
- `ERPNEXT_API_KEY`
- `ERPNEXT_API_SECRET`
- `NOVU_SECRET_KEY`
- `PLASMIC_CMS_DATABASE_ID`
- `PLASMIC_TABLE_CONFIGS_ID`
- `PLASMIC_CMS_SECRET_TOKEN`
- `PLASMIC_CMS_PUBLIC_TOKEN`

**Optional:**
- `NOVU_INTEGRATION_IDENTIFIER`
- `FIREBASE_PRIVATE_KEY` (if using Firebase Admin SDK)
- `FIREBASE_CLIENT_EMAIL` (if using Firebase Admin SDK)
- `FIREBASE_PROJECT_ID` (if using Firebase Admin SDK)
- `AZURE_HR_GROUP_ID` (if used)
- `AZURE_IT_GROUP_ID` (if used)

**All `NEXT_PUBLIC_*` variables are embedded at build time and don't count toward Lambda limit.**

### Step 5: Test Locally

Run the check script to see current sizes:
```bash
npm run check:env
```

This will show you which variables are taking up the most space.

## Expected Result

After optimization, your runtime variables should be:
- **Total size: < 4KB (4096 bytes)**
- **FIREBASE_PRIVATE_KEY**: ~2500 bytes (if used)
- **Other variables**: ~1500 bytes combined

## If Still Over Limit

If you're still over 4KB after optimization:

1. **Remove unused variables** from Netlify
2. **Check for duplicate variables**
3. **Consider using shorter API keys** if possible
4. **Move some logic to client-side** if appropriate

## After Fixing

1. Update the variable in Netlify Dashboard
2. Redeploy your site
3. The deployment should succeed

