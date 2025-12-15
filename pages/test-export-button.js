import React, { useState } from 'react';
import ExportDataButton from '../components/ExportDataButton';

/**
 * Test page for ExportDataButton component
 * Navigate to /test-export-button to see this page
 */

const TestExportButton = () => {
  const [exportStatus, setExportStatus] = useState('');

  // Simple flat data
  const simpleData = [
    { id: 1, name: 'John Doe', age: 30, city: 'New York', salary: 75000, department: 'Engineering' },
    { id: 2, name: 'Jane Smith', age: 28, city: 'Los Angeles', salary: 82000, department: 'Marketing' },
    { id: 3, name: 'Bob Johnson', age: 35, city: 'Chicago', salary: 68000, department: 'Sales' },
    { id: 4, name: 'Alice Williams', age: 32, city: 'Houston', salary: 91000, department: 'Engineering' },
    { id: 5, name: 'Charlie Brown', age: 29, city: 'Phoenix', salary: 73000, department: 'HR' },
  ];

  // Nested data with employees
  const companyData = [
    {
      companyId: 'C001',
      companyName: 'Tech Corp',
      industry: 'Technology',
      location: 'Silicon Valley',
      revenue: 5000000,
      employees: [
        { empId: 'E001', name: 'John Doe', position: 'Senior Engineer', salary: 95000, department: 'Engineering' },
        { empId: 'E002', name: 'Jane Smith', position: 'Product Manager', salary: 105000, department: 'Product' },
        { empId: 'E003', name: 'Mike Wilson', position: 'Engineer', salary: 85000, department: 'Engineering' },
      ]
    },
    {
      companyId: 'C002',
      companyName: 'Finance Inc',
      industry: 'Finance',
      location: 'New York',
      revenue: 3500000,
      employees: [
        { empId: 'F001', name: 'Bob Johnson', position: 'Financial Analyst', salary: 78000, department: 'Finance' },
        { empId: 'F002', name: 'Alice Williams', position: 'Director', salary: 125000, department: 'Management' },
        { empId: 'F003', name: 'Charlie Brown', position: 'Accountant', salary: 65000, department: 'Accounting' },
        { empId: 'F004', name: 'David Lee', position: 'Analyst', salary: 72000, department: 'Finance' },
      ]
    },
    {
      companyId: 'C003',
      companyName: 'Retail Co',
      industry: 'Retail',
      location: 'Chicago',
      revenue: 2800000,
      employees: [
        { empId: 'R001', name: 'Emma Davis', position: 'Store Manager', salary: 55000, department: 'Operations' },
        { empId: 'R002', name: 'Frank Miller', position: 'Sales Associate', salary: 42000, department: 'Sales' },
      ]
    },
  ];

  // Order data with items
  const orderData = [
    {
      orderId: 'ORD-001',
      customer: 'ABC Corporation',
      orderDate: '2024-01-15',
      status: 'Completed',
      totalAmount: 15750,
      items: [
        { sku: 'PROD-A', product: 'Laptop', category: 'Electronics', quantity: 5, unitPrice: 1200, subtotal: 6000 },
        { sku: 'PROD-B', product: 'Mouse', category: 'Accessories', quantity: 10, unitPrice: 25, subtotal: 250 },
        { sku: 'PROD-C', product: 'Keyboard', category: 'Accessories', quantity: 5, unitPrice: 75, subtotal: 375 },
        { sku: 'PROD-D', product: 'Monitor', category: 'Electronics', quantity: 8, unitPrice: 450, subtotal: 3600 },
      ]
    },
    {
      orderId: 'ORD-002',
      customer: 'XYZ Inc',
      orderDate: '2024-01-16',
      status: 'Processing',
      totalAmount: 9350,
      items: [
        { sku: 'PROD-E', product: 'Tablet', category: 'Electronics', quantity: 6, unitPrice: 600, subtotal: 3600 },
        { sku: 'PROD-F', product: 'Webcam', category: 'Accessories', quantity: 10, unitPrice: 85, subtotal: 850 },
        { sku: 'PROD-G', product: 'Headphones', category: 'Accessories', quantity: 15, unitPrice: 120, subtotal: 1800 },
      ]
    },
    {
      orderId: 'ORD-003',
      customer: 'Global Tech',
      orderDate: '2024-01-17',
      status: 'Shipped',
      totalAmount: 25600,
      items: [
        { sku: 'PROD-H', product: 'Server', category: 'Hardware', quantity: 2, unitPrice: 5000, subtotal: 10000 },
        { sku: 'PROD-I', product: 'Router', category: 'Networking', quantity: 8, unitPrice: 250, subtotal: 2000 },
      ]
    },
  ];

  const handleExportStart = (format) => {
    setExportStatus(`Exporting to ${format.toUpperCase()}...`);
  };

  const handleExportComplete = (format) => {
    setExportStatus(`✅ Successfully exported to ${format.toUpperCase()}`);
    setTimeout(() => setExportStatus(''), 3000);
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1400px', 
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          color: '#1f2937',
          marginBottom: '0.5rem'
        }}>
          ExportDataButton Test Page
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
          Test the export functionality with different data types
        </p>
      </div>

      {/* Export Status */}
      {exportStatus && (
        <div style={{
          padding: '1rem',
          marginBottom: '2rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #3b82f6',
          borderRadius: '0.5rem',
          color: '#1e40af',
          fontWeight: '500'
        }}>
          {exportStatus}
        </div>
      )}

      {/* Test Section 1: Simple Data */}
      <div style={{ 
        marginBottom: '3rem',
        padding: '2rem',
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          1. Simple Flat Data Export
        </h2>
        <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
          Export {simpleData.length} employee records with basic information.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <ExportDataButton 
            data={simpleData}
            label="Export Employees"
            size="medium"
            variant="primary"
            onExportStart={handleExportStart}
            onExportComplete={handleExportComplete}
          />
          
          <ExportDataButton 
            data={simpleData}
            label="Export (Secondary)"
            size="medium"
            variant="secondary"
            onExportStart={handleExportStart}
            onExportComplete={handleExportComplete}
          />
          
          <ExportDataButton 
            data={simpleData}
            label="Export (Outline)"
            size="medium"
            variant="outline"
            onExportStart={handleExportStart}
            onExportComplete={handleExportComplete}
          />
        </div>

        {/* Data Preview */}
        <details style={{ marginTop: '1rem' }}>
          <summary style={{ 
            cursor: 'pointer', 
            fontWeight: '500', 
            color: '#3b82f6',
            marginBottom: '0.5rem'
          }}>
            View Sample Data
          </summary>
          <pre style={{ 
            backgroundColor: '#f9fafb', 
            padding: '1rem', 
            borderRadius: '0.5rem',
            overflow: 'auto',
            fontSize: '0.875rem',
            border: '1px solid #e5e7eb'
          }}>
            {JSON.stringify(simpleData.slice(0, 3), null, 2)}
          </pre>
        </details>
      </div>

      {/* Test Section 2: Company + Employees (Nested) */}
      <div style={{ 
        marginBottom: '3rem',
        padding: '2rem',
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          2. Nested Data Export (Companies → Employees)
        </h2>
        <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
          Export {companyData.length} companies with their {companyData.reduce((sum, c) => sum + c.employees.length, 0)} employees. 
          Nested data will be flattened with parent info merged.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <ExportDataButton 
            data={companyData}
            nestedDataKey="employees"
            label="Export Companies + Employees"
            size="medium"
            variant="primary"
            onExportStart={handleExportStart}
            onExportComplete={handleExportComplete}
          />
          
          <ExportDataButton 
            data={companyData}
            nestedDataKey="employees"
            label="Export (Large)"
            size="large"
            variant="outline"
            onExportStart={handleExportStart}
            onExportComplete={handleExportComplete}
          />
        </div>

        {/* Data Preview */}
        <details style={{ marginTop: '1rem' }}>
          <summary style={{ 
            cursor: 'pointer', 
            fontWeight: '500', 
            color: '#3b82f6',
            marginBottom: '0.5rem'
          }}>
            View Sample Data
          </summary>
          <pre style={{ 
            backgroundColor: '#f9fafb', 
            padding: '1rem', 
            borderRadius: '0.5rem',
            overflow: 'auto',
            fontSize: '0.875rem',
            border: '1px solid #e5e7eb'
          }}>
            {JSON.stringify(companyData.slice(0, 1), null, 2)}
          </pre>
        </details>
      </div>

      {/* Test Section 3: Orders + Items (Nested) */}
      <div style={{ 
        marginBottom: '3rem',
        padding: '2rem',
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          3. Nested Data Export (Orders → Items)
        </h2>
        <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
          Export {orderData.length} orders with their {orderData.reduce((sum, o) => sum + o.items.length, 0)} line items. 
          Each item will have order details merged.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <ExportDataButton 
            data={orderData}
            nestedDataKey="items"
            label="Export Orders + Items"
            size="medium"
            variant="primary"
            onExportStart={handleExportStart}
            onExportComplete={handleExportComplete}
          />
          
          <ExportDataButton 
            data={orderData}
            nestedDataKey="items"
            label="Export (Small)"
            size="small"
            variant="secondary"
            onExportStart={handleExportStart}
            onExportComplete={handleExportComplete}
          />
        </div>

        {/* Data Preview */}
        <details style={{ marginTop: '1rem' }}>
          <summary style={{ 
            cursor: 'pointer', 
            fontWeight: '500', 
            color: '#3b82f6',
            marginBottom: '0.5rem'
          }}>
            View Sample Data
          </summary>
          <pre style={{ 
            backgroundColor: '#f9fafb', 
            padding: '1rem', 
            borderRadius: '0.5rem',
            overflow: 'auto',
            fontSize: '0.875rem',
            border: '1px solid #e5e7eb'
          }}>
            {JSON.stringify(orderData.slice(0, 1), null, 2)}
          </pre>
        </details>
      </div>

      {/* Test Section 4: Different Sizes */}
      <div style={{ 
        marginBottom: '3rem',
        padding: '2rem',
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          4. Button Sizes
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
            label="Medium (Default)"
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

      {/* Test Section 5: Custom Styling */}
      <div style={{ 
        marginBottom: '3rem',
        padding: '2rem',
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          5. Custom Styled Buttons
        </h2>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <ExportDataButton 
            data={simpleData}
            label="Purple Rounded"
            size="medium"
            variant="primary"
            buttonStyle={{
              backgroundColor: '#8b5cf6',
              borderColor: '#8b5cf6',
              borderRadius: '9999px',
            }}
          />
          
          <ExportDataButton 
            data={simpleData}
            label="Red Squared"
            size="medium"
            variant="primary"
            buttonStyle={{
              backgroundColor: '#ef4444',
              borderColor: '#ef4444',
              borderRadius: '0.25rem',
            }}
          />
          
          <ExportDataButton 
            data={simpleData}
            label="Green Large Rounded"
            size="large"
            variant="primary"
            buttonStyle={{
              backgroundColor: '#10b981',
              borderColor: '#10b981',
              borderRadius: '0.75rem',
              padding: '0.875rem 2rem',
            }}
          />
        </div>
      </div>

      {/* Test Section 6: Disabled State */}
      <div style={{ 
        marginBottom: '3rem',
        padding: '2rem',
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          6. Disabled States
        </h2>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <ExportDataButton 
            data={simpleData}
            label="Manually Disabled"
            size="medium"
            variant="primary"
            disabled={true}
          />
          
          <ExportDataButton 
            data={[]}
            label="No Data (Auto-disabled)"
            size="medium"
            variant="secondary"
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: '4rem',
        padding: '1.5rem',
        backgroundColor: '#f9fafb',
        borderRadius: '0.5rem',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Click any export button to choose between CSV and Excel (XLSX) formats
        </p>
      </div>
    </div>
  );
};

export default TestExportButton;

