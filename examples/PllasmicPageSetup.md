# Plasmic Page Setup Guide - PrimeDataTable with CMS Persistence

## Step 1: Basic Component Setup

### Add PrimeDataTable to Your Page
1. **Drag** the `PrimeDataTable` component to your page
2. **Configure basic props** in the right panel:

```jsx
// Basic Data Props
data: $queries.yourDataQuery.data  // Your existing data query
enablePivotUI: true
enablePivotPersistence: true
pivotConfigKey: "dashboard_salesTable"  // UNIQUE KEY for this table
autoSavePivotConfig: false  // Use explicit Apply & Save buttons
```

## Step 2: Set Up CMS Handler Functions

### Create Custom Code Component for CMS Handlers

1. **Add a Custom Code component** to your page (can be invisible)
2. **Add this code** to handle CMS operations:

```jsx
// Custom Code Component: PivotCMSHandlers

import React, { useCallback } from 'react';

const PivotCMSHandlers = ({ children, currentUserId, pageName = "dashboard" }) => {
  
  // Save function - this will be passed to PrimeDataTable
  const saveToCMS = useCallback(async (configKey, pivotConfig) => {
    try {
      console.log('Saving to CMS:', configKey, pivotConfig);
      
      // Use Plasmic's query system
      const result = await $queries.savePivotConfig.mutate({
        configKey: configKey,
        pageName: pageName,
        tableName: configKey.split('_')[1] || "Table",
        pivotConfig: pivotConfig,
        userId: currentUserId || null
      });
      
      console.log('Saved successfully:', result);
      return result;
    } catch (error) {
      console.error('Save failed:', error);
      throw error;
    }
  }, [currentUserId, pageName]);

  // Load function - this will be passed to PrimeDataTable  
  const loadFromCMS = useCallback(async (configKey) => {
    try {
      console.log('Loading from CMS:', configKey);
      
      const result = await $queries.loadPivotConfig.fetch({
        configKey: configKey,
        userId: currentUserId || null
      });
      
      const config = result.data?.tableConfigs?.[0]?.pivotConfig;
      console.log('Loaded config:', config);
      
      return config || null;
    } catch (error) {
      console.error('Load failed:', error);
      return null;
    }
  }, [currentUserId]);

  // Store functions in global context for PrimeDataTable to access
  React.useEffect(() => {
    window.pivotCMSHandlers = {
      save: saveToCMS,
      load: loadFromCMS
    };
  }, [saveToCMS, loadFromCMS]);

  return children || null;
};

export default PivotCMSHandlers;
```

## Step 3: Configure PrimeDataTable Props

### Required Props for CMS Persistence

```jsx
// In your PrimeDataTable component props:

// Data and Basic Config
data: $queries.yourDataQuery.data
enablePivotUI: true
enablePivotPersistence: true

// Unique Configuration Key (CRITICAL - must be unique per table)
pivotConfigKey: "dashboard_salesTable"  // Format: {pageName}_{tableName}

// CMS Handler Functions
onSavePivotConfig: window.pivotCMSHandlers?.save
onLoadPivotConfig: window.pivotCMSHandlers?.load

// Control Options
autoSavePivotConfig: false  // Use Apply & Save buttons for explicit control

// Optional: Filter configurations
dropdownFilterColumns: ["salesTeam", "region"]
datePickerFilterColumns: ["date"]  
numberFilterColumns: ["amount", "revenue"]
currencyColumns: ["amount", "revenue"]
```

## Step 4: Page Structure Example

```jsx
// Your Plasmic Page Structure:

<div className="dashboard-page">
  {/* CMS Handlers (invisible but necessary) */}
  <PivotCMSHandlers 
    currentUserId={$globalActions.getCurrentUser()?.id}
    pageName="dashboard"
  >
    
    <h1>Dashboard</h1>
    
    {/* First Table */}
    <div className="table-section">
      <h2>Sales Performance</h2>
      <PrimeDataTable
        data={$queries.salesData.data}
        enablePivotUI={true}
        enablePivotPersistence={true}
        pivotConfigKey="dashboard_salesTable"
        onSavePivotConfig={window.pivotCMSHandlers?.save}
        onLoadPivotConfig={window.pivotCMSHandlers?.load}
        autoSavePivotConfig={false}
        
        dropdownFilterColumns={["salesTeam", "region"]}
        currencyColumns={["serviceAmount", "supportValue"]}
      />
    </div>
    
    {/* Second Table */}
    <div className="table-section">
      <h2>Performance Metrics</h2>
      <PrimeDataTable
        data={$queries.performanceData.data}
        enablePivotUI={true}
        enablePivotPersistence={true}
        pivotConfigKey="dashboard_performanceTable"  // Different key!
        onSavePivotConfig={window.pivotCMSHandlers?.save}
        onLoadPivotConfig={window.pivotCMSHandlers?.load}
        autoSavePivotConfig={false}
        
        dropdownFilterColumns={["department", "level"]}
        currencyColumns={["revenue", "bonus"]}
      />
    </div>
    
  </PivotCMSHandlers>
</div>
```

## Step 5: Testing Checklist

### Immediate Testing Steps

1. **Open your page** in preview mode
2. **Check browser console** for any errors
3. **Click "Pivot" button** on any table
4. **Configure a simple pivot**:
   - Rows: Select one categorical field
   - Values: Select one numeric field with "Sum"
   - Check "Enable Pivot Table"
5. **Click "Apply"** (should show pivot immediately)
6. **Click "Apply & Save"** (should save to CMS)
7. **Refresh the page** (configuration should load automatically)

### Verification Steps

**Check CMS Data:**
1. Go to Plasmic CMS → TableConfigs
2. You should see a new record with:
   - `configKey`: "dashboard_salesTable"
   - `pivotConfig`: Your configuration JSON
   - `pageName`: "dashboard"

**Check Console Logs:**
```
Loading from CMS: dashboard_salesTable
Loaded config: null (first time)
Saving to CMS: dashboard_salesTable {...config...}
Saved successfully: {...result...}
```

## Step 6: Multiple Tables Setup

### For Multiple Tables on Same Page

```jsx
// Table 1
<PrimeDataTable
  pivotConfigKey="dashboard_salesTable"
  // ... other props
/>

// Table 2  
<PrimeDataTable
  pivotConfigKey="dashboard_inventoryTable"  // Different key
  // ... other props
/>

// Table 3
<PrimeDataTable
  pivotConfigKey="dashboard_reportTable"  // Different key
  // ... other props
/>
```

### For Different Pages

```jsx
// Dashboard Page
pivotConfigKey: "dashboard_salesTable"

// Analytics Page  
pivotConfigKey: "analytics_salesTable"

// Reports Page
pivotConfigKey: "reports_salesTable"
```

## Step 7: Troubleshooting

### Common Issues & Solutions

**"Configuration not saving"**
- Check CMS query permissions
- Verify `savePivotConfig` mutation is correctly configured
- Check browser console for errors

**"Configuration not loading"**
- Verify `loadPivotConfig` query returns data
- Check `configKey` matches exactly
- Ensure CMS record exists

**"Multiple tables interfering"**
- Ensure each table has a unique `pivotConfigKey`
- Check CMS records have different `configKey` values

**"User-specific configs not working"**
- Verify `currentUserId` is being passed correctly
- Check CMS query handles user separation properly

### Debug Mode

Add this to your Custom Code component for debugging:

```jsx
// Add to PivotCMSHandlers component
const debugMode = true;

if (debugMode) {
  console.log('Current User ID:', currentUserId);
  console.log('Page Name:', pageName);
  console.log('Available Queries:', Object.keys($queries));
}
```

## Step 8: Production Deployment

### Before Going Live

1. **Test with multiple users** (different user IDs)
2. **Test cross-page persistence**
3. **Verify CMS permissions** are correct
4. **Test error handling** (disconnect internet, check graceful fallbacks)
5. **Performance test** with multiple tables

### Security Considerations

1. **User permissions**: Ensure users can only access their own configs
2. **Data validation**: Validate pivot configuration structure
3. **Rate limiting**: Consider limiting save frequency if needed 