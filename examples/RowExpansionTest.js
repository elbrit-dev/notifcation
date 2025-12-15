import React, { useState } from 'react';
import PrimeDataTable from '../components/PrimeDataTable';

const RowExpansionTest = () => {
  const [expandedRows, setExpandedRows] = useState({});

  // Sample data with nested invoices
  const sampleData = [
    {
      id: 1,
      customer: 'John Doe',
      total: 1500,
      invoices: [
        { invoiceNo: 'INV-001', amount: 500, date: '2024-01-15' },
        { invoiceNo: 'INV-002', amount: 1000, date: '2024-01-20' }
      ]
    },
    {
      id: 2,
      customer: 'Jane Smith',
      total: 2300,
      invoices: [
        { invoiceNo: 'INV-003', amount: 800, date: '2024-01-10' },
        { invoiceNo: 'INV-004', amount: 1500, date: '2024-01-25' }
      ]
    },
    {
      id: 3,
      customer: 'Bob Johnson',
      total: 900,
      invoices: [
        { invoiceNo: 'INV-005', amount: 900, date: '2024-01-30' }
      ]
    }
  ];

  const handleRowToggle = (e) => {
    setExpandedRows(e.data);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Row Expansion Test</h1>
      <p className="mb-4 text-gray-600">
        This demonstrates the fixed row expansion functionality. You should now see:
        <br />✅ Arrow expanders on each row
        <br />✅ Expand All / Collapse All buttons
        <br />✅ Clicking arrows expands/collapses rows
        <br />✅ Nested invoice data displays when expanded
      </p>

      <PrimeDataTable
        data={sampleData}
        enableRowExpansion={true}
        showExpandAllButtons={true}
        expandAllLabel="Expand All Customers"
        collapseAllLabel="Collapse All Customers"
        expandedRows={expandedRows}
        onRowToggle={handleRowToggle}
        // Auto-detected expansion template will use 'invoices' field
        nestedDataConfig={{
          enableNestedSorting: true,
          enableNestedFiltering: false
        }}
        // Optional: Custom expansion template
        // rowExpansionTemplate={(data) => (
        //   <div className="p-3">
        //     <h5 className="text-lg font-semibold mb-2">
        //       Invoices for {data.customer}
        //     </h5>
        //     <div className="bg-gray-50 p-3 rounded">
        //       {data.invoices.map(inv => (
        //         <div key={inv.invoiceNo} className="mb-2 p-2 bg-white rounded border">
        //           <strong>{inv.invoiceNo}</strong> - ${inv.amount} ({inv.date})
        //         </div>
        //       ))}
        //     </div>
        //   </div>
        // )}
      />
    </div>
  );
};

export default RowExpansionTest;
