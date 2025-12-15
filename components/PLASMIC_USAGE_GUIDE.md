# Using ExportDataButton in Plasmic

The `ExportDataButton` component is now registered in Plasmic and ready to use!

## 🎯 Quick Start in Plasmic

### 1. Add the Component
1. Open your Plasmic project
2. In the component panel, search for **"Export Data Button"**
3. Drag it onto your canvas

### 2. Connect Your Data

The most important prop is `data` - this is where you pass your table data.

**Example in Plasmic:**

```javascript
// In your Plasmic data query or code component
// Set the 'data' prop to your array
[
  { id: 1, name: 'John Doe', age: 30, city: 'New York' },
  { id: 2, name: 'Jane Smith', age: 28, city: 'Los Angeles' }
]
```

## 📋 Common Usage Patterns in Plasmic

### Pattern 1: Export Simple Table Data

**Scenario:** You have a data table and want to add an export button

1. Add `ExportDataButton` to your page
2. Set `data` prop to the same data source as your table
3. Set `label` to "Export Table"
4. Choose `variant`: "primary"
5. Choose `size`: "medium"

### Pattern 2: Export Nested/Expansion Data

**Scenario:** You have companies with employees (nested data)

1. Add `ExportDataButton` to your page
2. Set `data` prop to your companies array:
   ```javascript
   [
     {
       company: 'Tech Corp',
       revenue: 5000000,
       employees: [
         { name: 'John', salary: 75000 },
         { name: 'Jane', salary: 85000 }
       ]
     }
   ]
   ```
3. Set `nestedDataKey` to "employees"
4. Set `label` to "Export Companies + Employees"

### Pattern 3: Multiple Export Buttons

**Scenario:** Different exports for different data

```
┌─────────────────────────────┐
│  [Export All]  [Export Selected]  [Export Summary]  │
└─────────────────────────────┘
```

1. Add multiple `ExportDataButton` components
2. Pass different data to each button
3. Use different variants for visual hierarchy:
   - Primary: Main export
   - Secondary: Alternative exports
   - Outline: Less important exports

### Pattern 4: With Plasmic Data Queries

If you're using Plasmic's data fetching:

1. Create a data query (e.g., "getUsersQuery")
2. Set the button's `data` prop to: `$queries.getUsersQuery`
3. The button will automatically export the query results

## 🎨 Styling Options

### Size Options
- **Small**: Compact button, good for toolbars
- **Medium**: Default size, balanced
- **Large**: Prominent button, good for CTAs

### Variant Options
- **Primary**: Blue background, white text (main action)
- **Secondary**: Gray background, white text (alternative action)
- **Outline**: Transparent with blue border (subtle action)

### Custom Styling
Use the `buttonStyle` prop for custom colors:

```javascript
{
  backgroundColor: '#8b5cf6',  // Purple
  borderColor: '#8b5cf6',
  borderRadius: '9999px'        // Fully rounded
}
```

## 📊 Data Format Examples

### Simple Data (Auto-detected columns)
```javascript
[
  { id: 1, name: 'Product A', price: 99.99, stock: 50 },
  { id: 2, name: 'Product B', price: 149.99, stock: 30 }
]
```

**Export Result:**
```
ID | Name      | Price  | Stock
1  | Product A | 99.99  | 50
2  | Product B | 149.99 | 30
```

### Nested Data (Parent + Children)
```javascript
[
  {
    orderId: 'ORD-001',
    customer: 'ABC Corp',
    totalAmount: 1500,
    items: [
      { product: 'Laptop', quantity: 2, price: 600 },
      { product: 'Mouse', quantity: 5, price: 20 }
    ]
  }
]
```

**Export Result** (flattened):
```
Order ID | Customer | Product | Quantity | Price
ORD-001  | ABC Corp | Laptop  | 2        | 600
ORD-001  | ABC Corp | Mouse   | 5        | 20
```

Note: `totalAmount` (numeric parent column) is excluded to avoid confusion.

### Custom Columns
```javascript
// Data
data = [
  { empId: 'E001', empName: 'John', empAge: 30 }
]

// Columns
columns = [
  { key: 'empId', title: 'Employee ID' },
  { key: 'empName', title: 'Full Name' },
  { key: 'empAge', title: 'Age (years)' }
]
```

**Export Result:**
```
Employee ID | Full Name | Age (years)
E001        | John      | 30
```

## 🔧 Props Reference

### Required Props
| Prop | Type | Description |
|------|------|-------------|
| `data` | Array | Your data array (simple or nested) |

### Optional Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | Array | `[]` | Custom column definitions |
| `nestedDataKey` | String | `'items'` | Key for nested data |
| `label` | String | `'Export'` | Button text |
| `size` | Choice | `'medium'` | small, medium, large |
| `variant` | Choice | `'primary'` | primary, secondary, outline |
| `disabled` | Boolean | `false` | Disable button |
| `useNativeButton` | Boolean | `false` | Use PrimeReact button |
| `buttonStyle` | Object | `{}` | Custom inline styles |
| `className` | String | `''` | CSS classes |

### Event Handlers
| Event | Args | Description |
|-------|------|-------------|
| `onExportStart` | `(format)` | When user selects format |
| `onExportComplete` | `(format)` | When export finishes |

## 🎬 Interactive Examples

### Example 1: Basic Export Button
```
Props:
- data: [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]
- label: "Download Data"
- variant: "primary"
- size: "medium"
```

### Example 2: Nested Data Export
```
Props:
- data: [{ company: 'Tech', employees: [{...}] }]
- nestedDataKey: "employees"
- label: "Export All Employees"
- variant: "primary"
```

### Example 3: Custom Styled
```
Props:
- data: yourData
- label: "Download"
- variant: "primary"
- size: "large"
- buttonStyle: { backgroundColor: '#10b981', borderRadius: '0.75rem' }
```

## 💡 Tips & Best Practices

### 1. Button Placement
- Place near your data table
- Include in toolbar with other actions
- Group with related export options

### 2. Loading States
Use event handlers to show loading:
```javascript
onExportStart: () => { showLoadingToast() }
onExportComplete: () => { showSuccessToast() }
```

### 3. Multiple Formats
The component automatically shows format selection (CSV/Excel).
User chooses at export time.

### 4. Data Validation
The button auto-disables when:
- `data` prop is empty
- `disabled` prop is true

### 5. Responsive Design
The button is responsive by default:
- Small screens: Compact padding
- Large screens: Standard padding

## 🐛 Troubleshooting

### Button doesn't appear
- Check that `data` prop is connected
- Verify component is not hidden
- Check z-index if behind other elements

### Export doesn't work
- Ensure `data` is an array (not object)
- Check browser console for errors
- Verify XLSX package is installed

### Nested data not exporting correctly
- Set correct `nestedDataKey`
- Ensure nested data is an array
- Check data structure matches expected format

### Custom columns not working
- Ensure `key` matches data field names
- Provide both `key` and `title` for each column

## 🔗 Related Components

- **SimpleDataTable**: Use for displaying data with built-in export
- **ExportDataButton**: Use standalone for flexible placement

## 📚 More Information

- See `ExportDataButton.README.md` for complete API docs
- See `QUICK_REFERENCE.md` for code examples
- Visit `/test-export-button` for live demos

## ✨ Summary

The ExportDataButton is now available in Plasmic! Simply:
1. **Drag** the component onto your canvas
2. **Connect** your data array to the `data` prop
3. **Customize** size, variant, and label
4. **Done!** Users can export to CSV or Excel

Perfect for adding export functionality anywhere in your Plasmic app! 🚀

