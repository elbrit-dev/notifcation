# PrimeDataTable - Direct Plasmic CMS Integration

The PrimeDataTable component now supports **direct integration** with Plasmic CMS, eliminating the need for callback props and manual CMS handler setup.

## 🔥 What Changed

### Before (Callback Props - DEPRECATED)
```jsx
<PrimeDataTable
  data={$queries.yourData.data}
  enablePivotPersistence={true}
  pivotConfigKey="dashboard_salesTable"
  onSavePivotConfig={window.pivotCMSHandlers?.save}  // ❌ Complex setup required
  onLoadPivotConfig={window.pivotCMSHandlers?.load}  // ❌ Complex setup required
/>
```

### After (Direct Integration - RECOMMENDED)
```jsx
<PrimeDataTable
  data={$queries.yourData.data}
  enablePivotPersistence={true}
  pivotConfigKey="dashboard_salesTable"
  useDirectCMSIntegration={true}  // ✅ Default - no extra setup needed!
  // Optional: Override environment variables
  // plasmicProjectId="your_project_id"
  // plasmicApiToken="your_api_token"
/>
```

## 🚀 Setup Instructions

### 1. Environment Variables (Required)

Add these to your `.env.local` file:

```bash
# Plasmic CMS Configuration (REQUIRED)
PLASMIC_WORKSPACE_ID=uP7RbyUnivSX75FTKL9RLp           # Your workspace ID
PLASMIC_TABLE_CONFIGS_ID=o4o5VRFTDgHHmQ31fCfkuz       # TableConfigs table ID
PLASMIC_API_TOKEN=your_api_token_here                  # Server-side only (secure)
NEXT_PUBLIC_PLASMIC_PROJECT_ID=your_project_id_here    # Keep for other Plasmic features
```

**Important Security Notes:**
- 🆔 `PLASMIC_WORKSPACE_ID` - Your workspace identifier from CMS URLs
- 📋 `PLASMIC_TABLE_CONFIGS_ID` - Your TableConfigs table identifier  
- 🔒 `PLASMIC_API_TOKEN` - Server-only (secure - not exposed to browser)
- ✅ `NEXT_PUBLIC_PLASMIC_PROJECT_ID` - Keep for other Plasmic features
- The component automatically uses a secure API route for CMS operations

### 2. Basic Usage

```jsx
<PrimeDataTable
  // Your existing props
  data={$queries.salesData.data}
  columns={[
    { key: "drName", title: "Doctor Name" },
    { key: "salesTeam", title: "Sales Team" },
    { key: "serviceAmount", title: "Service Amount", type: "number" },
    { key: "supportValue", title: "Support Value", type: "number" }
  ]}
  
  // Pivot and CMS configuration
  enablePivotUI={true}
  enablePivotPersistence={true}
  pivotConfigKey="dashboard_salesTable"  // Must be unique per table
  useDirectCMSIntegration={true}         // Enable direct CMS integration
  autoSavePivotConfig={false}            // Use explicit "Apply & Save" button
  
  // Optional: Override environment variables
  // plasmicProjectId="custom_project_id"
  // plasmicApiToken="custom_api_token"
/>
```

### 3. Advanced Configuration

```jsx
<PrimeDataTable
  data={$queries.salesData.data}
  
  // CMS Configuration
  enablePivotPersistence={true}
  pivotConfigKey="dashboard_salesTable_advanced"
  useDirectCMSIntegration={true}
  autoSavePivotConfig={true}  // Auto-save changes (optional)
  
  // If you need to override environment variables
  plasmicWorkspaceId={$ctx.plasmicWorkspaceId}
  plasmicTableConfigsId={$ctx.plasmicTableConfigsId}
  plasmicApiToken={$ctx.plasmicApiToken}
  
  // UI Configuration
  enablePivotUI={true}
  dropdownFilterColumns={["salesTeam", "region"]}
  datePickerFilterColumns={["date"]}
  numberFilterColumns={["serviceAmount", "supportValue"]}
  currencyColumns={["serviceAmount", "supportValue"]}
/>
```

## 🎛️ Configuration Options

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `useDirectCMSIntegration` | boolean | `true` | Enable direct Plasmic CMS integration |
| `plasmicWorkspaceId` | string | env var | Plasmic workspace ID (optional) |
| `plasmicTableConfigsId` | string | env var | TableConfigs table ID (optional) |
| `plasmicApiToken` | string | env var | Plasmic API token (optional) |
| `enablePivotPersistence` | boolean | `true` | Enable saving pivot configs to CMS |
| `pivotConfigKey` | string | `"pivotConfig"` | Unique key for this table's config |
| `autoSavePivotConfig` | boolean | `false` | Auto-save vs manual "Apply & Save" |

## 🔧 CMS Data Structure

The component automatically creates/updates records in your `TableConfigs` CMS table with this structure:

```json
{
  "configKey": "dashboard_salesTable",
  "pageName": "dashboard", 
  "tableName": "salesTable",
  "pivotConfig": {
    "enabled": true,
    "rows": ["drName", "salesTeam"],
    "columns": ["date"],
    "values": [
      { "field": "serviceAmount", "aggregation": "sum" }
    ],
    "showGrandTotals": true,
    "showRowTotals": true
  },
  "userId": "user@example.com",
  "userRole": "admin",
  "updatedAt": "2025-01-18T10:30:00.000Z"
}
```

## 🎯 Migration Guide

### From Callback Props to Direct Integration

If you're currently using callback props, migration is simple:

1. **Remove** the custom CMS handler component
2. **Remove** `onSavePivotConfig` and `onLoadPivotConfig` props
3. **Add** `useDirectCMSIntegration={true}` (or omit - it's the default)
4. **Ensure** your environment variables are set

```jsx
// OLD - Remove this
const PivotCMSHandlers = ({ children }) => {
  // ... complex handler code
};

// OLD - Remove these props
<PrimeDataTable
  onSavePivotConfig={window.pivotCMSHandlers?.save}
  onLoadPivotConfig={window.pivotCMSHandlers?.load}
/>

// NEW - Simple and clean
<PrimeDataTable
  useDirectCMSIntegration={true}  // Default behavior
/>
```

## ✅ Benefits

1. **Simplified Setup**: No more custom handler components
2. **Automatic Integration**: Works out of the box with environment variables
3. **Better Error Handling**: Built-in retry and error management
4. **Type Safety**: Proper TypeScript integration
5. **Backwards Compatibility**: Old callback props still work if needed
6. **🔒 Security First**: API tokens stay server-side, automatic fallback to secure API routes

## 🐛 Troubleshooting

### CMS Save/Load Not Working

1. **Check Environment Variables**:
   ```bash
   echo $NEXT_PUBLIC_PLASMIC_PROJECT_ID
   echo $PLASMIC_API_TOKEN
   ```

2. **Check Browser Console** for error messages:
   ```
   🔥 SAVING TO PLASMIC CMS - Config Key: dashboard_salesTable
   ✅ CMS SAVE SUCCESSFUL
   ```

3. **Verify CMS Table**: Ensure `TableConfigs` table exists in your Plasmic CMS

4. **Check API Token Permissions**: Ensure your API token has read/write access to CMS

### Fallback to Callback Props

If you need to use the old callback method:

```jsx
<PrimeDataTable
  useDirectCMSIntegration={false}  // Disable direct integration
  onSavePivotConfig={yourSaveFunction}
  onLoadPivotConfig={yourLoadFunction}
/>
```

## 🔒 How Security Works

The component automatically handles security:

1. **Client-Side**: Uses `PLASMIC_WORKSPACE_ID` and `PLASMIC_TABLE_CONFIGS_ID` (safe to expose)
2. **Server-Side**: Keeps `PLASMIC_API_TOKEN` secure (never sent to browser)
3. **Automatic Fallback**: Uses secure `/api/plasmic-cms` route for all CMS operations
4. **Zero Config**: You don't need to think about security - it's handled automatically!

**Console Output You'll See:**
```
🔥 SAVING TO CMS - Config Key: test1  
📊 SAVING TO CMS - Pivot Config: {...}
🔒 Using secure API route for CMS integration
✅ CMS SAVE SUCCESSFUL (via API route)
```

## 🎉 That's It!

Your PrimeDataTable now has seamless Plasmic CMS integration with **zero configuration required** and **security by default**! 