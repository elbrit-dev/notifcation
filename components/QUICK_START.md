# SimpleDataTable - Quick Start Guide

Get up and running with SimpleDataTable in 5 minutes! ⚡

---

## 📦 Installation

```bash
# Install PrimeReact (peer dependency)
npm install primereact primeicons

# Install lucide-react for icons
npm install lucide-react
```

---

## 🚀 Basic Setup (30 seconds)

### Step 1: Import the component

```jsx
import SimpleDataTable from './components/SimpleDataTable';
```

### Step 2: Prepare your data

```jsx
const myData = [
  { id: 1, name: 'John Doe', age: 30, city: 'New York' },
  { id: 2, name: 'Jane Smith', age: 25, city: 'London' },
  { id: 3, name: 'Bob Johnson', age: 35, city: 'Paris' }
];
```

### Step 3: Render the table

```jsx
<SimpleDataTable data={myData} />
```

**That's it!** ✨ You have a fully functional table with:
- Auto-generated columns
- Sorting
- Search
- Pagination

---

## 🎨 Add Custom Filters (1 minute)

Toggle the custom filters for better UX:

```jsx
<SimpleDataTable 
  data={myData}
  useCustomFilters={true} // ← Add this line
/>
```

**Result:**
- Dedicated filter row appears
- All filters visible at once
- Better organized layout

---

## 🎯 Add Custom Toolbar (1 minute)

Switch to the modern custom toolbar:

```jsx
<SimpleDataTable 
  data={myData}
  useCustomToolbar={true} // ← Add this line
  onRefresh={handleRefresh} // Optional: add refresh button
/>
```

**Result:**
- Cleaner, more spacious design
- Better mobile layout
- Modern UI

---

## 📂 Add Row Expansion (2 minutes)

### Step 1: Prepare data with nested items

```jsx
const dataWithNested = [
  {
    id: 1,
    name: 'Order #1001',
    total: 500,
    items: [ // ← Nested data
      { product: 'Product A', quantity: 2, price: 100 },
      { product: 'Product B', quantity: 3, price: 100 }
    ]
  }
];
```

### Step 2: Enable row expansion

```jsx
<SimpleDataTable 
  data={dataWithNested}
  enableRowExpansion={true} // ← Enable expansion
  nestedDataKey="items" // ← Specify nested data key
/>
```

**Result:**
- Expandable rows with arrow icons
- Auto-generated nested table
- Single "Expand All" / "Collapse All" button

---

## 🎨 Customize Expansion (Optional)

Create your own expansion template:

```jsx
const customTemplate = (rowData) => {
  return (
    <div style={{ padding: '1rem', backgroundColor: '#f9fafb' }}>
      <h4>Details for {rowData.name}</h4>
      <p>Email: {rowData.email}</p>
      <p>Phone: {rowData.phone}</p>
    </div>
  );
};

<SimpleDataTable 
  data={myData}
  enableRowExpansion={true}
  rowExpansionTemplate={customTemplate} // ← Use custom template
/>
```

---

## 🔧 Common Configurations

### 1. Disable Features You Don't Need

```jsx
<SimpleDataTable 
  data={myData}
  enableSearch={false} // No search
  enableSorting={false} // No sorting
  enablePagination={false} // Show all rows
/>
```

### 2. Custom Page Size

```jsx
<SimpleDataTable 
  data={myData}
  pageSize={25} // Default 10
  pageSizeOptions={[10, 25, 50, 100]}
/>
```

### 3. Table Sizes

```jsx
// Small - Compact for dashboards
<SimpleDataTable data={myData} tableSize="small" />

// Normal - Default balanced size
<SimpleDataTable data={myData} tableSize="normal" />

// Large - More spacious for detailed data
<SimpleDataTable data={myData} tableSize="large" />
```

### 4. Custom Columns

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
    type: 'number' // Number filter
  },
  { 
    key: 'status', 
    title: 'Status',
    type: 'dropdown' // Dropdown filter
  },
  { 
    key: 'joinDate', 
    title: 'Join Date',
    type: 'date' // Date picker filter
  }
];

<SimpleDataTable 
  data={myData}
  columns={columns}
/>
```

---

## 📱 Responsive Design

SimpleDataTable automatically adjusts to screen size using **em/rem** units:

- **Desktop (> 48rem)**: Full size, standard spacing
- **Tablet (30rem - 48rem)**: Slightly reduced
- **Mobile (< 30rem)**: Compact layout

**No configuration needed!** Just works out of the box.

---

## 🎯 Complete Example

Here's a production-ready example with all common features:

```jsx
import React, { useState } from 'react';
import SimpleDataTable from './components/SimpleDataTable';

const MyComponent = () => {
  const [data] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      department: 'Engineering',
      status: 'Active',
      joinDate: '2023-01-15',
      projects: [
        { name: 'Project A', hours: 120 },
        { name: 'Project B', hours: 80 }
      ]
    },
    // ... more data
  ]);

  const columns = [
    { key: 'name', title: 'Name', type: 'text' },
    { key: 'email', title: 'Email', type: 'text' },
    { key: 'age', title: 'Age', type: 'number' },
    { key: 'department', title: 'Department', type: 'dropdown' },
    { key: 'status', title: 'Status', type: 'dropdown' },
    { key: 'joinDate', title: 'Join Date', type: 'date' }
  ];

  const handleRefresh = () => {
    console.log('Refreshing...');
    // Fetch fresh data
  };

  const handleRowClick = (rowData) => {
    console.log('Clicked:', rowData);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Employee Management</h1>
      
      <SimpleDataTable 
        // Data
        data={data}
        columns={columns}
        dataKey="id"
        
        // Features
        enableSearch={true}
        enableSorting={true}
        enablePagination={true}
        enableRowExpansion={true}
        
        // UI Mode (Toggle as needed)
        useCustomFilters={true}
        useCustomToolbar={true}
        
        // Configuration
        pageSize={10}
        tableSize="normal"
        nestedDataKey="projects"
        
        // Callbacks
        onRefresh={handleRefresh}
        onRowClick={handleRowClick}
      />
    </div>
  );
};

export default MyComponent;
```

---

## 🎓 Learn More

### Run the Example

```bash
# Copy the example component
cp components/SimpleDataTableExample.js pages/example.js

# Start your dev server
npm run dev

# Visit http://localhost:3000/example
```

### Read Full Documentation

- **README**: `SimpleDataTable.README.md` - Complete prop reference
- **Comparison**: `COMPARISON_GUIDE.md` - vs PrimeDataTable
- **Example**: `SimpleDataTableExample.js` - Live code example

---

## 🔥 Pro Tips

### 1. **Always specify `dataKey`**
```jsx
<SimpleDataTable 
  data={myData}
  dataKey="id" // ← Improves performance
/>
```

### 2. **Use column types for better filters**
```jsx
const columns = [
  { key: 'status', type: 'dropdown' }, // ← Auto dropdown
  { key: 'price', type: 'number' }, // ← Number input
  { key: 'date', type: 'date' } // ← Date picker
];
```

### 3. **Toggle custom UI for better UX**
```jsx
<SimpleDataTable 
  useCustomFilters={true} // ← Dedicated filter row
  useCustomToolbar={true} // ← Modern toolbar
/>
```

### 4. **Handle row clicks for navigation**
```jsx
const handleRowClick = (rowData) => {
  router.push(`/details/${rowData.id}`);
};
```

---

## ❓ Troubleshooting

### Q: Columns not showing?
**A:** Make sure your data array is not empty and has valid objects.

### Q: Filters not working?
**A:** Check that `filterable: false` is not set on columns.

### Q: Row expansion not working?
**A:** Ensure:
- `enableRowExpansion={true}` is set
- Your data has nested arrays
- `nestedDataKey` matches your data structure

### Q: Custom filters not appearing?
**A:** Set `useCustomFilters={true}` prop.

### Q: Expand All button not working?
**A:** Make sure `dataKey` is correctly set and unique for each row.

---

## 🆘 Need Help?

1. Check the **README**: `SimpleDataTable.README.md`
2. Review the **Example**: `SimpleDataTableExample.js`
3. Compare features: `COMPARISON_GUIDE.md`
4. Check console for errors

---

## ✅ Checklist

Before going to production:

- [ ] Specified unique `dataKey` prop
- [ ] Tested with your actual data
- [ ] Verified filters work correctly
- [ ] Tested on mobile devices
- [ ] Added error handling for data loading
- [ ] Implemented refresh logic if needed
- [ ] Tested row expansion if enabled
- [ ] Optimized page size for your use case

---

## 🎉 You're Ready!

You now have a fully functional, production-ready table component!

**Next steps:**
- Customize the styling to match your brand
- Add more interactive features
- Integrate with your API
- Deploy and enjoy!

Happy coding! 🚀

