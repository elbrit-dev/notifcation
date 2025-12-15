# Using SimpleDataTable in Plasmic Studio

## 🎨 Component Registration

The **SimpleDataTable** component is now registered in Plasmic Studio and ready to use!

You'll find it in your component library as:
- **Name**: `SimpleDataTable`
- **Display Name**: "Simple Data Table"
- **Category**: Data Components

---

## 🚀 Quick Start in Plasmic Studio

### Step 1: Add the Component

1. Open your Plasmic project
2. Drag and drop **"Simple Data Table"** from the component panel
3. The table will appear with a default empty state

### Step 2: Connect Your Data

In the component props panel, set the `data` prop:

```javascript
// Example: Connect to Plasmic CMS query
$queries.employees.data

// Example: Static data
[
  { id: 1, name: "John Doe", age: 30, city: "New York" },
  { id: 2, name: "Jane Smith", age: 25, city: "London" }
]

// Example: From page data
$ctx.pageData.users
```

---

## ⚙️ Key Props Configuration

### Essential Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | Array | `[]` | Your data array (from query, CMS, or static) |
| `enableSearch` | Boolean | `true` | Enable global search |
| `enableSorting` | Boolean | `true` | Enable column sorting |
| `enablePagination` | Boolean | `true` | Enable pagination |
| `enableRowExpansion` | Boolean | `false` | Enable row expansion for nested data |

### 🎯 Unique Toggle Props

**These are what make SimpleDataTable special!**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `useCustomFilters` | Boolean | `false` | ✨ Toggle to custom filter row (better UX!) |
| `useCustomToolbar` | Boolean | `false` | ✨ Toggle to custom toolbar (modern design!) |

---

## 📋 Common Use Cases in Plasmic Studio

### Use Case 1: Basic Table with Auto-Generated Columns

```javascript
Props:
- data: $queries.employees.data
- enableSearch: true
- enableSorting: true
- enablePagination: true
```

**Result**: Automatic columns from your data!

---

### Use Case 2: Table with Custom Columns

```javascript
Props:
- data: $queries.employees.data
- columns: [
    { key: 'name', title: 'Full Name', sortable: true, filterable: true, type: 'text' },
    { key: 'age', title: 'Age', sortable: true, filterable: true, type: 'number' },
    { key: 'department', title: 'Department', sortable: true, filterable: true, type: 'dropdown' },
    { key: 'joinDate', title: 'Join Date', sortable: true, filterable: true, type: 'date' }
  ]
```

**Column Types Available:**
- `text` - Text input filter
- `number` - Number input filter
- `date` - Date picker filter
- `dropdown` - Dropdown select filter (auto-detected for < 10 unique values)
- `boolean` - Yes/No filter

---

### Use Case 3: Table with Custom Filters (Better UX!)

```javascript
Props:
- data: $queries.employees.data
- useCustomFilters: true  // ⭐ This is the magic toggle!
- enableSearch: true
```

**What you get:**
- Dedicated filter row above the table
- All filters visible at once
- Cleaner, more organized layout
- Better mobile experience

**Visual Difference:**

```
Native Mode:
┌─────────────────────────┐
│ Name ▼ | Age ▼ | City ▼│
│ [____] | [___] | [____]│
└─────────────────────────┘

Custom Mode:
┌─────────────────────────┐
│  Name: [______]  Age: [___]  │
│  Department: [▼]  City: [▼]  │
├─────────────────────────┤
│ Name | Age | Department │
└─────────────────────────┘
```

---

### Use Case 4: Table with Custom Toolbar (Modern Design!)

```javascript
Props:
- data: $queries.employees.data
- useCustomToolbar: true  // ⭐ Another magic toggle!
- enableSearch: true
```

**What you get:**
- Modern, spacious toolbar design
- Better visual hierarchy
- Improved mobile layout
- Cleaner button spacing

---

### Use Case 5: Table with Row Expansion

Perfect for master-detail views (Orders → Order Items, Employees → Projects, etc.)

```javascript
Props:
- data: $queries.orders.data  // Data with nested arrays
- enableRowExpansion: true
- nestedDataKey: "items"  // Name of the nested array field
- dataKey: "id"  // Unique identifier field
```

**Your data structure:**
```javascript
[
  {
    id: 1,
    orderNumber: "ORD-001",
    total: 500,
    items: [  // ← Nested data auto-detected!
      { product: "Product A", quantity: 2, price: 100 },
      { product: "Product B", quantity: 3, price: 100 }
    ]
  }
]
```

**Result**: 
- Expandable rows with arrow icons
- Auto-generated nested table
- Single "Expand All" / "Collapse All" button (changes text dynamically!)

---

### Use Case 6: Complete Configuration

```javascript
Props:
- data: $queries.employees.data
- columns: [/* your custom columns */]
- dataKey: "id"

// Features
- enableSearch: true
- enableSorting: true
- enablePagination: true
- enableRowExpansion: true

// Custom UI (Toggle as needed!)
- useCustomFilters: true
- useCustomToolbar: true

// Configuration
- pageSize: 10
- pageSizeOptions: [5, 10, 25, 50]
- tableSize: "normal"  // small | normal | large
- responsiveLayout: "scroll"  // scroll | reflow | stack

// Row Expansion
- nestedDataKey: "projects"

// Events
- onRowClick: (rowData, index) => { /* your code */ }
- onRefresh: () => { /* your code */ }
```

---

## 🎨 Styling in Plasmic Studio

### Table Size Options

```javascript
tableSize: "small"   // Compact for dashboards
tableSize: "normal"  // Default balanced size
tableSize: "large"   // Spacious for detailed data
```

### Responsive Layout

```javascript
responsiveLayout: "scroll"  // Horizontal scroll (default)
responsiveLayout: "reflow"  // Stacks columns
responsiveLayout: "stack"   // Alternative stacking
```

### Custom Styling

Add custom CSS classes or inline styles:

```javascript
Props:
- className: "my-custom-table"
- style: { 
    padding: "2rem", 
    backgroundColor: "#f9fafb",
    borderRadius: "0.75rem"
  }
```

---

## 🎭 Responsive Design

SimpleDataTable uses **em/rem units** throughout for true responsive design:

- **Desktop (> 768px)**: Full size with standard spacing
- **Tablet (480px - 768px)**: Slightly reduced font sizes
- **Mobile (< 480px)**: Compact layout with minimal padding

**All sizing automatically scales based on root font size!**

---

## 🎯 Event Handlers in Plasmic Studio

### onRowClick

Triggered when a row is clicked:

```javascript
onRowClick: (rowData, index) => {
  // Navigate to detail page
  $ctx.router.push(`/details/${rowData.id}`);
  
  // Or update state
  $state.selectedEmployee = rowData;
  
  // Or show a modal
  $state.showModal = true;
}
```

### onRefresh

Triggered when the refresh button is clicked:

```javascript
onRefresh: () => {
  // Refetch your query
  $queries.employees.refetch();
  
  // Or show a notification
  console.log("Data refreshed!");
}
```

---

## 💡 Pro Tips for Plasmic Studio

### 1. **Connect to Plasmic CMS**
```javascript
data: $queries.yourCMSTable.data
```

### 2. **Use Dynamic Props**
```javascript
// Change table size based on screen size
tableSize: $ctx.isMobile ? "small" : "normal"

// Enable features conditionally
enableSearch: $ctx.user.role === "admin"
```

### 3. **Combine with Plasmic State**
```javascript
// Store selected rows
onRowClick: (rowData) => {
  $state.selectedItem = rowData;
}

// Then use elsewhere in your page
$state.selectedItem.name
```

### 4. **Performance Optimization**
```javascript
// For large datasets, enable pagination
enablePagination: true
pageSize: 25  // Reasonable for performance
```

### 5. **Better UX Combination**
```javascript
// Use both custom UI modes together!
useCustomFilters: true
useCustomToolbar: true

// Result: Best possible user experience
```

---

## 🔄 Migration from PrimeDataTable

If you're currently using PrimeDataTable in Plasmic Studio and only need basic features:

**Before (PrimeDataTable):**
```javascript
Component: PrimeReact Data Table
Props:
- data: $queries.employees.data
- enableSearch: true
- enableSorting: true
- enablePagination: true
- enableColumnFilter: true
- filterDisplay: "row"
```

**After (SimpleDataTable):**
```javascript
Component: Simple Data Table
Props:
- data: $queries.employees.data
- useCustomFilters: true  // Better than native filters!
- useCustomToolbar: true  // Modern design!
```

**Benefits:**
- ⚡ 86% smaller bundle size
- 🎨 Cleaner, more intuitive UI
- 📱 Better mobile experience
- 🔧 Easier to configure

---

## ❓ Troubleshooting in Plasmic Studio

### Q: Table not showing any data?

**A:** Check your data prop:
1. Make sure the query has data: `$queries.yourQuery.data`
2. Check if the query is loading: `$queries.yourQuery.isLoading`
3. Verify the data structure in the Plasmic debugger

### Q: Columns not appearing?

**A:** SimpleDataTable auto-generates columns from your data. If you see no columns:
1. Ensure your data is not empty
2. Ensure each data item is an object with properties
3. Try refreshing the Plasmic canvas

### Q: Custom filters not showing?

**A:** Make sure:
1. `useCustomFilters` is set to `true`
2. Your columns have `filterable: true` (default if not specified)
3. Refresh the canvas to see the change

### Q: Row expansion not working?

**A:** Verify:
1. `enableRowExpansion` is `true`
2. Your data has nested arrays
3. `nestedDataKey` matches your nested array field name
4. `dataKey` is set and unique for each row

### Q: Expand All button not changing text?

**A:** This should work automatically. If not:
1. Ensure you're using the latest version
2. Check that `dataKey` is properly set
3. Verify your data has the `dataKey` field

---

## 🎉 You're Ready!

You now have everything you need to use **SimpleDataTable** in Plasmic Studio!

**Remember the key features:**
- ✅ Auto-generated columns
- ✅ Toggle between native and custom UI modes
- ✅ Single expand/collapse button
- ✅ True responsive with em/rem units
- ✅ 86% smaller than PrimeDataTable

**Quick wins:**
1. Drop component into canvas
2. Connect data: `$queries.yourQuery.data`
3. Toggle custom UI: `useCustomFilters: true` + `useCustomToolbar: true`
4. Done! 🚀

---

## 📚 Additional Resources

- **Full Documentation**: See `SimpleDataTable.README.md`
- **Quick Start Guide**: See `QUICK_START.md`
- **Comparison Guide**: See `COMPARISON_GUIDE.md`
- **Live Example**: See `SimpleDataTableExample.js`

Happy building in Plasmic! 🎨✨

