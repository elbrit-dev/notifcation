# PrimeDataTable - Advanced React Data Table Component

This is a comprehensive data table component built with PrimeReact, featuring advanced functionality including expandable rows, pivot tables, auto-merge, column grouping, and CMS integration.

## Features

### 🚀 Core Features
- **Expandable Rows** - Click to expand rows with custom content templates
- **Pivot Tables** - Excel-like pivot functionality with drag-and-drop configuration
- **Auto-Merge** - Automatic data merging for complex data structures
- **Column Grouping** - Intelligent column organization with custom grouping
- **Advanced Filtering** - Multiple filter types (dropdown, date, number, boolean)
- **CMS Integration** - Direct Plasmic CMS integration for configuration persistence

### 📊 Expandable Table Feature
The expandable table feature automatically detects and renders nested data structures without requiring hardcoded field names:

```jsx
<PrimeDataTable
  data={anyNestedData}
  enableRowExpansion={true}
  // No need to specify rowExpansionTemplate - it auto-detects structure!
/>
```

**Key Features:**
✅ **Auto-Detection**: Automatically finds nested arrays in your data  
✅ **Dynamic Rendering**: Works with any field names (not hardcoded)  
✅ **Multi-Level Support**: Handles unlimited nesting levels  
✅ **Smart Formatting**: Automatically formats field names and values  

**Props:**
- `enableRowExpansion` - Enable/disable row expansion
- `rowExpansionTemplate` - Custom template for expanded content (optional)
- `expandedRows` - Control which rows are expanded
- `onRowToggle` - Callback when rows are expanded/collapsed

### 🔄 Dynamic Nested Expansion
The component automatically handles nested data structures of any depth:

**Example 1: Customer → Invoice → Brand**
```jsx
const customerData = [
  {
    customerName: "ABC Corp",
    location: "Mumbai",
    invoices: [
      {
        invoiceNumber: "INV-001",
        amount: 50000,
        brands: [
          { brandName: "Brand A", incentive: 5000 },
          { brandName: "Brand B", incentive: 3000 }
        ]
      }
    ]
  }
];

<PrimeDataTable
  data={customerData}
  enableRowExpansion={true}
  // Automatically detects 'invoices' and 'brands' arrays!
/>
```

**Example 2: Employee → Department → Projects**
```jsx
const employeeData = [
  {
    employeeName: "John Doe",
    position: "Developer",
    departments: [
      {
        deptName: "Engineering",
        projects: [
          { projectName: "E-commerce", duration: "6 months" },
          { projectName: "Mobile App", duration: "4 months" }
        ]
      }
    ]
  }
];

<PrimeDataTable
  data={employeeData}
  enableRowExpansion={true}
  // Automatically detects 'departments' and 'projects' arrays!
/>
```

**Any Other Structure:**
The component will work with any nested data - just pass your data and enable expansion!

### 🔧 Configuration
- **Filter Types**: Dropdown, date picker, number, text, boolean
- **Pagination**: Configurable page sizes and navigation
- **Sorting**: Single and multiple column sorting
- **Export**: CSV, Excel, PDF export options
- **Responsive**: Mobile-friendly design with responsive columns

## Examples

Check out the examples directory for complete implementations:
- `examples/DynamicExpandableTableExample.jsx` - **NEW!** Dynamic expandable table that auto-detects any nested structure
- `examples/ExpandableTableExample.jsx` - Expandable table with custom templates
- `examples/PivotTableExample.jsx` - Pivot table functionality
- `examples/ColumnGroupingExample.js` - Column grouping and organization

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open your browser to see the result.

You can start editing your project in Plasmic Studio. The page auto-updates as you edit the project.

## Learn More

With Plasmic, you can enable non-developers on your team to publish pages and content into your website or app.

To learn more about Plasmic, take a look at the following resources:

- [Plasmic Website](https://www.plasmic.app/)
- [Plasmic Documentation](https://docs.plasmic.app/learn/)
- [Plasmic Community Forum](https://forum.plasmic.app/)

You can check out [the Plasmic GitHub repository](https://github.com/plasmicapp/plasmic) - your feedback and contributions are welcome!

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open your browser to see the result.

You can start editing your project in Plasmic Studio. The page auto-updates as you edit the project.

## Learn More

With Plasmic, you can enable non-developers on your team to publish pages and content into your website or app.

To learn more about Plasmic, take a look at the following resources:

- [Plasmic Website](https://www.plasmic.app/)
- [Plasmic Documentation](https://docs.plasmic.app/learn/)
- [Plasmic Community Forum](https://forum.plasmic.app/)

You can check out [the Plasmic GitHub repository](https://github.com/plasmicapp/plasmic) - your feedback and contributions are welcome!
