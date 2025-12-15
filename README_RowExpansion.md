# Row Expansion Feature for PrimeDataTable

The Row Expansion feature allows you to create expandable rows in your DataTable, displaying nested data when a row is expanded. This is a native PrimeReact feature that has been enhanced and integrated into our `PrimeDataTable` component.

## Features

- ✅ **Expandable Rows**: Click to expand/collapse individual rows
- ✅ **Expand/Collapse All**: Buttons to expand or collapse all rows at once
- ✅ **Custom Templates**: Define custom content for expanded rows
- ✅ **Smart Validation**: Control which rows can be expanded
- ✅ **Nested DataTables**: Automatically handle nested data structures
- ✅ **Toast Notifications**: Get feedback when rows are expanded/collapsed
- ✅ **Flexible Positioning**: Place expansion column on left or right
- ✅ **Custom Styling**: Customize expansion column and button appearance

## Basic Usage

### Enable Row Expansion

```jsx
<PrimeDataTable
  data={productsWithOrders}
  enableRowExpansion={true}
  // ... other props
/>
```

### Simple Expansion Template

```jsx
<PrimeDataTable
  data={productsWithOrders}
  enableRowExpansion={true}
  rowExpansionTemplate={(data) => (
    <div className="p-3">
      <h5>Orders for {data.name}</h5>
      <p>This product has {data.orders.length} orders.</p>
    </div>
  )}
/>
```

### Advanced Expansion with Nested DataTable

```jsx
<PrimeDataTable
  data={productsWithOrders}
  enableRowExpansion={true}
  rowExpansionTemplate={(data) => (
    <div className="p-3">
      <h5>Orders for {data.name}</h5>
      {data.orders.length > 0 ? (
        <DataTable value={data.orders} showGridlines stripedRows>
          <Column field="id" header="Order ID" sortable />
          <Column field="customer" header="Customer" sortable />
          <Column field="date" header="Date" sortable />
          <Column 
            field="amount" 
            header="Amount" 
            sortable 
            body={(rowData) => formatCurrency(rowData.amount)}
          />
          <Column 
            field="status" 
            header="Status" 
            sortable 
            body={(rowData) => (
              <Tag 
                value={rowData.status.toLowerCase()} 
                severity={getOrderSeverity(rowData.status)} 
              />
            )}
          />
        </DataTable>
      ) : (
        <p className="text-muted">No orders for this product.</p>
      )}
    </div>
  )}
  allowExpansion={(rowData) => rowData.orders.length > 0}
  showExpandAllButtons={true}
  expandAllLabel="Expand All Products"
  collapseAllLabel="Collapse All Products"
/>
```

## Props Reference

### Basic Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableRowExpansion` | boolean | `false` | Enable/disable row expansion functionality |
| `expandedRows` | object | `null` | Object containing expanded row states |
| `dataKey` | string | `'id'` | Unique identifier for rows |

### Event Handlers

| Prop | Type | Description |
|------|------|-------------|
| `onRowToggle` | function | Callback when rows are expanded/collapsed |
| `onRowExpand` | function | Callback when a row is expanded |
| `onRowCollapse` | function | Callback when a row is collapsed |

### Templates and Validation

| Prop | Type | Description |
|------|------|-------------|
| `rowExpansionTemplate` | function | Function to render expanded content |
| `allowExpansion` | function | Function to determine if a row can be expanded |
| `validateExpansion` | function | Custom validation function for expansion |

### UI Customization

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `expansionColumnStyle` | object | `{ width: '5rem' }` | Style for the expansion column |
| `expansionColumnWidth` | string | `'5rem'` | Width of expansion column |
| `expansionColumnHeader` | string | `null` | Custom header for expansion column |
| `expansionColumnBody` | function | `null` | Custom body for expansion column |
| `expansionColumnPosition` | string | `'left'` | Position: `'left'` or `'right'` |

### Expand/Collapse All Buttons

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showExpandAllButtons` | boolean | `true` | Show expand/collapse all buttons |
| `expandAllLabel` | string | `"Expand All"` | Label for expand all button |
| `collapseAllLabel` | string | `"Collapse All"` | Label for collapse all button |
| `expansionButtonStyle` | object | `{}` | Style for expansion buttons |
| `expansionButtonClassName` | string | `""` | CSS class for expansion buttons |

### Icons and Animation

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `expandIcon` | string | `"pi pi-plus"` | Icon for expand button |
| `collapseIcon` | string | `"pi pi-minus"` | Icon for collapse button |
| `enableExpansionAnimation` | boolean | `true` | Enable expansion animations |

### Nested Data Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nestedDataConfig` | object | See below | Configuration for nested data display |

```jsx
nestedDataConfig = {
  enableNestedSorting: true,      // Enable sorting in nested tables
  enableNestedFiltering: true,    // Enable filtering in nested tables
  enableNestedPagination: false,  // Enable pagination in nested tables
  nestedPageSize: 10              // Page size for nested tables
}
```

## Data Structure

### Supported Nested Data Patterns

The component automatically detects and handles these nested data structures:

```jsx
// Pattern 1: orders array
{
  id: 1,
  name: "Product A",
  orders: [
    { id: 1001, customer: "John", amount: 100 },
    { id: 1002, customer: "Jane", amount: 150 }
  ]
}

// Pattern 2: children array
{
  id: 1,
  name: "Category A",
  children: [
    { id: 101, name: "Subcategory 1" },
    { id: 102, name: "Subcategory 2" }
  ]
}

// Pattern 3: subItems array
{
  id: 1,
  name: "Item A",
  subItems: [
    { id: 201, name: "Sub-item 1" },
    { id: 202, name: "Sub-item 2" }
  ]
}

// Pattern 4: nestedData array
{
  id: 1,
  name: "Data A",
  nestedData: [
    { id: 301, name: "Nested 1" },
    { id: 302, name: "Nested 2" }
  ]
}
```

## Examples

### Example 1: Product Orders

```jsx
const productsWithOrders = [
  {
    id: 1,
    name: "Bamboo Watch",
    category: "Accessories",
    price: 65,
    orders: [
      { id: 1001, customer: "John Doe", date: "2024-01-15", amount: 65, status: "DELIVERED" },
      { id: 1002, customer: "Jane Smith", date: "2024-01-20", amount: 65, status: "PENDING" }
    ]
  }
];

<PrimeDataTable
  data={productsWithOrders}
  enableRowExpansion={true}
  rowExpansionTemplate={(data) => (
    <div className="p-3">
      <h5>Orders for {data.name}</h5>
      <DataTable value={data.orders} showGridlines stripedRows>
        <Column field="id" header="Order ID" sortable />
        <Column field="customer" header="Customer" sortable />
        <Column field="date" header="Date" sortable />
        <Column field="amount" header="Amount" sortable />
        <Column field="status" header="Status" sortable />
      </DataTable>
    </div>
  )}
  allowExpansion={(rowData) => rowData.orders.length > 0}
/>
```

### Example 2: Hierarchical Categories

```jsx
const categories = [
  {
    id: 1,
    name: "Electronics",
    children: [
      { id: 101, name: "Computers", count: 50 },
      { id: 102, name: "Phones", count: 30 },
      { id: 103, name: "Tablets", count: 20 }
    ]
  }
];

<PrimeDataTable
  data={categories}
  enableRowExpansion={true}
  rowExpansionTemplate={(data) => (
    <div className="p-3">
      <h5>Subcategories in {data.name}</h5>
      <DataTable value={data.children} showGridlines stripedRows>
        <Column field="name" header="Subcategory" sortable />
        <Column field="count" header="Product Count" sortable />
      </DataTable>
    </div>
  )}
  allowExpansion={(rowData) => rowData.children && rowData.children.length > 0}
/>
```

### Example 3: Custom Expansion Validation

```jsx
<PrimeDataTable
  data={complexData}
  enableRowExpansion={true}
  validateExpansion={(rowData) => {
    // Only allow expansion for rows with specific conditions
    return rowData.status === 'active' && 
           rowData.hasDetails === true && 
           rowData.details && 
           rowData.details.length > 0;
  }}
  rowExpansionTemplate={(data) => (
    <div className="p-3">
      <h5>Details for {data.name}</h5>
      {/* Custom expansion content */}
    </div>
  )}
/>
```

### Example 4: Custom Expansion Column

```jsx
<PrimeDataTable
  data={data}
  enableRowExpansion={true}
  expansionColumnHeader="Details"
  expansionColumnBody={(rowData) => (
    <Button 
      icon={rowData.isExpanded ? "pi pi-minus" : "pi pi-plus"}
      size="small"
      className="p-button-text"
    />
  )}
  expansionColumnPosition="right"
  expansionColumnWidth="6rem"
/>
```

## Integration with Other Features

### With Column Grouping

```jsx
<PrimeDataTable
  data={data}
  enableRowExpansion={true}
  enableColumnGrouping={true}
  // Row expansion works seamlessly with column grouping
/>
```

### With Pivot Tables

```jsx
<PrimeDataTable
  data={data}
  enableRowExpansion={true}
  enablePivotTable={true}
  // Row expansion works with pivot tables
/>
```

### With Inline Editing

```jsx
<PrimeDataTable
  data={data}
  enableRowExpansion={true}
  enableInlineEditing={true}
  // Row expansion works with inline editing
/>
```

## Best Practices

### 1. Performance Considerations

- Use `allowExpansion` to limit which rows can be expanded
- Keep expansion templates lightweight
- Consider lazy loading for large nested datasets

### 2. User Experience

- Provide clear visual indicators for expandable rows
- Use meaningful labels for expand/collapse buttons
- Include toast notifications for user feedback

### 3. Data Structure

- Use consistent nested data patterns
- Ensure unique identifiers for all data levels
- Structure data to minimize nesting depth

### 4. Accessibility

- Provide keyboard navigation support
- Use semantic HTML in expansion templates
- Include ARIA labels where appropriate

## Troubleshooting

### Common Issues

1. **Expansion not working**: Check if `enableRowExpansion` is set to `true`
2. **No expansion column**: Verify that `allowExpansion` function returns `true` for some rows
3. **Template not rendering**: Ensure `rowExpansionTemplate` function returns valid JSX
4. **Performance issues**: Use `validateExpansion` to limit expandable rows

### Debug Information

The component provides debug information when using the hook:

```jsx
const rowExpansion = useRowExpansion({...});

console.log('Row Expansion Debug:', {
  isEnabled: rowExpansion.isEnabled,
  hasExpansionColumn: rowExpansion.hasExpansionColumn,
  hasExpansionHeader: rowExpansion.hasExpansionHeader,
  expandedRowsCount: Object.keys(rowExpansion.expandedRows).length
});
```

## Migration from PrimeReact

If you're migrating from a standard PrimeReact DataTable with row expansion:

```jsx
// Before (PrimeReact)
<DataTable 
  value={data} 
  expandedRows={expandedRows}
  onRowToggle={(e) => setExpandedRows(e.data)}
  rowExpansionTemplate={template}
>
  <Column expander style={{ width: '5rem' }} />
  {/* other columns */}
</DataTable>

// After (PrimeDataTable)
<PrimeDataTable
  data={data}
  enableRowExpansion={true}
  expandedRows={expandedRows}
  onRowToggle={(e) => setExpandedRows(e.data)}
  rowExpansionTemplate={template}
  // All other features automatically available
/>
```

## Conclusion

The Row Expansion feature provides a powerful way to display hierarchical and nested data in your tables. It's fully integrated with all other PrimeDataTable features and follows the same architectural patterns as other components in the library.

For more examples and advanced usage patterns, see the `examples/RowExpansionExample.jsx` file.
