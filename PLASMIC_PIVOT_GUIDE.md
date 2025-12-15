# Plasmic Pivot Table Configuration Guide

This guide explains how to configure the PrimeDataTable component's pivot table functionality through the Plasmic interface.

## Overview

The PrimeDataTable component now supports Excel-like pivot tables directly through Plasmic's visual interface. You can configure all pivot settings using individual props without writing code.

## Prop Registration

The following pivot table props have been registered in Plasmic and are available in the component's right panel:

## Basic Configuration

### 1. Enable Pivot Table

First, enable the pivot table functionality:

- **`enablePivotTable`** (Boolean): Set to `true` to enable pivot table mode

### 2. Configure Row Grouping

Define which fields will group your data into rows (like Excel's "Rows" area):

- **`pivotRows`** (Array): Field names to group by
  - Example: `["drName", "salesTeam"]`
  - This will create row groups by doctor name and sales team

### 3. Configure Column Pivoting

Define which fields will create column headers (like Excel's "Columns" area):

- **`pivotColumns`** (Array): Field names to pivot into columns
  - Example: `["date", "category"]`
  - This will create separate columns for each unique date and category combination

### 4. Configure Value Aggregation

Define which fields to aggregate and how (like Excel's "Values" area):

- **`pivotValues`** (Array of Objects): Value configuration
  - Example: 
    ```json
    [
      { "field": "serviceAmount", "aggregation": "sum" },
      { "field": "supportValue", "aggregation": "average" },
      { "field": "deals", "aggregation": "count" }
    ]
    ```

## Available Aggregation Functions

Use these in the `aggregation` field of `pivotValues`:

- `sum`: Sum all values
- `count`: Count non-null values  
- `average`: Calculate average
- `min`: Find minimum value
- `max`: Find maximum value
- `first`: Get first value
- `last`: Get last value

## Display Options

Control what totals and subtotals to show:

- **`pivotShowGrandTotals`** (Boolean): Show grand total row at bottom
- **`pivotShowRowTotals`** (Boolean): Show row totals column on right
- **`pivotShowColumnTotals`** (Boolean): Show column totals
- **`pivotShowSubTotals`** (Boolean): Show subtotals for grouped data

## Formatting Options

Customize number and currency formatting:

- **`pivotNumberFormat`** (String): Locale for number formatting
  - Examples: `"en-US"`, `"de-DE"`, `"fr-FR"`
  
- **`pivotCurrency`** (String): Currency code for formatting
  - Examples: `"USD"`, `"EUR"`, `"GBP"`, `"JPY"`
  
- **`pivotPrecision`** (Number): Decimal places for numbers
  - Example: `2` for two decimal places

## Sorting Options

Control how pivot data is sorted:

- **`pivotSortRows`** (Boolean): Sort row values alphabetically
- **`pivotSortColumns`** (Boolean): Sort column values alphabetically  
- **`pivotSortDirection`** (Choice): Sort direction
  - Options: `"asc"` (ascending) or `"desc"` (descending)

## Advanced Configuration

### Complex Field Names

If your data has complex field names like `"2025-04-01__serviceAmount"`:

- **`pivotFieldSeparator`** (String): Separator for parsing complex fields
  - Default: `"__"`
  - The component will split fields by this separator to extract meaningful parts

### Custom Aggregation Functions

For advanced users, you can provide custom aggregation functions:

- **`pivotAggregationFunctions`** (Object): Custom aggregation functions
  - Example: 
    ```json
    {
      "median": "function(values) { /* custom median calculation */ }",
      "variance": "function(values) { /* custom variance calculation */ }"
    }
    ```

## Practical Examples

### Example 1: Sales by Team and Date

**Configuration:**
```
enablePivotTable: true
pivotRows: ["salesTeam"]
pivotColumns: ["date"] 
pivotValues: [{"field": "amount", "aggregation": "sum"}]
pivotShowGrandTotals: true
pivotShowRowTotals: true
pivotCurrency: "USD"
```

**Result:** Table showing sales teams as rows, dates as columns, with sum of amounts

### Example 2: Doctor Performance Summary

**Configuration:**
```
enablePivotTable: true
pivotRows: ["drName", "salesTeam"]
pivotColumns: []
pivotValues: [
  {"field": "serviceAmount", "aggregation": "sum"},
  {"field": "supportValue", "aggregation": "sum"},
  {"field": "cases", "aggregation": "count"}
]
pivotShowGrandTotals: true
```

**Result:** Grouped summary by doctor and team with totals (no column pivoting)

### Example 3: Multi-Metric Analysis

**Configuration:**
```
enablePivotTable: true
pivotRows: ["region"]
pivotColumns: ["quarter"]
pivotValues: [
  {"field": "revenue", "aggregation": "sum"},
  {"field": "revenue", "aggregation": "average"},
  {"field": "deals", "aggregation": "count"}
]
pivotPrecision: 0
pivotCurrency: "USD"
```

**Result:** Regional performance by quarter with multiple metrics

## Step-by-Step Setup in Plasmic

1. **Add PrimeDataTable Component**
   - Drag PrimeDataTable from component library
   - Connect your data source

2. **Enable Pivot Mode**
   - In right panel, find "Pivot Table Props" section
   - Set `enablePivotTable` to `true`

3. **Configure Row Grouping**
   - Click on `pivotRows` field
   - Add array of field names: `["field1", "field2"]`

4. **Configure Column Pivoting** (optional)
   - Click on `pivotColumns` field  
   - Add array of field names: `["field3"]`

5. **Configure Values**
   - Click on `pivotValues` field
   - Add array of value objects:
     ```json
     [
       {"field": "amount", "aggregation": "sum"},
       {"field": "count", "aggregation": "count"}
     ]
     ```

6. **Configure Display Options**
   - Set totals options: `pivotShowGrandTotals`, `pivotShowRowTotals`
   - Set formatting: `pivotCurrency`, `pivotPrecision`

7. **Preview and Adjust**
   - Preview your pivot table
   - Adjust configuration as needed

## Data Integration

### Using with Plasmic Data Sources

The pivot table works seamlessly with Plasmic data sources:

1. **CMS Data**: Connect to your CMS and pivot the content
2. **API Data**: Fetch from REST APIs and create dynamic pivots
3. **Static Data**: Use static data for prototyping

### Using with Dynamic Data

For dynamic pivot configurations:

1. **User-Controlled Pivots**: Let users select row/column fields
2. **Dashboard Views**: Create different pivot views for different user roles
3. **Filtered Pivots**: Combine with Plasmic's filtering to create focused views

## Currency and Number Formatting

Don't forget to also configure the main table props for currency formatting:

- **`currencyColumns`**: Array of column keys to format as currency
  - Example: `["serviceAmount", "supportValue", "totalRevenue"]`

This ensures proper currency formatting for the aggregated values in your pivot table.

## Troubleshooting

### Common Issues in Plasmic

1. **Pivot not showing data**
   - Check that `enablePivotTable` is `true`
   - Verify field names match your data exactly
   - Ensure at least one value field is configured

2. **Numbers not formatting correctly**
   - Set `currencyColumns` for currency formatting
   - Check `pivotCurrency` and `pivotPrecision` settings

3. **Too many columns**
   - Limit unique values in `pivotColumns` fields
   - Consider grouping data before pivoting

4. **Performance issues**
   - Use server-side aggregation for large datasets
   - Limit the number of `pivotValues` configurations

## Best Practices

1. **Start Simple**: Begin with basic row grouping and one value field
2. **Test Incrementally**: Add complexity gradually
3. **Consider Data Volume**: Large datasets may need server-side pivoting
4. **User Experience**: Provide loading states for complex pivots
5. **Mobile Responsive**: Test pivot tables on mobile devices

This guide provides everything you need to create powerful pivot tables directly in Plasmic without writing any code! 