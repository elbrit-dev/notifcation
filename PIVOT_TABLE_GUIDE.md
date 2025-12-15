# Pivot Table Guide for PrimeDataTable

The PrimeDataTable component now supports Excel-like pivot table functionality, allowing you to transform and aggregate your data dynamically. This guide explains how to configure and use the pivot table features.

## Overview

The pivot table feature works exactly like Excel's pivot tables:
- **Rows**: Fields that become row groupings (like Excel's "Rows" area)
- **Columns**: Fields that become column headers (like Excel's "Columns" area)  
- **Values**: Fields that get aggregated with functions like sum, count, average (like Excel's "Values" area)
- **Filters**: Coming soon - fields to filter the entire pivot table

## Basic Configuration

### Enable Pivot Table

```jsx
<PrimeDataTable
  data={yourData}
  enablePivotTable={true}
  pivotConfig={{
    enabled: true,
    rows: ["field1", "field2"],
    columns: ["field3"],
    values: [
      { field: "amount", aggregation: "sum" },
      { field: "quantity", aggregation: "count" }
    ]
  }}
/>
```

## Configuration Options

### pivotConfig Properties

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `enabled` | boolean | Enable/disable pivot table | `false` |
| `rows` | string[] | Fields to group rows by | `[]` |
| `columns` | string[] | Fields to create column headers from | `[]` |
| `values` | object[] | Fields to aggregate with aggregation functions | `[]` |
| `showGrandTotals` | boolean | Show grand total row | `true` |
| `showRowTotals` | boolean | Show row totals column | `true` |
| `showColumnTotals` | boolean | Show column totals | `true` |
| `numberFormat` | string | Number format locale | `'en-US'` |
| `currency` | string | Currency code for formatting | `'USD'` |
| `precision` | number | Decimal places for numbers | `2` |
| `fieldSeparator` | string | Separator for parsing complex field names | `'__'` |
| `sortRows` | boolean | Sort row values | `true` |
| `sortColumns` | boolean | Sort column values | `true` |
| `sortDirection` | string | Sort direction: 'asc' or 'desc' | `'asc'` |

### Value Configuration

Each value object in the `values` array should have:

```jsx
{
  field: "fieldName",        // The field to aggregate
  aggregation: "sum"         // Aggregation function
}
```

### Available Aggregation Functions

- `sum`: Sum all values
- `count`: Count non-null values
- `average`: Calculate average
- `min`: Find minimum value
- `max`: Find maximum value
- `first`: Get first value
- `last`: Get last value

## Examples

### Example 1: Basic Pivot (Sales by Team and Date)

```jsx
const salesData = [
  { team: "Team A", date: "2025-04-01", amount: 1000, deals: 5 },
  { team: "Team A", date: "2025-04-02", amount: 1500, deals: 7 },
  { team: "Team B", date: "2025-04-01", amount: 800, deals: 3 },
  { team: "Team B", date: "2025-04-02", amount: 1200, deals: 6 }
];

<PrimeDataTable
  data={salesData}
  enablePivotTable={true}
  pivotConfig={{
    enabled: true,
    rows: ["team"],           // Group by team
    columns: ["date"],        // Pivot on dates
    values: [
      { field: "amount", aggregation: "sum" },
      { field: "deals", aggregation: "sum" }
    ],
    showGrandTotals: true,
    showRowTotals: true
  }}
  currencyColumns={["amount"]}
/>
```

**Result**: Table showing teams as rows, dates as columns, with sum of amounts and deals.

### Example 2: Multiple Row Grouping

```jsx
<PrimeDataTable
  data={salesData}
  enablePivotTable={true}
  pivotConfig={{
    enabled: true,
    rows: ["region", "team", "salesperson"], // Multiple levels
    columns: ["month"],
    values: [
      { field: "revenue", aggregation: "sum" },
      { field: "revenue", aggregation: "average" }
    ]
  }}
/>
```

### Example 3: Simple Aggregation (No Column Pivoting)

```jsx
<PrimeDataTable
  data={salesData}
  enablePivotTable={true}
  pivotConfig={{
    enabled: true,
    rows: ["team"],
    columns: [],              // No column pivoting
    values: [
      { field: "amount", aggregation: "sum" },
      { field: "amount", aggregation: "average" },
      { field: "deals", aggregation: "count" }
    ]
  }}
/>
```

### Example 4: Working with Your Data Structure

Based on your data format with fields like "2025-04-01__serviceAmount":

```jsx
const yourData = [
  {
    drCode: "00000001",
    drName: "Yuvaraj",
    salesTeam: "Elbrit Coimbatore",
    "2025-04-01__serviceAmount": 0,
    "2025-04-01__supportValue": 16521,
    "2025-04-02__serviceAmount": 2500,
    "2025-04-02__supportValue": 18000
  }
  // ... more data
];

// Option 1: Transform your data first
const transformedData = yourData.flatMap(row => [
  {
    drName: row.drName,
    salesTeam: row.salesTeam,
    date: "2025-04-01",
    serviceAmount: row["2025-04-01__serviceAmount"],
    supportValue: row["2025-04-01__supportValue"]
  },
  {
    drName: row.drName,
    salesTeam: row.salesTeam,
    date: "2025-04-02", 
    serviceAmount: row["2025-04-02__serviceAmount"],
    supportValue: row["2025-04-02__supportValue"]
  }
]);

// Then use pivot table
<PrimeDataTable
  data={transformedData}
  enablePivotTable={true}
  pivotConfig={{
    enabled: true,
    rows: ["drName", "salesTeam"],
    columns: ["date"],
    values: [
      { field: "serviceAmount", aggregation: "sum" },
      { field: "supportValue", aggregation: "sum" }
    ]
  }}
/>
```

## Integration with Other Features

### Currency Formatting

Use `currencyColumns` prop to format specific columns as currency:

```jsx
<PrimeDataTable
  pivotConfig={{ ... }}
  currencyColumns={["serviceAmount", "supportValue"]}
/>
```

### Filtering and Search

Pivot tables work with all existing table features:

```jsx
<PrimeDataTable
  pivotConfig={{ ... }}
  enableSearch={true}
  enableColumnFilter={true}
  enableExport={true}
/>
```

### Column Grouping

You can still use column grouping with pivot tables for better organization:

```jsx
<PrimeDataTable
  pivotConfig={{ ... }}
  enableColumnGrouping={true}
  enableAutoColumnGrouping={true}
/>
```

## Tips and Best Practices

1. **Start Simple**: Begin with basic row grouping and one value field
2. **Performance**: Large datasets may take time to pivot - consider server-side pivoting for big data
3. **Data Quality**: Ensure your data is clean and consistent before pivoting
4. **Field Selection**: Choose meaningful fields for rows and columns that will create useful insights
5. **Aggregation Choice**: Pick the right aggregation function for your use case (sum for totals, average for rates, count for frequencies)

## Troubleshooting

### Common Issues

**Pivot table not showing data:**
- Check that `enabled: true` is set in pivotConfig
- Verify field names match your data structure exactly
- Ensure data is not empty

**Numbers not formatting correctly:**
- Use `currencyColumns` prop for currency formatting
- Check `numberFormat` and `precision` settings in pivotConfig

**Performance issues:**
- Consider reducing the number of unique values in column fields
- Limit the number of value aggregations
- Pre-filter your data before passing to the component

**Grand totals showing incorrect values:**
- Verify aggregation functions are appropriate for your data type
- Check for null/undefined values in your data

## Advanced Usage

### Custom Field Parsing

For complex field names like "2025-04-01__serviceAmount":

```jsx
pivotConfig={{
  fieldSeparator: "__",
  dateFieldPattern: /^\d{4}-\d{2}-\d{2}$/,
  parseFieldName: (fieldName) => {
    // Custom parsing logic
    if (fieldName.includes("__")) {
      const [date, metric] = fieldName.split("__");
      return { date, metric, originalField: fieldName };
    }
    return { originalField: fieldName };
  }
}}
```

This guide should help you get started with pivot tables in the PrimeDataTable component. The feature provides Excel-like functionality while maintaining all the existing table capabilities. 