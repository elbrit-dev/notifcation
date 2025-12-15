import React, { useState } from 'react';
import PrimeDataTable from '../components/PrimeDataTable';

/**
 * Automatic Row Expansion Example
 * 
 * This example shows how to enable automatic row expansion without any manual configuration.
 * Just set enableRowExpansion={true} and the table will automatically:
 * - Detect rows with nested data (invoices, orders, children, subItems, nestedData)
 * - Show expansion icons for expandable rows
 * - Generate expansion content automatically
 * - Handle expand/collapse all functionality
 */

const AutomaticRowExpansionExample = () => {
  // Sample data with nested structure
  const sampleData = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      invoices: [
        { id: "INV-001", amount: 150.00, date: "2024-01-15", status: "Paid" },
        { id: "INV-002", amount: 75.50, date: "2024-01-20", status: "Pending" }
      ]
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      orders: [
        { id: "ORD-001", product: "Product A", quantity: 2, price: 25.00 },
        { id: "ORD-002", product: "Product B", quantity: 1, price: 50.00 }
      ]
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@example.com",
      children: [
        { name: "Child 1", age: 5, grade: "Kindergarten" },
        { name: "Child 2", age: 8, grade: "3rd Grade" }
      ]
    },
    {
      id: 4,
      name: "Alice Brown",
      email: "alice@example.com"
      // No nested data - this row won't be expandable
    }
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Automatic Row Expansion Example</h1>
      
      <p className="mb-4 text-gray-600">
        This table automatically detects nested data and enables row expansion.
        No manual configuration needed - just set enableRowExpansion={true}!
      </p>

      <PrimeDataTable
        data={sampleData}
        enableRowExpansion={true}
        showExpandAllButtons={true}
        expandAllLabel="Expand All Customers"
        collapseAllLabel="Collapse All Customers"
        expansionColumnStyle={{ width: '4rem' }}
        expansionColumnPosition="left"
        nestedDataConfig={{
          enableNestedSorting: true,
          enableNestedFiltering: true,
          enableNestedPagination: false,
          nestedPageSize: 5
        }}
        // Optional: Custom styling
        className="shadow-lg"
        enableSearch={true}
        enableColumnFilter={true}
        enableSorting={true}
        enablePagination={true}
        pageSize={10}
      />
    </div>
  );
};

export default AutomaticRowExpansionExample;
