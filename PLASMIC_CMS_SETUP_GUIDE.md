# Plasmic CMS Setup Guide for Pivot Table Configurations

## Issue: Table Not Found (404 Error)
The API is working correctly, but the Plasmic CMS table for storing configurations doesn't exist.

## Step 1: Create the CMS Table in Plasmic

1. **Go to your Plasmic workspace**: https://studio.plasmic.app
2. **Open your workspace**: `uP7RbyUnivSX75FTKL9RLp`
3. **Navigate to CMS**: Click on "CMS" in the sidebar
4. **Create a new table** with these exact specifications:

### Table Name: `TableConfigs`
### Table ID: `o4o5VRFTDgHHmQ31fCfkuz` (or create new and update .env)

### Required Fields:

| Field Name | Field Type | Required | Description |
|------------|------------|----------|-------------|
| `configKey` | Text | ✅ Yes | Unique identifier for each configuration |
| `pageName` | Text | ❌ No | Page where the configuration is used |
| `tableName` | Text | ❌ No | Name of the table component |
| `pivotConfig` | JSON | ✅ Yes | The actual pivot configuration data |
| `userId` | Text | ❌ No | User who created/modified the config |
| `userRole` | Text | ❌ No | Role of the user |
| `updatedAt` | DateTime | ❌ No | When the config was last updated |

## Step 2: Alternative - Get Your Actual IDs

If you prefer to use your existing workspace/tables:

1. **Get Workspace ID**:
   - Go to your Plasmic workspace
   - Look at the URL: `https://studio.plasmic.app/workspace/YOUR_WORKSPACE_ID`
   - Copy the workspace ID

2. **Get Table ID**:
   - Go to CMS section
   - Create or select a table for configurations
   - Look at the URL when editing the table
   - Copy the table ID

3. **Update .env file** with your actual IDs:
```env
PLASMIC_WORKSPACE_ID=your_actual_workspace_id
PLASMIC_TABLE_CONFIGS_ID=your_actual_table_id
```

## Step 3: Verify API Token Permissions

1. **Go to Workspace Settings** in Plasmic
2. **Navigate to API Tokens**
3. **Check your token permissions**:
   - ✅ CMS Read access
   - ✅ CMS Write access
   - ✅ Access to the workspace

## Step 4: Test the Setup

After creating the table, restart your development server:

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

Then try saving a pivot configuration again.

## Step 5: Troubleshooting

If you still get errors:

1. **Check the server console** for detailed error messages
2. **Verify table structure** matches the required fields
3. **Test API token** in Plasmic API explorer
4. **Check workspace permissions**

## Quick Setup Script

You can also create the table programmatically using Plasmic API:

```javascript
// Use this in Plasmic's API explorer or a script
{
  "name": "TableConfigs",
  "fields": [
    {"name": "configKey", "type": "text", "required": true},
    {"name": "pageName", "type": "text", "required": false},
    {"name": "tableName", "type": "text", "required": false},
    {"name": "pivotConfig", "type": "json", "required": true},
    {"name": "userId", "type": "text", "required": false},
    {"name": "userRole", "type": "text", "required": false},
    {"name": "updatedAt", "type": "datetime", "required": false}
  ]
}
```

## Expected Success

Once the table exists, you should see:
- ✅ Pivot configurations save successfully
- ✅ Configurations persist between sessions
- ✅ No more 404 errors
- ✅ Enhanced debug logs showing successful operations 