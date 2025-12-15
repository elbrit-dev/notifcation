# Auto-Merge Guide for PrimeDataTable

## Overview

The `PrimeDataTable` component now supports automatic data merging for complex data structures. This is particularly useful when you have data in the format:

```javascript
{
  service: [...serviceRows],
  support: [...supportRows],
  inventory: [...inventoryRows],
  finance: [...financeRows],
  marketing: [...marketingRows],
  // ... any number of groups
}
```

## How It Works

### 1. Data Detection
The component automatically detects when your data is an object containing arrays (like `{service: [...], support: [...]}`) and needs merging.

### 2. Auto-Merge Process
- **Merges data** using your specified merge function
- **Preserves common fields** across different groups
- **Combines rows** based on matching keys
- **Adds group markers** for column grouping

### 3. Column Grouping
After merging, the component can automatically group columns based on:
- Group markers from merged data
- Column name patterns
- Custom group mappings

## Usage Examples

### Basic Auto-Merge

```jsx
<PrimeDataTable
  data={$queries.serviceVsSupport.data.response.data}
  enableAutoMerge={true}
  mergeConfig={{
    by: ["drCode", "date"],
    preserve: ["drName", "salesTeam"],
    autoDetectMergeFields: true
  }}
/>
```

### Auto-Merge with Column Grouping

```jsx
<PrimeDataTable
  data={$queries.serviceVsSupport.data.response.data}
  enableAutoMerge={true}
  enableColumnGrouping={true}
  enableAutoColumnGrouping={true}
  mergeConfig={{
    by: ["drCode", "date"],
    preserve: ["drName", "salesTeam", "hq"],
    autoDetectMergeFields: true
  }}
  groupConfig={{
    customGroupMappings: {
      service: "Service Revenue",
      support: "Support Revenue",
      inventory: "Inventory Management",
      finance: "Financial Data",
      marketing: "Marketing Activities"
    },
    ungroupedColumns: ["drCode", "drName", "salesTeam", "hq", "date"]
  }}
/>
```

### Auto-Merge with Pivot Table

```jsx
<PrimeDataTable
  data={$queries.serviceVsSupport.data.response.data}
  enableAutoMerge={true}
  enablePivotTable={true}
  mergeConfig={{
    by: ["drCode", "date"],
    preserve: ["drName", "salesTeam"],
    autoDetectMergeFields: true
  }}
  pivotConfig={{
    enabled: true,
    rows: ["drName", "salesTeam"],
    columns: ["date"],
    values: [
      { field: "serviceAmount", aggregation: "sum" },
      { field: "supportValue", aggregation: "sum" }
    ],
    showGrandTotals: true,
    showRowTotals: true
  }}
/>
```

## Configuration Options

### mergeConfig

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `by` | `string[]` | `[]` | Fields to merge by (e.g., `["drCode", "date"]`) |
| `preserve` | `string[]` | `[]` | Fields to preserve across merges |
| `autoDetectMergeFields` | `boolean` | `true` | Auto-detect merge fields |
| `mergeStrategy` | `string` | `"combine"` | Merge strategy (`"combine"` or `"replace"`) |

### Auto-Detection Logic

When `autoDetectMergeFields` is enabled, the component:

1. **Finds common fields** across all arrays
2. **Identifies merge fields** (fields containing "id", "code", "date", "key")
3. **Identifies preserve fields** (fields containing "name", "team", "hq", "location")

### groupConfig

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `customGroupMappings` | `object` | `{}` | Map group keys to display names |
| `ungroupedColumns` | `string[]` | `[]` | Columns that should not be grouped |

## Data Flow

### Input Data
```javascript
{
  service: [
    { drCode: "001", drName: "John", serviceAmount: 1000, date: "2025-01-01" },
    { drCode: "002", drName: "Jane", serviceAmount: 2000, date: "2025-01-01" }
  ],
  support: [
    { drCode: "001", drName: "John", supportValue: 500, date: "2025-01-01" },
    { drCode: "003", drName: "Bob", supportValue: 750, date: "2025-01-01" }
  ],
  inventory: [
    { drCode: "001", drName: "John", inventoryValue: 5000, date: "2025-01-01" },
    { drCode: "002", drName: "Jane", inventoryValue: 3000, date: "2025-01-01" }
  ],
  finance: [
    { drCode: "001", drName: "John", revenue: 15000, expenses: 5000, date: "2025-01-01" },
    { drCode: "002", drName: "Jane", revenue: 12000, expenses: 4000, date: "2025-01-01" }
  ]
}
```

### After Auto-Merge
```javascript
[
  {
    drCode: "001",
    drName: "John",
    serviceAmount: 1000,
    supportValue: 500,
    inventoryValue: 5000,
    revenue: 15000,
    expenses: 5000,
    date: "2025-01-01"
  },
  {
    drCode: "002",
    drName: "Jane",
    serviceAmount: 2000,
    inventoryValue: 3000,
    revenue: 12000,
    expenses: 4000,
    date: "2025-01-01"
  },
  {
    drCode: "003",
    drName: "Bob",
    supportValue: 750,
    date: "2025-01-01"
  }
]
```

### Column Grouping Result
The table will display:
- **Ungrouped columns**: `drCode`, `drName`, `date`
- **Service Revenue group**: `serviceAmount`
- **Support Revenue group**: `supportValue`
- **Inventory Management group**: `inventoryValue`
- **Financial Data group**: `revenue`, `expenses`

## Best Practices

1. **Use meaningful merge keys**: Choose fields that uniquely identify records
2. **Preserve important fields**: Include fields that should be consistent across groups
3. **Test with sample data**: Verify the merge logic works with your data structure
4. **Monitor performance**: Large datasets may need pagination or lazy loading
5. **Plan your group structure**: Consider how many groups you'll have and their relationships
6. **Use descriptive group names**: Make group names meaningful for better user experience

## Handling Multiple Groups

The auto-merge functionality works with any number of groups. Here are some common patterns:

### Business Groups
```javascript
{
  service: [...],      // Service-related data
  support: [...],      // Support-related data
  sales: [...],        // Sales data
  marketing: [...],    // Marketing data
  finance: [...],      // Financial data
  hr: [...],          // Human resources data
  it: [...],          // IT/Technology data
  operations: [...]    // Operations data
}
```

### Department Groups
```javascript
{
  northRegion: [...],   // North region data
  southRegion: [...],   // South region data
  eastRegion: [...],    // East region data
  westRegion: [...],    // West region data
  centralRegion: [...]  // Central region data
}
```

### Product Groups
```javascript
{
  productA: [...],      // Product A data
  productB: [...],      // Product B data
  productC: [...],      // Product C data
  accessories: [...],   // Accessories data
  services: [...]       // Services data
}
```

### Time-based Groups
```javascript
{
  q1Data: [...],        // Q1 data
  q2Data: [...],        // Q2 data
  q3Data: [...],        // Q3 data
  q4Data: [...],        // Q4 data
  yearlyData: [...]     // Yearly data
}
```

## Troubleshooting

### Common Issues

1. **No merge happening**: Check if `enableAutoMerge` is `true`
2. **Wrong merge fields**: Verify the `by` array contains valid field names
3. **Missing data**: Ensure `preserve` fields exist in your data
4. **Column grouping not working**: Check `enableColumnGrouping` and `enableAutoColumnGrouping`

### Debug Information

The component shows debug information in development mode, including:
- Merge configuration
- Auto-detected fields
- Group mappings
- Data transformation status

## Advanced Usage

### Custom Merge Function
You can also use the merge function directly:

```javascript
import { mergeData } from './components/PrimeDataTable';

const mergeFunction = mergeData(['drCode', 'date'], ['drName', 'salesTeam']);
const mergedData = mergeFunction($queries.serviceVsSupport.data.response.data);
```

### Manual Group Mapping
For complex grouping scenarios:

```jsx
groupConfig={{
  customGroupMappings: {
    service: "Service Revenue",
    support: "Support Revenue",
    inventory: "Inventory Management",
    warehouse: "Warehouse Operations"
  },
  ungroupedColumns: ["drCode", "drName", "salesTeam", "date", "hq"]
}}
``` 