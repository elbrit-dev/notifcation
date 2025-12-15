# Automatic Row Expansion for PrimeDataTable

## Overview

The PrimeDataTable now includes **automatic row expansion** that requires zero configuration. Simply enable the feature and the table will automatically detect nested data structures and provide expandable rows.

## Features

✅ **Zero Configuration Required** - Just set `enableRowExpansion={true}`  
✅ **Automatic Data Detection** - Detects nested data in multiple formats  
✅ **Smart Column Generation** - Auto-generates columns for nested data  
✅ **Expand/Collapse All** - Built-in expand/collapse all functionality  
✅ **Customizable Styling** - Control expansion column appearance  
✅ **Nested DataTable Support** - Shows nested data in a proper DataTable format  

## Supported Nested Data Patterns

The table automatically detects these nested data structures:

```javascript
// Pattern 1: invoices
{
  id: 1,
  name: "Customer A",
  invoices: [
    { id: "INV-001", amount: 100, date: "2024-01-01" },
    { id: "INV-002", amount: 200, date: "2024-01-02" }
  ]
}

// Pattern 2: orders
{
  id: 2,
  name: "Customer B",
  orders: [
    { id: "ORD-001", product: "Product A", quantity: 2 },
    { id: "ORD-002", product: "Product B", quantity: 1 }
  ]
}

// Pattern 3: children
{
  id: 3,
  name: "Parent C",
  children: [
    { name: "Child 1", age: 5 },
    { name: "Child 2", age: 8 }
  ]
}

// Pattern 4: subItems
{
  id: 4,
  name: "Item D",
  subItems: [
    { name: "Sub Item 1", value: 10 },
    { name: "Sub Item 2", value: 20 }
  ]
}

// Pattern 5: nestedData
{
  id: 5,
  name: "Data E",
  nestedData: [
    { field1: "Value 1", field2: "Value 2" },
    { field1: "Value 3", field2: "Value 4" }
  ]
}
```

## Basic Usage

```jsx
import PrimeDataTable from './components/PrimeDataTable';

const MyComponent = () => {
  const data = [
    {
      id: 1,
      name: "Customer A",
      invoices: [
        { id: "INV-001", amount: 100, status: "Paid" },
        { id: "INV-002", amount: 200, status: "Pending" }
      ]
    }
  ];

  return (
    <PrimeDataTable
      data={data}
      enableRowExpansion={true}  // That's it! No other configuration needed
    />
  );
};
```

## Advanced Configuration

```jsx
<PrimeDataTable
  data={data}
  enableRowExpansion={true}
  
  // Expansion column styling
  expansionColumnStyle={{ width: '4rem' }}
  expansionColumnWidth="4rem"
  expansionColumnPosition="left" // 'left' or 'right'
  
  // Expand/Collapse all buttons
  showExpandAllButtons={true}
  expandAllLabel="Expand All Customers"
  collapseAllLabel="Collapse All Customers"
  expansionButtonStyle={{ color: 'blue' }}
  expansionButtonClassName="custom-button-class"
  
  // Nested data configuration
  nestedDataConfig={{
    enableNestedSorting: true,
    enableNestedFiltering: true,
    enableNestedPagination: false,
    nestedPageSize: 10
  }}
/>
```

## How It Works

1. **Data Detection**: When `enableRowExpansion={true}`, the table scans each row for nested arrays
2. **Expansion Icons**: Rows with nested data automatically show expansion icons
3. **Content Generation**: Expansion content is auto-generated based on the nested data structure
4. **Column Auto-Detection**: Columns are automatically created based on the first nested item
5. **Smart Labeling**: The table automatically detects what type of data is nested (invoices, orders, etc.)

## Custom Expansion Templates

You can still provide custom expansion templates if needed:

```jsx
<PrimeDataTable
  data={data}
  enableRowExpansion={true}
  rowExpansionTemplate={(rowData) => (
    <div className="custom-expansion">
      <h3>Custom content for {rowData.name}</h3>
      {/* Your custom content */}
    </div>
  )}
/>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableRowExpansion` | boolean | false | Enable automatic row expansion |
| `expansionColumnStyle` | object | `{ width: '5rem' }` | Style for expansion column |
| `expansionColumnWidth` | string | '5rem' | Width of expansion column |
| `expansionColumnPosition` | string | 'left' | Position: 'left' or 'right' |
| `showExpandAllButtons` | boolean | true | Show expand/collapse all buttons |
| `expandAllLabel` | string | "Expand All" | Label for expand all button |
| `collapseAllLabel` | string | "Collapse All" | Label for collapse all button |
| `nestedDataConfig` | object | See below | Configuration for nested data |

### Nested Data Config

```javascript
nestedDataConfig = {
  enableNestedSorting: true,      // Enable sorting in nested tables
  enableNestedFiltering: true,    // Enable filtering in nested tables
  enableNestedPagination: false,  // Enable pagination in nested tables
  nestedPageSize: 10              // Page size for nested tables
}
```

## Examples

### Basic Customer Table with Invoices

```jsx
const customerData = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    invoices: [
      { id: "INV-001", amount: 150.00, date: "2024-01-15", status: "Paid" },
      { id: "INV-002", amount: 75.50, date: "2024-01-20", status: "Pending" }
    ]
  }
];

<PrimeDataTable
  data={customerData}
  enableRowExpansion={true}
  showExpandAllButtons={true}
  expandAllLabel="Expand All Customers"
  collapseAllLabel="Collapse All Customers"
/>
```

### Product Table with Orders

```jsx
const productData = [
  {
    id: 1,
    name: "Product A",
    category: "Electronics",
    orders: [
      { customer: "Customer 1", quantity: 2, total: 100 },
      { customer: "Customer 2", quantity: 1, total: 50 }
    ]
  }
];

<PrimeDataTable
  data={productData}
  enableRowExpansion={true}
  expansionColumnPosition="right"
  nestedDataConfig={{
    enableNestedSorting: true,
    enableNestedFiltering: true,
    enableNestedPagination: true,
    nestedPageSize: 5
  }}
/>
```

## Benefits

1. **Zero Setup Time** - No need to configure expansion logic
2. **Automatic Detection** - Works with any nested data structure
3. **Consistent UI** - All expansions look and behave the same
4. **Maintainable** - No custom expansion code to maintain
5. **Flexible** - Still supports custom templates when needed
6. **Performance** - Optimized for large datasets

## Migration from Manual Configuration

If you were previously using manual row expansion configuration:

**Before (Manual):**
```jsx
<PrimeDataTable
  data={data}
  enableRowExpansion={true}
  rowExpansionTemplate={(rowData) => (
    <div>Custom expansion content</div>
  )}
  allowExpansion={(rowData) => rowData.invoices?.length > 0}
  // ... many other props
/>
```

**After (Automatic):**
```jsx
<PrimeDataTable
  data={data}
  enableRowExpansion={true}
  // That's it! Everything else is automatic
/>
```

## Troubleshooting

### Rows Not Expanding

1. Check that `enableRowExpansion={true}`
2. Verify your data has nested arrays (invoices, orders, children, etc.)
3. Ensure nested arrays contain objects, not primitive values

### Performance Issues

1. Use `nestedDataConfig.enableNestedPagination={true}` for large nested datasets
2. Consider limiting nested data size in your data source
3. Use `nestedPageSize` to control how many nested items are shown

### Custom Styling

1. Use `expansionColumnStyle` to customize the expansion column
2. Use `expansionButtonStyle` and `expansionButtonClassName` for button styling
3. Override with custom CSS classes as needed

## Best Practices

1. **Use Descriptive Field Names**: Use clear names like `invoices`, `orders`, `children` for better auto-detection
2. **Consistent Data Structure**: Keep nested data structure consistent across rows
3. **Limit Nested Data Size**: For performance, consider paginating very large nested datasets
4. **Test with Real Data**: Always test with your actual data structure

## Conclusion

The automatic row expansion feature eliminates the need for manual configuration while providing a rich, interactive experience. Simply enable it and let the table handle the rest!
