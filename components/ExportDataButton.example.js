import React from 'react';
import ExportDataButton from './ExportDataButton';

/**
 * Example usage of ExportDataButton component
 * 
 * This file demonstrates how to use the ExportDataButton with:
 * 1. Simple array of JSON objects
 * 2. Array with nested/expansion data
 * 3. Custom column definitions
 * 4. Different button styles and variants
 */

const ExportDataButtonExample = () => {
  // Example 1: Simple data (flat array of objects)
  const simpleData = [
    { id: 1, name: 'John Doe', age: 30, city: 'New York', salary: 75000 },
    { id: 2, name: 'Jane Smith', age: 28, city: 'Los Angeles', salary: 82000 },
    { id: 3, name: 'Bob Johnson', age: 35, city: 'Chicago', salary: 68000 },
    { id: 4, name: 'Alice Williams', age: 32, city: 'Houston', salary: 91000 },
  ];

  // Example 2: Data with nested/expansion rows
  const nestedData = [
    {
      id: 1,
      company: 'Tech Corp',
      industry: 'Technology',
      revenue: 5000000,
      employees: [
        { empId: 'E001', name: 'John Doe', position: 'Engineer', salary: 75000 },
        { empId: 'E002', name: 'Jane Smith', position: 'Manager', salary: 95000 },
      ]
    },
    {
      id: 2,
      company: 'Finance Inc',
      industry: 'Finance',
      revenue: 3500000,
      employees: [
        { empId: 'F001', name: 'Bob Johnson', position: 'Analyst', salary: 68000 },
        { empId: 'F002', name: 'Alice Williams', position: 'Director', salary: 110000 },
        { empId: 'F003', name: 'Charlie Brown', position: 'Accountant', salary: 62000 },
      ]
    },
    {
      id: 3,
      company: 'Retail Co',
      industry: 'Retail',
      revenue: 2800000,
      employees: [
        { empId: 'R001', name: 'David Lee', position: 'Store Manager', salary: 55000 },
      ]
    },
  ];

  // Example 3: Custom column definitions
  const customColumns = [
    { key: 'id', title: 'ID', type: 'number' },
    { key: 'name', title: 'Full Name', type: 'text' },
    { key: 'age', title: 'Age (years)', type: 'number' },
    { key: 'city', title: 'Location', type: 'text' },
    { key: 'salary', title: 'Annual Salary', type: 'number' },
  ];

  // Example 4: Data with different nested key names
  const dataWithItems = [
    {
      orderId: 'ORD-001',
      customer: 'ABC Corp',
      orderDate: '2024-01-15',
      totalAmount: 15000,
      items: [
        { sku: 'PROD-A', product: 'Laptop', quantity: 5, price: 1200 },
        { sku: 'PROD-B', product: 'Mouse', quantity: 10, price: 25 },
        { sku: 'PROD-C', product: 'Keyboard', quantity: 5, price: 75 },
      ]
    },
    {
      orderId: 'ORD-002',
      customer: 'XYZ Inc',
      orderDate: '2024-01-16',
      totalAmount: 8500,
      items: [
        { sku: 'PROD-D', product: 'Monitor', quantity: 8, price: 450 },
        { sku: 'PROD-E', product: 'Webcam', quantity: 10, price: 85 },
      ]
    },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#1f2937' }}>
        ExportDataButton Examples
      </h1>

      {/* Example 1: Simple Data Export */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#374151' }}>
          1. Simple Data Export
        </h2>
        <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
          Export a simple flat array of objects. Columns are auto-generated from data.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <ExportDataButton 
            data={simpleData}
            label="Export Simple Data"
            size="medium"
            variant="primary"
          />
          
          {/* With custom columns */}
          <ExportDataButton 
            data={simpleData}
            columns={customColumns}
            label="Export with Custom Columns"
            size="medium"
            variant="outline"
          />
        </div>
      </div>

      {/* Example 2: Nested/Expansion Data Export */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#374151' }}>
          2. Nested/Expansion Data Export
        </h2>
        <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
          Export data with nested arrays. The export will flatten nested data with parent info.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <ExportDataButton 
            data={nestedData}
            nestedDataKey="employees"
            label="Export Company + Employees"
            size="medium"
            variant="primary"
          />
          
          <ExportDataButton 
            data={dataWithItems}
            nestedDataKey="items"
            label="Export Orders + Items"
            size="medium"
            variant="secondary"
          />
        </div>
      </div>

      {/* Example 3: Different Button Sizes */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#374151' }}>
          3. Different Button Sizes
        </h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <ExportDataButton 
            data={simpleData}
            label="Small"
            size="small"
            variant="primary"
          />
          
          <ExportDataButton 
            data={simpleData}
            label="Medium"
            size="medium"
            variant="primary"
          />
          
          <ExportDataButton 
            data={simpleData}
            label="Large"
            size="large"
            variant="primary"
          />
        </div>
      </div>

      {/* Example 4: Different Button Variants */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#374151' }}>
          4. Different Button Variants
        </h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <ExportDataButton 
            data={simpleData}
            label="Primary"
            size="medium"
            variant="primary"
          />
          
          <ExportDataButton 
            data={simpleData}
            label="Secondary"
            size="medium"
            variant="secondary"
          />
          
          <ExportDataButton 
            data={simpleData}
            label="Outline"
            size="medium"
            variant="outline"
          />
        </div>
      </div>

      {/* Example 5: Using PrimeReact Button */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#374151' }}>
          5. Using PrimeReact Native Button
        </h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <ExportDataButton 
            data={simpleData}
            useNativeButton={true}
            label="Export with PrimeReact"
            size="medium"
          />
        </div>
      </div>

      {/* Example 6: Custom Styling */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#374151' }}>
          6. Custom Button Styling
        </h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <ExportDataButton 
            data={simpleData}
            label="Custom Style"
            size="medium"
            variant="primary"
            buttonStyle={{
              backgroundColor: '#8b5cf6',
              borderColor: '#8b5cf6',
              borderRadius: '9999px',
              padding: '0.75rem 1.5rem'
            }}
          />
        </div>
      </div>

      {/* Example 7: With Callbacks */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#374151' }}>
          7. With Export Callbacks
        </h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <ExportDataButton 
            data={simpleData}
            label="Export with Callbacks"
            size="medium"
            variant="primary"
            onExportStart={(format) => console.log(`Export started: ${format}`)}
            onExportComplete={(format) => console.log(`Export completed: ${format}`)}
          />
        </div>
      </div>

      {/* Example 8: Disabled State */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#374151' }}>
          8. Disabled Button
        </h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <ExportDataButton 
            data={simpleData}
            label="Disabled"
            size="medium"
            variant="primary"
            disabled={true}
          />
          
          <ExportDataButton 
            data={[]}
            label="No Data (Auto-disabled)"
            size="medium"
            variant="primary"
          />
        </div>
      </div>

      {/* Data Preview */}
      <div style={{ marginTop: '3rem', padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#374151' }}>
          Sample Data Preview
        </h3>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#6b7280' }}>
            Simple Data:
          </h4>
          <pre style={{ 
            backgroundColor: '#ffffff', 
            padding: '1rem', 
            borderRadius: '0.375rem',
            overflow: 'auto',
            fontSize: '0.75rem',
            border: '1px solid #e5e7eb'
          }}>
            {JSON.stringify(simpleData.slice(0, 2), null, 2)}
          </pre>
        </div>
        
        <div>
          <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#6b7280' }}>
            Nested Data:
          </h4>
          <pre style={{ 
            backgroundColor: '#ffffff', 
            padding: '1rem', 
            borderRadius: '0.375rem',
            overflow: 'auto',
            fontSize: '0.75rem',
            border: '1px solid #e5e7eb'
          }}>
            {JSON.stringify(nestedData.slice(0, 1), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ExportDataButtonExample;

