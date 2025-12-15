# Enhanced PrimeDataTable with Auto Column Grouping

## Overview

The PrimeDataTable component now supports intelligent auto-column grouping that can automatically detect patterns in your data column names and create beautiful grouped table headers. This is perfect for financial data, time-series data, or any data with logical groupings.

## Your Data Structure

Based on your example:
```javascript
const data = [
  {
    drCode: "00000001",
    drName: "Yuvaraj",
    salesTeam: "Elbrit Coimbatore",
    "2025-04-01__serviceAmount": 0,
    "2025-04-01__supportValue": 16521,
    "serviceAmount Total": 0,
    "supportValue Total": 16521
  }
];
```

## Quick Start

```jsx
import PrimeDataTable from './components/PrimeDataTable';

const MyTable = () => {
  const data = [
    {
      drCode: "00000001",
      drName: "Yuvaraj", 
      salesTeam: "Elbrit Coimbatore",
      "2025-04-01__serviceAmount": 0,
      "2025-04-01__supportValue": 16521,
      "serviceAmount Total": 0,
      "supportValue Total": 16521
    }
    // ... more data
  ];

  return (
    <PrimeDataTable
      data={data}
      enableColumnGrouping={true}
      enableAutoColumnGrouping={true}
      enableFooterTotals={true}
      
      // Configure which columns are numbers for proper formatting
      numberFilterColumns={[
        "2025-04-01__serviceAmount", 
        "2025-04-01__supportValue", 
        "serviceAmount Total", 
        "supportValue Total"
      ]}
      
      // Configure which columns should show as currency
      currencyColumns={[
        "2025-04-01__serviceAmount", 
        "2025-04-01__supportValue", 
        "serviceAmount Total", 
        "supportValue Total"
      ]}
      
      // Grouping configuration
      groupConfig={{
        enableHeaderGroups: true,
        enableFooterGroups: true,
        groupSeparator: '__', // Default separator
        ungroupedColumns: ['drCode', 'drName', 'salesTeam'], // These stay ungrouped
        totalColumns: ['serviceAmount Total', 'supportValue Total'], // These are totals
        headerGroupStyle: {
          backgroundColor: '#e3f2fd',
          fontWeight: 'bold',
          textAlign: 'center'
        }
      }}
      
      // Footer totals configuration
      footerTotalsConfig={{
        showTotals: true,
        showCounts: true,
        currency: 'USD',
        precision: 0
      }}
    />
  );
};
```

## How It Works

### Auto-Detection Rules

1. **Column Name Pattern**: `prefix__suffix`
   - `2025-04-01__serviceAmount` → Groups under "Service"
   - `2025-04-01__supportValue` → Groups under "Support"

2. **Group Detection**: Based on suffix keywords
   - Contains "service" → "Service" group
   - Contains "support" → "Support" group  
   - Contains "sales" → "Sales" group
   - Contains "marketing" → "Marketing" group

3. **Total Columns**: Automatically detected
   - Column name contains "total" (case-insensitive)
   - Explicitly listed in `totalColumns` config

4. **Ungrouped Columns**: 
   - No separator found
   - Listed in `ungroupedColumns` config

### Result Structure

Your table will automatically display like this:

```
┌─────────┬─────────┬──────────────┬───────────────────┬─────────────────────┬─────────┐
│ drCode  │ drName  │ salesTeam    │      Service      │       Support       │ Total   │
│         │         │              ├─────────┬─────────┼─────────┬───────────┤         │
│         │         │              │ 2025-04 │  Total  │ 2025-04 │   Total   │         │
├─────────┼─────────┼──────────────┼─────────┼─────────┼─────────┼───────────┼─────────┤
│00000001 │ Yuvaraj │ Elbrit...    │    0    │    0    │  16521  │   16521   │  16521  │
└─────────┴─────────┴──────────────┴─────────┴─────────┴─────────┴───────────┴─────────┘
```

## Advanced Configuration

### Custom Group Mappings

For words that aren't built-in (service, support, sales, marketing, etc.), use custom group mappings:

```jsx
groupConfig={{
  customGroupMappings: {
    "inventory": "Inventory Management",
    "warehouse": "Warehouse Operations", 
    "production": "Production",
    "quality": "Quality Control",
    "logistics": "Logistics",
    "procurement": "Procurement"
  }
}}
```

Then columns like:
- `Q1__inventoryCount` → Groups under "Inventory Management"
- `2025__warehouseCost` → Groups under "Warehouse Operations"
- `month__productionRate` → Groups under "Production"

### Custom Grouping Patterns

For more complex patterns, use regex-based grouping:

```jsx
groupConfig={{
  groupingPatterns: [
    {
      regex: '(\\d{4}-\\d{2}-\\d{2})__service.*',
      groupName: 'Service Revenue',
      subHeaderExtractor: (key) => {
        const parts = key.split('__');
        return `${parts[0]} - ${parts[1]}`;
      }
    },
    {
      regex: 'Q[1-4]__sales.*',
      groupName: 'Quarterly Sales',
      subHeaderExtractor: (key) => key.split('__')[0]
    }
  ]
}}
```

### Multiple Time Periods

```javascript
const multiPeriodData = [
  {
    drCode: "00000001",
    drName: "Yuvaraj",
    salesTeam: "Elbrit Coimbatore",
    "2025-04-01__serviceAmount": 0,
    "2025-04-01__supportValue": 16521,
    "2025-05-01__serviceAmount": 2500,
    "2025-05-01__supportValue": 18000,
    "serviceAmount Total": 2500,
    "supportValue Total": 34521
  }
];
```

### Different Categories

```javascript
const categoryData = [
  {
    drCode: "00000001",
    drName: "Yuvaraj",
    salesTeam: "Elbrit Coimbatore", 
    "Q1__salesAmount": 15000,
    "Q1__salesCount": 45,
    "Q1__marketingSpend": 3000,
    "Q1__marketingLeads": 120,
    "Q2__salesAmount": 18000,
    "Q2__salesCount": 52,
    "Q2__marketingSpend": 3500,
    "Q2__marketingLeads": 140
  }
];
```

## Configuration Options

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableColumnGrouping` | boolean | false | Enable column grouping feature |
| `enableAutoColumnGrouping` | boolean | false | Enable automatic group detection |
| `groupConfig` | object | {} | Grouping configuration object |

### groupConfig Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `groupSeparator` | string | '__' | Separator used to detect groups |
| `ungroupedColumns` | array | [] | Columns that should not be grouped |
| `totalColumns` | array | [] | Columns that represent totals |
| `groupingPatterns` | array | [] | Custom regex patterns for grouping |
| `customGroupMappings` | object | {} | Custom keyword to group name mappings |
| `enableHeaderGroups` | boolean | true | Show grouped headers |
| `enableFooterGroups` | boolean | true | Show grouped footers |
| `headerGroupStyle` | object | {} | CSS styles for group headers |
| `groupStyle` | object | {} | CSS styles for sub-headers |
| `footerGroupStyle` | object | {} | CSS styles for group footers |

### Styling Options

```jsx
groupConfig={{
  headerGroupStyle: {
    backgroundColor: '#e3f2fd',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1976d2'
  },
  groupStyle: {
    backgroundColor: '#f5f5f5',
    fontSize: '0.9em',
    fontWeight: '500'
  }
}}
```

## Production Ready Features

- ✅ **Automatic Group Detection**: Smart pattern recognition
- ✅ **Custom Group Patterns**: Regex-based custom grouping
- ✅ **Total Column Handling**: Automatic total detection and placement
- ✅ **Multi-Level Headers**: Beautiful nested header structure
- ✅ **Footer Totals**: Calculate and display totals per group
- ✅ **Responsive Design**: Works on all screen sizes  
- ✅ **Filtering & Sorting**: Full PrimeReact functionality preserved
- ✅ **Currency Formatting**: Proper number and currency display
- ✅ **Custom Styling**: Full control over appearance
- ✅ **TypeScript Support**: Full type safety
- ✅ **Performance Optimized**: Memoized calculations

## Common Use Cases

1. **Financial Reporting**: Revenue by period and category
2. **Sales Analytics**: Performance across time periods
3. **Project Management**: Task status across team members
4. **Inventory Management**: Stock levels by location and category
5. **Performance Metrics**: KPIs grouped by department and period

## Migration from Basic Tables

If you have existing PrimeDataTable usage, just add these props:

```jsx
// Add these to your existing PrimeDataTable
enableColumnGrouping={true}
enableAutoColumnGrouping={true}
groupConfig={{
  ungroupedColumns: ['id', 'name', 'status'], // Your basic columns
  groupSeparator: '__' // Or whatever separator you use
}}
```

## Debug Mode

In development, the component shows debug information to help you understand the grouping:

```jsx
// This will show detailed grouping information in development
<PrimeDataTable 
  data={data}
  enableColumnGrouping={true}
  enableAutoColumnGrouping={true}
  // ... other props
/>
```

The debug panel shows:
- Detected groups and their columns
- Ungrouped columns
- Group separator used
- Total columns detected

## Examples

See `examples/ColumnGroupingExample.js` for comprehensive examples covering:
- Basic auto-grouping
- Multi-period data
- Different business categories
- Custom grouping patterns
- Manual column groups

This enhanced PrimeDataTable component is production-ready and provides a seamless way to display complex grouped data with beautiful, professional-looking tables. 