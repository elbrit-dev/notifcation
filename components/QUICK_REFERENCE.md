# ExportDataButton - Quick Reference Card

## 🚀 Import

```jsx
import ExportDataButton from './components/ExportDataButton';
```

## ⚡ Quick Examples

### 1. Basic Export
```jsx
<ExportDataButton data={myData} />
```

### 2. With Label
```jsx
<ExportDataButton 
  data={myData} 
  label="Download Data" 
/>
```

### 3. Nested Data
```jsx
<ExportDataButton 
  data={companiesWithEmployees}
  nestedDataKey="employees"
/>
```

### 4. Different Sizes
```jsx
<ExportDataButton data={myData} size="small" />
<ExportDataButton data={myData} size="medium" />  {/* default */}
<ExportDataButton data={myData} size="large" />
```

### 5. Different Variants
```jsx
<ExportDataButton data={myData} variant="primary" />    {/* default */}
<ExportDataButton data={myData} variant="secondary" />
<ExportDataButton data={myData} variant="outline" />
```

### 6. Custom Styling
```jsx
<ExportDataButton 
  data={myData}
  buttonStyle={{
    backgroundColor: '#8b5cf6',
    borderRadius: '9999px',
    padding: '1rem 2rem'
  }}
/>
```

### 7. With Callbacks
```jsx
<ExportDataButton 
  data={myData}
  onExportStart={(format) => console.log(`Starting ${format}`)}
  onExportComplete={(format) => console.log(`Done ${format}`)}
/>
```

### 8. Custom Columns
```jsx
const columns = [
  { key: 'id', title: 'ID' },
  { key: 'name', title: 'Full Name' },
];

<ExportDataButton 
  data={myData}
  columns={columns}
/>
```

## 📋 Props Cheat Sheet

```jsx
<ExportDataButton 
  data={[]}                        // REQUIRED: Array of objects
  columns={[]}                     // Optional: Column definitions
  nestedDataKey="items"            // Optional: Key for nested data
  label="Export"                   // Optional: Button text
  size="small|medium|large"        // Optional: Button size
  variant="primary|secondary|outline" // Optional: Button style
  disabled={false}                 // Optional: Disable button
  useNativeButton={false}          // Optional: Use PrimeReact button
  buttonStyle={{}}                 // Optional: Custom styles
  className=""                     // Optional: CSS class
  onExportStart={(format) => {}}   // Optional: Export start callback
  onExportComplete={(format) => {} // Optional: Export done callback
/>
```

## 📊 Data Formats

### Simple Array
```javascript
[
  { id: 1, name: 'John', age: 30 },
  { id: 2, name: 'Jane', age: 28 }
]
```

### Nested Array
```javascript
[
  {
    company: 'Tech Corp',
    employees: [
      { name: 'John', salary: 75000 },
      { name: 'Jane', salary: 85000 }
    ]
  }
]
```

## 🎨 Size Reference

| Size | Padding | Font Size | Icon Size |
|------|---------|-----------|-----------|
| small | 0.375rem 0.625rem | 0.75rem | 14px |
| medium | 0.5rem 0.875rem | 0.875rem | 16px |
| large | 0.625rem 1.125rem | 1rem | 18px |

## 🎯 Variant Colors

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| primary | Blue (#3b82f6) | White | Blue |
| secondary | Gray (#6b7280) | White | Gray |
| outline | Transparent | Blue | Blue |

## 🔑 Nested Data Keys

Auto-detected keys (in order):
1. `nestedDataKey` prop value
2. `items`
3. `children`
4. `HQs`

## ✨ Features

- ✅ CSV export
- ✅ Excel (XLSX) export
- ✅ Automatic nested data handling
- ✅ Auto column generation
- ✅ Format selection modal
- ✅ Styled Excel headers
- ✅ UTF-8 encoding
- ✅ Proper CSV escaping

## 🎬 Test It

Run the test page:
```
/test-export-button
```

## 💡 Pro Tips

1. **No Data?** Button auto-disables when `data` is empty
2. **Nested Data?** Only non-numeric parent columns are exported
3. **Large Files?** Both CSV and Excel handle large datasets well
4. **Custom Format?** Use `onExportStart` to add loading indicators
5. **Different Keys?** Set `nestedDataKey` to match your data structure

## 🐛 Common Issues

### Button doesn't appear
- Check import path
- Verify component is mounted
- Check CSS conflicts

### Export doesn't work
- Ensure `data` is an array
- Check browser console for errors
- Verify XLSX package is installed

### Nested data not detected
- Set correct `nestedDataKey`
- Ensure nested data is an array
- Check data structure

## 📦 Dependencies

```bash
npm install xlsx primereact lucide-react
```

## 🔗 Full Documentation

See `ExportDataButton.README.md` for complete documentation.

---

**That's it! Copy, paste, and customize.** 🎉

