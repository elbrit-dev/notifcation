# FileImportButton Component

A reusable React component for uploading and importing CSV and Excel files (.csv, .xlsx, .xls) and converting them to JSON arrays.

## Features

- ✅ Upload CSV and Excel files (.csv, .xlsx, .xls)
- ✅ Automatically converts files to JSON array format
- ✅ Preview imported data in a dialog
- ✅ Save data to global state (accessible via `$ctx.state`)
- ✅ Progress indicator during import
- ✅ Error handling with user-friendly messages
- ✅ Customizable button styling and sizes
- ✅ File size validation
- ✅ Support for quoted CSV values and special characters

## Installation

The component uses the following dependencies (already in your project):
- `xlsx` - For Excel file parsing
- `primereact` - For UI components
- `lucide-react` - For icons

## Basic Usage

```jsx
import FileImportButton from './components/FileImportButton';

function MyComponent() {
  const handleImport = (data, fileName) => {
    console.log('Imported data:', data);
    console.log('File name:', fileName);
    // Use the data array here
  };

  return (
    <FileImportButton
      onImportComplete={handleImport}
      label="Import File"
    />
  );
}
```

## Save to Global State

To save imported data to global state (accessible in Plasmic Studio):

```jsx
<FileImportButton
  stateKey="importedData"
  onImportComplete={(data) => {
    console.log('Data saved to $ctx.state.importedData');
  }}
/>
```

After import, access the data in Plasmic Studio via: `$ctx.state.importedData`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onImportComplete` | `Function` | `null` | Callback function called with `(data, fileName)` after successful import |
| `stateKey` | `string` | `null` | Key to save data to global state (`$ctx.state[stateKey]`) |
| `setState` | `Function` | `null` | Optional setState function (bind to `$ctx.fn.setState` in Plasmic) |
| `label` | `string` | `'Import File'` | Button label text |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Position of icon relative to label |
| `iconOnly` | `boolean` | `false` | Show only icon without label |
| `className` | `string` | `''` | Additional CSS classes for button |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `disabled` | `boolean` | `false` | Disable the button |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'light'` | `'primary'` | Button style variant |
| `showPreview` | `boolean` | `true` | Show preview dialog after import |
| `maxFileSize` | `number` | `10` | Maximum file size in MB |
| `firstRowAsHeader` | `boolean` | `true` | Use first row as column headers (CSV only) |
| `onError` | `Function` | `null` | Callback for error handling `(error) => {}` |

## Examples

### Example 1: Basic Import with Callback

```jsx
<FileImportButton
  onImportComplete={(data, fileName) => {
    console.log(`Imported ${data.length} rows from ${fileName}`);
    // Process your data here
    setMyData(data);
  }}
  label="Import Data"
/>
```

### Example 2: Save to Global State

**In Plasmic Studio:**
```jsx
<FileImportButton
  stateKey="products"
  setState={$ctx.fn.setState}
  label="Import Products"
/>
```

**In React (standalone):**
```jsx
<FileImportButton
  stateKey="products"
  onImportComplete={(data) => {
    // Handle data manually
    setProducts(data);
  }}
  label="Import Products"
/>
```

Then use in Plasmic Studio: `$ctx.state.products`

### Example 3: Custom Styling

```jsx
<FileImportButton
  label="Import"
  size="large"
  variant="outline"
  className="my-custom-class"
/>
```

### Example 4: Without Preview Dialog

```jsx
<FileImportButton
  showPreview={false}
  onImportComplete={(data) => {
    alert(`Imported ${data.length} rows!`);
  }}
/>
```

### Example 5: Error Handling

```jsx
<FileImportButton
  onImportComplete={(data) => {
    console.log('Success:', data);
  }}
  onError={(error) => {
    console.error('Import failed:', error);
    // Show error message to user
  }}
  maxFileSize={5} // 5MB limit
/>
```

## Data Format

The component converts files to an array of objects:

**Input CSV:**
```csv
Name,Age,City
John,30,New York
Jane,25,Los Angeles
```

**Output JSON:**
```json
[
  { "Name": "John", "Age": "30", "City": "New York" },
  { "Name": "Jane", "Age": "25", "City": "Los Angeles" }
]
```

## Using Imported Data

### In React Components

```jsx
const [data, setData] = useState([]);

<FileImportButton
  onImportComplete={(importedData) => {
    setData(importedData);
  }}
/>

{/* Use the data */}
{data.map((row, index) => (
  <div key={index}>{row.Name}</div>
))}
```

### In Plasmic Studio

1. Import file using `FileImportButton` with `stateKey` prop
2. Bind component data to `$ctx.state.yourStateKey`
3. Use in data tables, lists, etc.

Example:
```jsx
<FileImportButton stateKey="products" />

{/* In Plasmic Studio, bind to: */}
<DataTable data={$ctx.state.products} />
```

## File Format Support

- **CSV (.csv)**: Comma-separated values
  - Supports quoted values
  - Handles commas within quoted strings
  - First row as headers (configurable)

- **Excel (.xlsx, .xls)**: Microsoft Excel files
  - Reads first sheet by default
  - Converts all values to strings
  - Empty cells become empty strings

## Error Handling

The component handles various error scenarios:

- File size exceeds limit
- Unsupported file type
- Empty files
- Parsing errors
- File read errors

All errors are displayed to the user and can be handled via the `onError` callback.

## Styling

The component uses Tailwind CSS classes. You can customize:

- Button size: `small`, `medium`, `large`
- Button variant: `primary`, `secondary`, `outline`, `light`
- Additional classes via `className` prop

## Notes

- Maximum file size default is 10MB (configurable)
- Preview dialog shows first 100 rows
- Data is automatically saved to global state if `stateKey` is provided
- Component requires Plasmic context for global state functionality
- Uses dynamic imports for SSR compatibility with Next.js

## Troubleshooting

### Data not saving to global state
- Ensure you're using the component within Plasmic context
- Check that `stateKey` prop is provided
- Verify `$ctx.fn.setState` is available in your context

### Import fails silently
- Check browser console for errors
- Verify file format is supported (.csv, .xlsx, .xls)
- Check file size is within limit
- Use `onError` callback to catch errors

### Preview not showing
- Ensure `showPreview={true}` (default)
- Check that import completed successfully
- Verify `importedData` state is set

## See Also

- `ExportDataButton.js` - For exporting data to CSV/Excel
- `_app.js` - Global state management setup

