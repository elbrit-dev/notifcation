# Plasmic Interface Configuration Examples

This document shows exactly how to configure the PrimeDataTable pivot table and expandable table props in the Plasmic interface.

## Plasmic Right Panel - Pivot Table Props Section

When you select the PrimeDataTable component in Plasmic, you'll see these fields in the right panel:

```
┌─────────────────────────────────────────┐
│ PrimeDataTable Properties               │
├─────────────────────────────────────────┤
│ ... (other existing props)              │
├─────────────────────────────────────────┤
│ ▼ Pivot Table Props                     │
│                                         │
│ □ enablePivotTable                      │
│   Enable Excel-like pivot table        │
│   functionality                         │
│                                         │
│ pivotRows                   [ + ]       │
│ Array of field names to use as row      │
│ grouping (like Excel's 'Rows' area)     │
│ Example: ['drName', 'salesTeam']        │
│                                         │
│ pivotColumns               [ + ]        │
│ Array of field names to use as column   │
│ headers (like Excel's 'Columns' area)   │
│ Example: ['date', 'category']           │
│                                         │
│ pivotValues                [ + ]        │
│ Array of value configuration objects    │
│ with field and aggregation              │
│                                         │
│ pivotFilters               [ + ]        │
│ Array of field names to use as pivot    │
│ filters (like Excel's 'Filters' area)   │
│                                         │
│ ☑ pivotShowGrandTotals                  │
│   Show grand total row in pivot table   │
│                                         │
│ ☑ pivotShowRowTotals                    │
│   Show row totals column in pivot table │
│                                         │
│ ☑ pivotShowColumnTotals                 │
│   Show column totals in pivot table     │
│                                         │
│ ☑ pivotShowSubTotals                    │
│   Show subtotals in pivot table         │
│                                         │
│ pivotNumberFormat          [en-US  ▼]   │
│ Number format locale for pivot table    │
│                                         │
│ pivotCurrency              [USD    ▼]   │
│ Currency code for pivot table           │
│ formatting                              │
│                                         │
│ pivotPrecision             [2      ]    │
│ Number of decimal places for pivot      │
│ table numbers                           │
│                                         │
│ pivotFieldSeparator        [__     ]    │
│ Separator for parsing complex field     │
│ names like '2025-04-01__serviceAmount'  │
│                                         │
│ ☑ pivotSortRows                         │
│   Sort row values in pivot table        │
│                                         │
│ ☑ pivotSortColumns                      │
│   Sort column values in pivot table     │
│                                         │
│ pivotSortDirection         [asc    ▼]   │
│ Sort direction for pivot table          │
│                                         │
│ pivotAggregationFunctions  [{}     ]    │
│ Custom aggregation functions for        │
│ pivot table                             │
└─────────────────────────────────────────┘
```

## Step-by-Step Configuration Examples

### Example 1: Basic Sales Pivot

**Step 1: Enable Pivot Table**
```
✓ enablePivotTable: true
```

**Step 2: Configure Row Grouping**
Click on `pivotRows` → Add Array Items:
```json
[
  "salesTeam",
  "drName"
]
```

**Step 3: Configure Column Pivoting**  
Click on `pivotColumns` → Add Array Items:
```json
[
  "date"
]
```

**Step 4: Configure Values**
Click on `pivotValues` → Add Array Items:
```json
[
  {
    "field": "serviceAmount",
    "aggregation": "sum"
  },
  {
    "field": "supportValue", 
    "aggregation": "sum"
  }
]
```

**Step 5: Configure Display Options**
```
✓ pivotShowGrandTotals: true
✓ pivotShowRowTotals: true
✓ pivotShowColumnTotals: true
```

**Step 6: Configure Formatting**
```
pivotCurrency: "USD"
pivotPrecision: 0
pivotNumberFormat: "en-US"
```

### Example 2: Complex Field Names (Your Data Structure)

For data with fields like `"2025-04-01__serviceAmount"`:

**Step 1: Enable Pivot Table**
```
✓ enablePivotTable: true
```

**Step 2: Set Field Separator**
```
pivotFieldSeparator: "__"
```

**Step 3: Configure for Complex Fields**
Since your data is already pivoted in a way, you might want to:

**Option A: Use as regular table with grouping**
```
✗ enablePivotTable: false
✓ enableColumnGrouping: true
✓ enableAutoColumnGrouping: true
```

**Option B: Transform data first, then pivot**
Transform your data structure first, then use pivot table:
```json
// Transformed data structure:
[
  {
    "drName": "Yuvaraj",
    "salesTeam": "Elbrit Coimbatore", 
    "date": "2025-04-01",
    "serviceAmount": 0,
    "supportValue": 16521
  },
  {
    "drName": "Yuvaraj",
    "salesTeam": "Elbrit Coimbatore",
    "date": "2025-04-02", 
    "serviceAmount": 2500,
    "supportValue": 18000
  }
]
```

Then configure pivot:
```json
pivotRows: ["drName", "salesTeam"]
pivotColumns: ["date"]
pivotValues: [
  {"field": "serviceAmount", "aggregation": "sum"},
  {"field": "supportValue", "aggregation": "sum"}
]
```

## Common Configuration Patterns

### Pattern 1: Summary Report (No Column Pivoting)
```
enablePivotTable: true
pivotRows: ["drName"]
pivotColumns: []  // Empty - no column pivoting
pivotValues: [
  {"field": "serviceAmount", "aggregation": "sum"},
  {"field": "serviceAmount", "aggregation": "count"}
]
```

### Pattern 2: Time-based Analysis
```
enablePivotTable: true
pivotRows: ["salesTeam"]
pivotColumns: ["month"]
pivotValues: [
  {"field": "revenue", "aggregation": "sum"}
]
```

### Pattern 3: Multi-dimensional Analysis  
```
enablePivotTable: true
pivotRows: ["region", "salesTeam"]
pivotColumns: ["quarter", "category"]
pivotValues: [
  {"field": "amount", "aggregation": "sum"},
  {"field": "deals", "aggregation": "count"}
]
```

## JSON Configuration Examples

For complex configurations, you can also paste JSON directly:

### pivotValues JSON Example:
```json
[
  {
    "field": "serviceAmount",
    "aggregation": "sum"
  },
  {
    "field": "serviceAmount", 
    "aggregation": "average"
  },
  {
    "field": "supportValue",
    "aggregation": "sum"
  },
  {
    "field": "cases",
    "aggregation": "count"
  }
]
```

### pivotRows JSON Example:
```json
[
  "drName",
  "salesTeam",
  "region"
]
```

### pivotColumns JSON Example:
```json
[
  "date",
  "category",
  "status"
]
```

## Validation and Error Handling

Plasmic will validate your configuration and show errors for:

- ❌ Invalid field names (not found in data)
- ❌ Invalid aggregation functions
- ❌ Malformed JSON in array/object fields
- ❌ Missing required fields

## Testing Your Configuration

1. **Preview Mode**: Use Plasmic's preview to see your pivot table
2. **Debug Info**: Enable debug mode to see pivot configuration details
3. **Data Validation**: Check the browser console for any data issues

## Plasmic Right Panel - Expandable Table Props Section

When you select the PrimeDataTable component in Plasmic, you'll also see these expandable table fields in the right panel:

```
┌─────────────────────────────────────────┐
│ PrimeDataTable Properties               │
├─────────────────────────────────────────┤
│ ... (other existing props)              │
├─────────────────────────────────────────┤
│ ▼ Expandable Table Props                │
│                                         │
│ □ enableRowExpansion                    │
│   Enable row expansion functionality    │
│                                         │
│ rowExpansionTemplate        [ + ]       │
│ Custom template function for expanded   │
│ row content. Receives row data as      │
│ parameter (optional - auto-detection    │
│ available when not specified)           │
│                                         │
│ expandedRows                [ + ]       │
│ Object controlling which rows are       │
│ expanded. Use with onRowToggle for     │
│ state management                        │
│                                         │
│ onRowToggle                 [ + ]       │
│ Event handler for row expansion/       │
│ collapse events                         │
│                                         │
│ 🎯 Auto-Detection: When no custom      │
│ template is provided, automatically     │
│ detects nested arrays and renders them  │
│ with any data structure!               │
└─────────────────────────────────────────┘
```

## Step-by-Step Expandable Table Configuration

### Example 1: Basic Employee Details Expansion

**Step 1: Enable Row Expansion**
```
✓ enableRowExpansion: true
```

**Step 2: Configure Expansion Template**
Click on `rowExpansionTemplate` → Add Function:
```jsx
(data) => (
  <div style={{ padding: '16px', backgroundColor: '#f8f9fa' }}>
    <h5 style={{ margin: '0 0 12px 0', color: '#007bff' }}>
      Details for {data.name}
    </h5>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <div>
        <p><strong>Department:</strong> {data.department}</p>
        <p><strong>Email:</strong> {data.email}</p>
        <p><strong>Salary:</strong> ${data.salary?.toLocaleString()}</p>
      </div>
      <div>
        <p><strong>Skills:</strong> {data.skills?.join(', ') || 'N/A'}</p>
        <p><strong>Projects:</strong> {data.projects?.join(', ') || 'N/A'}</p>
      </div>
    </div>
  </div>
)
```

**Step 3: Configure State Management**
Click on `expandedRows` → Add Object:
```json
{}
```

**Step 4: Configure Event Handler**
Click on `onRowToggle` → Add Event Handler:
```jsx
// In your page component, add this function:
const handleRowToggle = (e) => {
  // e.data contains the expanded rows object
  // Update your local state or CMS
  console.log('Expanded rows:', e.data);
};
```

### Example 2: Auto-Detection Expansion (No Template Needed!)

**🎯 Magic Feature**: Simply enable row expansion and the component automatically detects nested data!

**Step 1: Enable Row Expansion**
```
✓ enableRowExpansion: true
```

**Step 2: That's it!** The component automatically:
- Finds nested arrays in your data
- Renders them with proper formatting
- Works with any field names (not hardcoded)
- Handles unlimited nesting levels

**Example Data Structure:**
```javascript
const data = [
  {
    customerName: "ABC Corp",
    invoices: [
      {
        invoiceNumber: "INV-001",
        amount: 50000,
        products: [
          { name: "Product A", price: 25000 },
          { name: "Product B", price: 25000 }
        ]
      }
    ]
  }
];
```

**Result**: Automatically detects `invoices` and `products` arrays and renders them beautifully!

### Example 3: Advanced Expansion with Custom Styling

**Step 1: Enable Row Expansion**
```
✓ enableRowExpansion: true
```

**Step 2: Advanced Template with Tailwind CSS**
```jsx
(data) => (
  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <h5 className="text-lg font-semibold text-blue-800">
          📊 Employee Details
        </h5>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Start Date:</span> {data.startDate}</p>
          <p><span className="font-medium">Manager:</span> {data.manager}</p>
          <p><span className="font-medium">Department:</span> {data.department}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <h6 className="font-semibold text-green-700">🛠️ Skills</h6>
        <div className="flex flex-wrap gap-2">
          {data.skills?.map((skill, index) => (
            <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              {skill}
            </span>
          )) || <span className="text-gray-500">No skills listed</span>}
        </div>
        
        <h6 className="font-semibold text-purple-700">📋 Projects</h6>
        <div className="flex flex-wrap gap-2">
          {data.projects?.map((project, index) => (
            <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              {project}
            </span>
          )) || <span className="text-gray-500">No projects listed</span>}
        </div>
      </div>
    </div>
    
    <div className="mt-4 pt-3 border-t border-blue-200">
      <p className="text-sm text-gray-600">
        <strong>Contact:</strong> {data.email}
      </p>
    </div>
  </div>
)
```

## Integration with Other Props

Remember to also configure related props:

### Currency Formatting
```json
currencyColumns: ["serviceAmount", "supportValue", "totalRevenue"]
```

### Column Filtering (works with pivot results)
```json
numberFilterColumns: ["serviceAmount", "supportValue"]
```

### Export (works with pivot data)
```
✓ enableExport: true
exportFilename: "sales-pivot-report"
```

This interface makes it easy to create powerful pivot tables without writing any code! 