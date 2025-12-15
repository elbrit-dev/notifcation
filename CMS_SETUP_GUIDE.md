# CMS Save Functionality Fix Guide

## Issue: Pivot Table "Apply & Save" Not Working

The pivot table save functionality is not working because of missing configuration or permissions. This guide will help you fix it.

## Step 1: Check Current Status

First, add the debug component to your page to see what's wrong:

```jsx
import CMSDebug from '../components/CMSDebug';

// Add this to your page component
<CMSDebug />
```

This will show you:
- User authentication status
- Admin role permissions
- Environment variable status
- CMS connection test results

## Step 2: Environment Variables Setup

Create a `.env.local` file in your project root with these variables:

```env
# Plasmic Workspace Configuration
PLASMIC_WORKSPACE_ID=uP7RbyUnivSX75FTKL9RLp

# CMS Database Configuration
PLASMIC_CMS_DATABASE_ID=uP7RbyUnivSX75FTKL9RLp
PLASMIC_TABLE_CONFIGS_ID=o4o5VRFTDgHHmQ31fCfkuz

# API Tokens (Get these from Plasmic Studio)
PLASMIC_CMS_SECRET_TOKEN=your_secret_token_here
PLASMIC_CMS_PUBLIC_TOKEN=your_public_token_here
PLASMIC_API_TOKEN=your_api_token_here

# Auth Configuration
PLASMIC_AUTH_SECRET=your_auth_secret_here
```

## Step 3: Get Your API Tokens

1. **Go to Plasmic Studio**: https://studio.plasmic.app
2. **Navigate to your workspace**: `uP7RbyUnivSX75FTKL9RLp`
3. **Go to Settings → API Tokens**
4. **Create or copy these tokens**:
   - **CMS Secret Token**: For write operations
   - **CMS Public Token**: For read operations
   - **API Token**: For general API access
   - **Auth Secret**: For user authentication

## Step 4: Create the CMS Table

The CMS needs a table to store pivot configurations:

1. **Go to CMS section** in Plasmic Studio
2. **Create a new table** called `TableConfigs`
3. **Add these fields**:

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `configKey` | Text | ✅ Yes | Unique configuration identifier |
| `pageName` | Text | ❌ No | Page name |
| `tableName` | Text | ❌ No | Table name |
| `pivotConfig` | JSON | ✅ Yes | Pivot configuration data |
| `userId` | Text | ❌ No | User email |
| `userRole` | Text | ❌ No | User role |
| `updatedAt` | DateTime | ❌ No | Last update time |

## Step 5: Set Up User Roles

The system requires admin users to save configurations:

1. **Create a users table** in CMS (if not exists)
2. **Add your user** with admin role:
   - Email: your-email@example.com
   - Role ID: `6c2a85c7-116e-43b3-a4ff-db11b7858487`
   - Role Name: Admin

## Step 6: Test the Setup

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Open the debug panel** and click "Run Debug Test"

3. **Check the console** for detailed error messages

## Step 7: Common Issues & Solutions

### Issue 1: "Access denied: Only admin users can save"
**Solution**: Ensure your user has the correct role ID in the CMS users table

### Issue 2: "Plasmic workspace ID not provided"
**Solution**: Check your `.env.local` file has `PLASMIC_WORKSPACE_ID`

### Issue 3: "CMS table query failed"
**Solution**: Create the TableConfigs table in Plasmic CMS

### Issue 4: "API route failed: 500"
**Solution**: Check your API tokens have correct permissions

### Issue 5: "Missing Plasmic CMS configuration"
**Solution**: Ensure all environment variables are set correctly

## Step 8: Verify Working Configuration

Once everything is set up correctly, you should see:

✅ **Debug panel shows**:
- User is authenticated
- User has admin role
- All environment variables are set
- CMS test passes

✅ **Pivot table shows**:
- "Apply & Save" button is enabled
- Clicking it saves successfully
- No error messages in console

## Step 9: Remove Debug Component

Once everything works, remove the debug component:

```jsx
// Remove this line
// import CMSDebug from '../components/CMSDebug';

// Remove this from your JSX
// <CMSDebug />
```

## Troubleshooting

If you still have issues:

1. **Check browser console** for detailed error messages
2. **Check server logs** for API errors
3. **Verify API tokens** in Plasmic Studio
4. **Test API endpoints** directly using curl or Postman
5. **Check network tab** for failed requests

## Quick Test Commands

Test your API tokens:

```bash
# Test CMS read access
curl -H "x-plasmic-api-cms-tokens: YOUR_CMS_DB_ID:YOUR_PUBLIC_TOKEN" \
  "https://data.plasmic.app/api/v1/cms/databases/YOUR_CMS_DB_ID/tables"

# Test CMS write access (replace with your actual IDs)
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-plasmic-api-cms-tokens: YOUR_CMS_DB_ID:YOUR_SECRET_TOKEN" \
  -d '{"rows":[{"data":{"configKey":"test","pivotConfig":"{}"}}]}' \
  "https://data.plasmic.app/api/v1/cms/databases/YOUR_CMS_DB_ID/tables/YOUR_TABLE_ID/rows"
```

## Support

If you continue to have issues:

1. **Check the debug panel output**
2. **Review console error messages**
3. **Verify all environment variables**
4. **Test with the debug component**
5. **Contact support with debug information** 