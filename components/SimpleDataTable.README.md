# SimpleDataTable Component

A clean, simplified version of PrimeDataTable with essential features and customizable UI components.

## Features

✅ **Basic Table Features**
- Sorting (column-wise)
- Pagination
- Global search
- Responsive design with em/rem units

✅ **Row Expansion**
- Auto-detection of nested data
- Custom expansion templates
- Single toggle button for expand/collapse all
- Expander icon integrated into first column (no separate column)

✅ **Dual Filter System**
- Native PrimeReact filters (default)
- Custom column-wise filters (optional)
- Toggle between native and custom filters
- Search-only mode: Simple text search inputs only - no filter menu icons, just type to filter

✅ **Dual Toolbar System**
- Native PrimeReact toolbar (default)
- Custom toolbar with better UX (optional)
- Toggle between native and custom toolbar
- Built-in Export to Excel button (CSV format)

✅ **Responsive Design**
- All sizing in em/rem units
- Mobile-friendly breakpoints
- Scales properly across different screen sizes

✅ **Equal Column Widths (Default)**
- All columns get the same fixed width (9.5rem / 152px)
- No congested or squeezed columns
- Consistent width regardless of number of columns
- Toggleable - can be disabled for auto-sizing
- Filter search bars: 9rem width for optimal fit

## Installation

```bash
npm install primereact primeicons lucide-react
```

## Basic Usage

```jsx
import SimpleDataTable from './components/SimpleDataTable';

const MyComponent = () => {
  const data = [
    { id: 1, name: 'John Doe', age: 30, city: 'New York' },
    { id: 2, name: 'Jane Smith', age: 25, city: 'London' },
    { id: 3, name: 'Bob Johnson', age: 35, city: 'Paris' }
  ];

  return (
    <SimpleDataTable 
      data={data}
      enableSearch={true}
      enableSorting={true}
      enablePagination={true}
    />
  );
};
```

## Props Reference

### Data Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | Array | `[]` | Array of data objects to display |
| `columns` | Array | `[]` | Column definitions (auto-generated if not provided) |
| `loading` | Boolean | `false` | Show loading state |
| `dataKey` | String | `'id'` | Unique identifier for rows (auto-detected if not provided) |

### Feature Toggles

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableSearch` | Boolean | `true` | Enable global search functionality |
| `enableSorting` | Boolean | `true` | Enable column sorting |
| `enablePagination` | Boolean | `true` | Enable pagination |
| `enableRowExpansion` | Boolean | `false` | Enable row expansion for nested data |
| `useCustomFilters` | Boolean | `false` | Use custom filters instead of native PrimeReact filters |
| `useCustomToolbar` | Boolean | `false` | Use custom toolbar instead of native PrimeReact toolbar |
| `searchOnlyFilters` | Boolean | `false` | Force all filters to be simple text search (no filter menu icon, type to filter) |
| `equalColumnWidths` | Boolean | `true` | Give all columns fixed equal width (9.5rem / 152px) |

### Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pageSize` | Number | `10` | Number of rows per page |
| `pageSizeOptions` | Array | `[5, 10, 25, 50]` | Options for rows per page dropdown |
| `tableSize` | String | `"normal"` | Table size: `"small"`, `"normal"`, or `"large"` |
| `responsiveLayout` | String | `"scroll"` | PrimeReact responsive layout mode |

### Row Expansion

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rowExpansionTemplate` | Function | `null` | Custom template for expanded rows |
| `nestedDataKey` | String | `'items'` | Key name for nested data in rows |

### Styling

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | String | `""` | CSS class name for wrapper |
| `style` | Object | `{}` | Inline styles for wrapper |

### Callbacks

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onRowClick` | Function | `null` | Callback when row is clicked: `(data, index) => {}` |
| `onRefresh` | Function | `null` | Callback for refresh button: `() => {}` |

## Usage Examples

### 1. Basic Table with Auto-Generated Columns

```jsx
<SimpleDataTable 
  data={myData}
  enableSearch={true}
  enableSorting={true}
  enablePagination={true}
/>
```

### 2. Table with Custom Columns

```jsx
const columns = [
  { 
    key: 'name', 
    title: 'Full Name', 
    sortable: true, 
    filterable: true,
    type: 'text'
  },
  { 
    key: 'age', 
    title: 'Age', 
    sortable: true, 
    filterable: true,
    type: 'number'
  },
  { 
    key: 'status', 
    title: 'Status', 
    sortable: true, 
    filterable: true,
    type: 'dropdown' // Will show dropdown filter
  }
];

<SimpleDataTable 
  data={myData}
  columns={columns}
/>
```

### 3. Table with Custom Filters (Toggle Mode)

```jsx
<SimpleDataTable 
  data={myData}
  useCustomFilters={true} // Enable custom filters
  enableSearch={true}
/>
```

**Benefits of Custom Filters:**
- Better UX with dedicated filter row
- Cleaner layout
- All filters visible at once
- Easy to clear individual filters

### 4. Table with Custom Toolbar (Toggle Mode)

```jsx
<SimpleDataTable 
  data={myData}
  useCustomToolbar={true} // Enable custom toolbar
  enableSearch={true}
  onRefresh={handleRefresh}
/>
```

**Benefits of Custom Toolbar:**
- Modern, clean design
- Better responsive behavior
- Clear visual hierarchy
- Improved spacing and alignment

### 5. Table with Search-Only Filters (Simple and Consistent)

```jsx
<SimpleDataTable 
  data={myData}
  searchOnlyFilters={true} // All filters become simple text search inputs
  enableSorting={true}
/>
```

**Benefits of Search-Only Filters:**
- **No filter menu icon** - Just a clean search input
- **Type to filter** - Results update as you type
- Consistent UX across all column types (no dropdowns, calendars, or number inputs)
- Simpler and more intuitive for users
- Works with both native and custom filter modes
- Reduces cognitive load - one filter type for everything
- Automatically converts all data types to text for searching

### 6. Table with Equal Column Widths (Default)

```jsx
<SimpleDataTable 
  data={myData}
  equalColumnWidths={true} // All columns get 9.5rem (152px) width (default: true)
  enableSorting={true}
/>
```

**Benefits of Equal Column Widths:**
- **Fixed width**: Every column is exactly **9.5rem (152px)** wide
- No congested columns - every column has the same space
- Clean, organized appearance
- Consistent regardless of number of columns (3 columns or 10 columns)
- Better visual consistency across the table
- Prevents some columns from being squeezed while others are too wide
- Horizontal scrolling activates automatically if many columns
- Filter search bars are 9rem - perfectly sized for column width

**To disable** (let columns auto-size):
```jsx
<SimpleDataTable 
  data={myData}
  equalColumnWidths={false} // Let columns auto-size based on content
/>
```

### 7. Export to Excel

The table includes a built-in **Export to Excel** button in the toolbar (both custom and native):

```jsx
<SimpleDataTable 
  data={myData}
  useCustomToolbar={true}  // Or use native toolbar
  enableSorting={true}
/>
```

**Export Features:**
- ✅ **One-click export** - Button in toolbar (both custom and native)
- ✅ **CSV format** - Opens directly in Excel
- ✅ **Filtered data** - Exports only the visible/filtered data
- ✅ **Auto-filename** - Includes current date (e.g., `table_export_2025-11-11.csv`)
- ✅ **Handles special characters** - Properly escapes commas, quotes, and newlines
- ✅ **UTF-8 BOM** - Ensures proper encoding in Excel

**How it works:**
1. Click the green "Export" button with Excel icon
2. File downloads automatically
3. Open with Excel, Google Sheets, or any spreadsheet application

### 8. Table with Row Expansion

```jsx
const dataWithNested = [
  {
    id: 1,
    name: 'Order #1001',
    total: 500,
    items: [ // Nested data
      { id: 1, product: 'Product A', quantity: 2, price: 100 },
      { id: 2, product: 'Product B', quantity: 3, price: 100 }
    ]
  },
  {
    id: 2,
    name: 'Order #1002',
    total: 300,
    items: [
      { id: 3, product: 'Product C', quantity: 1, price: 300 }
    ]
  }
];

<SimpleDataTable 
  data={dataWithNested}
  enableRowExpansion={true}
  nestedDataKey="items" // Key for nested data
/>
```

### 6. Table with Custom Row Expansion Template

```jsx
const customExpansionTemplate = (rowData) => {
  return (
    <div style={{ padding: '1rem', backgroundColor: '#f9fafb' }}>
      <h4>Details for {rowData.name}</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <strong>Email:</strong> {rowData.email}
        </div>
        <div>
          <strong>Phone:</strong> {rowData.phone}
        </div>
        <div>
          <strong>Address:</strong> {rowData.address}
        </div>
        <div>
          <strong>City:</strong> {rowData.city}
        </div>
      </div>
    </div>
  );
};

<SimpleDataTable 
  data={myData}
  enableRowExpansion={true}
  rowExpansionTemplate={customExpansionTemplate}
/>
```

### 7. Complete Example with All Features

```jsx
import React, { useState } from 'react';
import SimpleDataTable from './components/SimpleDataTable';

const CompleteExample = () => {
  const [data, setData] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      city: 'New York',
      status: 'Active',
      joinDate: '2023-01-15',
      orders: [
        { orderId: 'ORD-001', amount: 150, date: '2024-01-10' },
        { orderId: 'ORD-002', amount: 200, date: '2024-02-15' }
      ]
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      age: 25,
      city: 'London',
      status: 'Active',
      joinDate: '2023-03-20',
      orders: [
        { orderId: 'ORD-003', amount: 300, date: '2024-01-20' }
      ]
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      age: 35,
      city: 'Paris',
      status: 'Inactive',
      joinDate: '2022-11-10',
      orders: []
    }
  ]);

  const columns = [
    { key: 'name', title: 'Name', sortable: true, filterable: true, type: 'text' },
    { key: 'email', title: 'Email', sortable: true, filterable: true, type: 'text' },
    { key: 'age', title: 'Age', sortable: true, filterable: true, type: 'number' },
    { key: 'city', title: 'City', sortable: true, filterable: true, type: 'dropdown' },
    { key: 'status', title: 'Status', sortable: true, filterable: true, type: 'dropdown' },
    { key: 'joinDate', title: 'Join Date', sortable: true, filterable: true, type: 'date' }
  ];

  const handleRefresh = () => {
    console.log('Refreshing data...');
    // Fetch fresh data here
  };

  const handleRowClick = (rowData, index) => {
    console.log('Row clicked:', rowData, index);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>User Management</h1>
      
      <SimpleDataTable 
        data={data}
        columns={columns}
        dataKey="id"
        
        // Features
        enableSearch={true}
        enableSorting={true}
        enablePagination={true}
        enableRowExpansion={true}
        
        // Toggle custom UI components
        useCustomFilters={true}
        useCustomToolbar={true}
        
        // Configuration
        pageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
        tableSize="normal"
        
        // Row expansion
        nestedDataKey="orders"
        
        // Callbacks
        onRefresh={handleRefresh}
        onRowClick={handleRowClick}
      />
    </div>
  );
};

export default CompleteExample;
```

## Column Types

The component automatically detects column types, but you can also specify them explicitly:

| Type | Description | Filter UI |
|------|-------------|-----------|
| `text` | String values | Text input |
| `number` | Numeric values | Number input |
| `date` | Date values (ISO format) | Calendar picker |
| `dropdown` | Limited unique values (<= 10) | Dropdown select |
| `boolean` | True/false values | Dropdown (Yes/No) |
| `array` | Array values | Not filterable (hidden) |

## Styling Customization

### Using Custom CSS

```jsx
<SimpleDataTable 
  data={myData}
  className="my-custom-table"
  style={{ 
    backgroundColor: '#ffffff',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }}
/>
```

### Size Variants

```jsx
// Small table
<SimpleDataTable data={myData} tableSize="small" />

// Normal table (default)
<SimpleDataTable data={myData} tableSize="normal" />

// Large table
<SimpleDataTable data={myData} tableSize="large" />
```

## Responsive Design

The component uses **em** and **rem** units for all sizing, making it highly responsive:

- **Desktop (> 48rem)**: Full size with standard spacing
- **Tablet (30rem - 48rem)**: Slightly reduced font sizes and padding
- **Mobile (< 30rem)**: Compact layout with minimal padding

All breakpoints automatically adjust based on root font size.

## Key Differences from PrimeDataTable

| Feature | SimpleDataTable | PrimeDataTable |
|---------|----------------|----------------|
| Pivot Tables | ❌ Not included | ✅ Full support |
| Column Grouping | ❌ Not included | ✅ Full support |
| Advanced Filters | ❌ Basic only | ✅ Complex filters |
| ROI Calculations | ❌ Not included | ✅ Included |
| Custom Filters | ✅ Toggle mode | ❌ Native only |
| Custom Toolbar | ✅ Toggle mode | ❌ Native only |
| Expand/Collapse Toggle | ✅ Single button | ❌ Separate buttons |
| Responsive Sizing | ✅ em/rem units | ⚠️ px units |
| File Size | ⚡ Lightweight | 📦 Feature-rich |

## Performance Tips

1. **Use dataKey prop** for better performance with large datasets
2. **Enable pagination** for datasets > 100 rows
3. **Lazy load nested data** in expansion templates if possible
4. **Memoize custom templates** to avoid unnecessary re-renders

## Troubleshooting

### Filters not working

Make sure:
- `useCustomFilters` is set correctly
- Column `filterable` property is not set to `false`
- Data types match column types

### Row expansion not showing

Check:
- `enableRowExpansion` is `true`
- Your data has nested arrays (default key: `items`)
- Or specify correct `nestedDataKey` prop
- Or provide custom `rowExpansionTemplate`

### Expand/Collapse All button not working

Ensure:
- `enableRowExpansion` is `true`
- Your data has valid `dataKey` values
- Nested data exists in rows

## License

MIT

## Support

For issues and feature requests, please create an issue in the repository.

