# ExportDataButton Component

A standalone React export button component that can export data to CSV or Excel (XLSX) formats. Automatically detects and handles nested/expansion data.

## Features

- ✅ Export to CSV or Excel (XLSX) format
- ✅ Automatically handles nested/expansion data
- ✅ Auto-generates columns from data
- ✅ Custom column definitions support
- ✅ Beautiful export format selection modal
- ✅ Multiple button variants (primary, secondary, outline)
- ✅ Multiple button sizes (small, medium, large)
- ✅ Custom styling support
- ✅ PrimeReact button option
- ✅ Export callbacks (onExportStart, onExportComplete)
- ✅ Disabled state support

## Installation

Make sure you have the required dependencies:

```bash
npm install xlsx primereact lucide-react
```

## Basic Usage

### Simple Data Export

```jsx
import ExportDataButton from './components/ExportDataButton';

const data = [
  { id: 1, name: 'John Doe', age: 30, city: 'New York' },
  { id: 2, name: 'Jane Smith', age: 28, city: 'Los Angeles' },
];

function MyComponent() {
  return (
    <ExportDataButton 
      data={data}
      label="Export Data"
    />
  );
}
```

### Nested/Expansion Data Export

```jsx
const nestedData = [
  {
    company: 'Tech Corp',
    industry: 'Technology',
    revenue: 5000000,
    employees: [
      { name: 'John Doe', position: 'Engineer', salary: 75000 },
      { name: 'Jane Smith', position: 'Manager', salary: 95000 },
    ]
  },
  {
    company: 'Finance Inc',
    industry: 'Finance',
    revenue: 3500000,
    employees: [
      { name: 'Bob Johnson', position: 'Analyst', salary: 68000 },
    ]
  },
];

function MyComponent() {
  return (
    <ExportDataButton 
      data={nestedData}
      nestedDataKey="employees"
      label="Export Companies & Employees"
    />
  );
}
```

### With Custom Columns

```jsx
const data = [
  { id: 1, name: 'John Doe', age: 30 },
  { id: 2, name: 'Jane Smith', age: 28 },
];

const columns = [
  { key: 'id', title: 'ID', type: 'number' },
  { key: 'name', title: 'Full Name', type: 'text' },
  { key: 'age', title: 'Age (years)', type: 'number' },
];

function MyComponent() {
  return (
    <ExportDataButton 
      data={data}
      columns={columns}
      label="Export Data"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Array` | `[]` | **Required**. Array of objects to export |
| `columns` | `Array` | `[]` | Column definitions (auto-generated if not provided) |
| `nestedDataKey` | `string` | `'items'` | Key name for nested data arrays |
| `useNativeButton` | `boolean` | `false` | Use PrimeReact button instead of custom button |
| `label` | `string` | `'Export'` | Button label text |
| `buttonStyle` | `object` | `{}` | Custom inline styles for button |
| `className` | `string` | `''` | Custom CSS class for button |
| `size` | `string` | `'medium'` | Button size: `'small'`, `'medium'`, or `'large'` |
| `disabled` | `boolean` | `false` | Disable the button |
| `variant` | `string` | `'primary'` | Button variant: `'primary'`, `'secondary'`, or `'outline'` |
| `onExportStart` | `function` | `undefined` | Callback when export starts: `(format) => {}` |
| `onExportComplete` | `function` | `undefined` | Callback when export completes: `(format) => {}` |

## Column Definition

When providing custom columns, each column object can have:

```javascript
{
  key: 'fieldName',        // Field name in data object (required)
  title: 'Display Name',   // Column header title (required)
  type: 'text',            // Data type: 'text', 'number', 'boolean', 'date', 'array'
}
```

## Button Sizes

### Small
```jsx
<ExportDataButton data={data} size="small" />
```

### Medium (Default)
```jsx
<ExportDataButton data={data} size="medium" />
```

### Large
```jsx
<ExportDataButton data={data} size="large" />
```

## Button Variants

### Primary (Default)
```jsx
<ExportDataButton data={data} variant="primary" />
```

### Secondary
```jsx
<ExportDataButton data={data} variant="secondary" />
```

### Outline
```jsx
<ExportDataButton data={data} variant="outline" />
```

## Advanced Examples

### With Callbacks

```jsx
<ExportDataButton 
  data={data}
  label="Export"
  onExportStart={(format) => {
    console.log(`Starting export in ${format} format`);
    // Show loading indicator
  }}
  onExportComplete={(format) => {
    console.log(`Export completed in ${format} format`);
    // Hide loading indicator
    // Show success message
  }}
/>
```

### Custom Styling

```jsx
<ExportDataButton 
  data={data}
  label="Custom Export"
  variant="primary"
  buttonStyle={{
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
    borderRadius: '9999px',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem'
  }}
/>
```

### Using PrimeReact Button

```jsx
<ExportDataButton 
  data={data}
  useNativeButton={true}
  label="Export with PrimeReact"
/>
```

### Multiple Nested Keys

The component automatically searches for common nested data keys:
- `nestedDataKey` prop value (if provided)
- `items`
- `children`
- `HQs`

```jsx
// Works with any of these structures:
const data1 = [{ id: 1, items: [...] }];
const data2 = [{ id: 1, children: [...] }];
const data3 = [{ id: 1, employees: [...] }]; // if nestedDataKey="employees"
```

## Export Behavior

### Simple Data
When exporting simple (non-nested) data, all columns are included in the export.

### Nested Data
When nested data is detected:
1. **Parent columns**: Only non-numeric columns are included
2. **Child columns**: All columns from nested data are included
3. Each child row gets its own row in the export with parent data merged

**Example:**

Parent data:
```javascript
{ company: 'Tech Corp', industry: 'Technology', revenue: 5000000 }
```

Child data:
```javascript
{ name: 'John Doe', position: 'Engineer', salary: 75000 }
```

Export result:
```
Company      | Industry    | Name      | Position  | Salary
Tech Corp    | Technology  | John Doe  | Engineer  | 75000
```

Note: `revenue` (numeric parent column) is excluded from export.

## Export Formats

### CSV
- UTF-8 encoding with BOM
- Proper escaping of special characters
- Universal compatibility

### Excel (XLSX)
- Modern Excel format (.xlsx)
- Styled header row (blue background, white text)
- Auto-sized columns
- Compatible with all Excel versions

## Browser Compatibility

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- IE11: ❌ (use polyfills)

## Troubleshooting

### No data exports
- Check that `data` prop is a valid array with objects
- Verify data is not empty
- Check browser console for errors

### Nested data not detected
- Ensure nested data is an array
- Verify the `nestedDataKey` matches your data structure
- The component auto-detects: `items`, `children`, `HQs`

### Button not visible
- Check that component is imported correctly
- Verify PrimeReact CSS is loaded (if using `useNativeButton`)
- Check for CSS conflicts

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

