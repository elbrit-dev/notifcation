# Enhanced Row Expansion for PrimeDataTable

## Overview

The PrimeDataTable component now includes enhanced row expansion functionality that automatically detects nested data structures and renders them as dynamic, responsive DataTables. This feature provides a powerful way to display hierarchical data with automatic column detection and formatting.

## Features

### 🚀 **Automatic Nested Table Generation**
- **Smart Detection**: Automatically detects arrays and objects in your data
- **Dynamic Columns**: Generates columns based on the first item in arrays
- **Type-Aware Rendering**: Automatically formats different data types (numbers, dates, booleans, etc.)

### 🎯 **Expand/Collapse Controls**
- **Expand All**: Expand all expandable rows at once
- **Collapse All**: Collapse all expanded rows at once
- **Smart Expansion**: Only shows expansion controls for rows with expandable content

### 🎨 **Enhanced UI/UX**
- **Responsive Design**: Nested tables adapt to different screen sizes
- **Visual Indicators**: Clear expansion/collapse icons with hover effects
- **Professional Styling**: Consistent with PrimeReact design system

### 🔧 **Flexible Configuration**
- **Custom Templates**: Override default expansion behavior with custom templates
- **External Control**: Control expanded state from parent components
- **Event Callbacks**: Hook into expansion/collapse events

## Usage

### Basic Implementation

```jsx
import React, { useState } from 'react';
import PrimeDataTable from './components/PrimeDataTable';

export default function MyComponent() {
  const [expandedRows, setExpandedRows] = useState({});
  
  const data = [
    {
      id: 1,
      name: 'Product A',
      orders: [
        { orderId: 'ORD-001', customer: 'Customer A', amount: 100 },
        { orderId: 'ORD-002', customer: 'Customer B', amount: 200 }
      ],
      inventory: [
        { warehouse: 'Main', stock: 50, location: 'Zone A' }
      ]
    }
  ];

  return (
    <PrimeDataTable
      data={data}
      enableRowExpansion={true}
      expandedRows={expandedRows}
      onRowToggle={(e) => setExpandedRows(e.data)}
    />
  );
}
```

### Advanced Configuration

```jsx
<PrimeDataTable
  data={data}
  enableRowExpansion={true}
  expandedRows={expandedRows}
  onRowToggle={handleRowToggle}
  
  // Custom expansion template
  rowExpansionTemplate={(data) => (
    <div className="custom-expansion">
      <h3>Custom Expansion for {data.name}</h3>
      {/* Your custom content */}
    </div>
  )}
  
  // Row expansion callbacks
  onRowExpand={(e) => console.log('Row expanded:', e.data)}
  onRowCollapse={(e) => console.log('Row collapsed:', e.data)}
/>
```

## Data Structure Support

### Supported Nested Types

1. **Arrays of Objects** (Most Common)
   ```javascript
   orders: [
     { orderId: '001', customer: 'A', amount: 100 },
     { orderId: '002', customer: 'B', amount: 200 }
   ]
   ```

2. **Arrays of Primitives**
   ```javascript
   tags: ['urgent', 'high-priority', 'featured']
   ```

3. **Nested Objects**
   ```javascript
   metadata: {
     created: '2025-01-01',
     updated: '2025-01-15',
     author: 'John Doe'
   }
   ```

4. **Mixed Types**
   ```javascript
   details: {
     description: 'Product description',
     specifications: ['Spec 1', 'Spec 2'],
     pricing: { base: 100, discount: 0.1 }
   }
   ```

### Automatic Column Detection

The component automatically detects and formats columns based on data types:

- **Numbers**: Formatted with locale-specific number formatting
- **Dates**: Formatted as readable date strings
- **Booleans**: Displayed as Yes/No with color coding
- **Arrays**: Show first 3 items with "+X more" indicator
- **Objects**: Displayed as formatted JSON (truncated for readability)

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableRowExpansion` | boolean | `false` | Enable row expansion functionality |
| `expandedRows` | object | `{}` | Control expanded rows state externally |
| `onRowToggle` | function | `undefined` | Callback when rows are expanded/collapsed |
| `rowExpansionTemplate` | function | `undefined` | Custom template for expanded content |

### Events

| Event | Parameters | Description |
|-------|------------|-------------|
| `onRowToggle` | `{ data: object }` | Fired when expansion state changes |
| `onRowExpand` | `{ data: object }` | Fired when a row is expanded |
| `onRowCollapse` | `{ data: object }` | Fired when a row is collapsed |

### State Management

The component maintains internal state for:
- `localExpandedRows`: Current expansion state
- `expandedRowsData`: Cached data for expanded rows
- Expansion/collapse animations and transitions

## Styling

### CSS Classes

- `.nested-expansion-table`: Main nested table container
- `.row-expansion-content`: Expansion content wrapper
- `.p-row-expander`: Expansion/collapse button
- `.p-row-expander-expanded`: Expanded state styling

### Customization

```css
/* Custom nested table styling */
.nested-expansion-table {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Custom expansion button */
.p-row-expander {
  color: #10b981;
  font-size: 1.2rem;
}
```

## Performance Considerations

### Optimization Features

- **Lazy Rendering**: Nested tables are only rendered when expanded
- **Data Caching**: Expanded row data is cached to prevent re-fetching
- **Virtual Scrolling**: Automatic for large datasets (>1000 rows)
- **Debounced Updates**: Expansion state updates are optimized

### Best Practices

1. **Limit Nested Data Size**: Keep nested arrays under 1000 items
2. **Use Pagination**: Implement pagination for very large datasets
3. **Optimize Data Structure**: Flatten data when possible
4. **Monitor Memory**: Large nested structures can impact performance

## Examples

### E-commerce Orders

```javascript
const orderData = [
  {
    id: 1,
    customer: 'John Doe',
    total: 299.99,
    orders: [
      {
        orderId: 'ORD-001',
        product: 'Laptop',
        quantity: 1,
        price: 299.99,
        status: 'SHIPPED'
      }
    ],
    shipping: {
      address: '123 Main St',
      method: 'Express',
      tracking: 'TRK123456'
    }
  }
];
```

### Inventory Management

```javascript
const inventoryData = [
  {
    id: 1,
    product: 'Widget A',
    totalStock: 500,
    locations: [
      { warehouse: 'Main', stock: 300, aisle: 'A1' },
      { warehouse: 'Secondary', stock: 200, aisle: 'B2' }
    ],
    suppliers: [
      { name: 'Supplier A', leadTime: 7, cost: 10.50 },
      { name: 'Supplier B', leadTime: 14, cost: 9.75 }
    ]
  }
];
```

## Troubleshooting

### Common Issues

1. **Rows Not Expanding**
   - Check if `enableRowExpansion={true}`
   - Verify data has nested arrays/objects
   - Ensure `allowExpansion` function returns true

2. **Performance Issues**
   - Reduce nested data size
   - Enable virtual scrolling for large datasets
   - Use pagination

3. **Styling Problems**
   - Import required CSS files
   - Check for CSS conflicts
   - Verify Tailwind CSS is configured

### Debug Mode

Enable debug logging to troubleshoot issues:

```javascript
// Add to your component
useEffect(() => {
  console.log('Expanded Rows:', expandedRows);
  console.log('Expanded Data:', expandedRowsData);
}, [expandedRows, expandedRowsData]);
```

## Migration Guide

### From Basic Row Expansion

```javascript
// Before (Basic)
<DataTable
  expandedRows={expandedRows}
  onRowToggle={handleToggle}
  rowExpansionTemplate={customTemplate}
/>

// After (Enhanced)
<PrimeDataTable
  enableRowExpansion={true}
  expandedRows={expandedRows}
  onRowToggle={handleToggle}
  rowExpansionTemplate={customTemplate} // Optional override
/>
```

### From Custom Expansion Logic

```javascript
// Before (Manual)
const customExpansion = (data) => {
  if (data.orders) {
    return <OrdersTable data={data.orders} />;
  }
  return null;
};

// After (Automatic)
// No custom template needed - automatic detection and rendering
```

## Future Enhancements

- **Multi-level Expansion**: Support for nested expansions (expand within expanded rows)
- **Custom Column Renderers**: Allow custom cell rendering for nested tables
- **Export Support**: Include expanded data in exports
- **Search Integration**: Search within expanded content
- **Drag & Drop**: Reorder expanded content

## Contributing

To contribute to the enhanced row expansion functionality:

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests and documentation
5. Submit a pull request

## License

This enhanced row expansion functionality is part of the PrimeDataTable component and follows the same license terms.
