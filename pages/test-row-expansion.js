import React, { useState } from 'react';
import PrimeDataTable from '../components/PrimeDataTable';

export default function TestRowExpansion() {
  // Sample data with nested structures for testing row expansion
  const sampleData = [
    {
      id: 1,
      brand: 'PREGABRIT',
      quantity_total: 65244,
      quantity: 65244,
      orders: [
        {
          orderId: 'ORD-001',
          customer: 'Hospital A',
          date: '2025-01-15',
          amount: 15000,
          status: 'DELIVERED'
        },
        {
          orderId: 'ORD-002',
          customer: 'Clinic B',
          date: '2025-01-20',
          amount: 22000,
          status: 'PENDING'
        }
      ]
    },
    {
      id: 2,
      brand: 'METFORMIN',
      quantity_total: 45000,
      quantity: 45000,
      orders: [
        {
          orderId: 'ORD-003',
          customer: 'Hospital C',
          date: '2025-01-18',
          amount: 18000,
          status: 'DELIVERED'
        }
      ]
    },
    {
      id: 3,
      brand: 'ASPIRIN',
      quantity_total: 30000,
      quantity: 30000,
      orders: []
    }
  ];

  const [expandedRows, setExpandedRows] = useState({});

  const handleRowToggle = (e) => {
    console.log('Row toggle event:', e);
    setExpandedRows(e.data);
  };

  // Custom row expansion template
  const rowExpansionTemplate = (data) => {
    if (!data.orders || data.orders.length === 0) {
      return (
        <div className="p-3 text-gray-500">
          No orders found for {data.brand}
        </div>
      );
    }

    return (
      <div className="p-3">
        <h5 className="text-lg font-semibold mb-3">Orders for {data.brand}</h5>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Order ID</th>
                <th className="border border-gray-300 p-2 text-left">Customer</th>
                <th className="border border-gray-300 p-2 text-left">Date</th>
                <th className="border border-gray-300 p-2 text-left">Amount</th>
                <th className="border border-gray-300 p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((order, index) => (
                <tr key={order.orderId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 p-2">{order.orderId}</td>
                  <td className="border border-gray-300 p-2">{order.customer}</td>
                  <td className="border border-gray-300 p-2">{order.date}</td>
                  <td className="border border-gray-300 p-2">${order.amount.toLocaleString()}</td>
                  <td className="border border-gray-300 p-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Row Expansion Test Page
      </h1>
      
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">
          Test Instructions:
        </h2>
        <ul className="text-blue-700 space-y-1">
          <li>• Click the expand button (▶️) next to any row to expand it</li>
          <li>• Expanded rows will show order details in a nested table</li>
          <li>• Use the "Expand All" and "Collapse All" buttons to test bulk operations</li>
          <li>• Verify that the config error is fixed and expansion works smoothly</li>
        </ul>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Current Expanded Rows: {Object.keys(expandedRows).length}
        </h3>
        <div className="text-sm text-gray-600">
          {Object.keys(expandedRows).length > 0 ? (
            <span>Expanded: {Object.keys(expandedRows).join(', ')}</span>
          ) : (
            <span>No rows expanded</span>
          )}
        </div>
      </div>

      <PrimeDataTable
        data={sampleData}
        enableRowExpansion={true}
        expandedRows={expandedRows}
        onRowToggle={handleRowToggle}
        rowExpansionTemplate={rowExpansionTemplate}
        showExpandAllButtons={true}
        expandAllLabel="Expand All Rows"
        collapseAllLabel="Collapse All Rows"
        enableSearch={true}
        enableColumnFilter={true}
        enableSorting={true}
        enablePagination={true}
        enableExport={true}
        pageSize={10}
        tableSize="normal"
        className="row-expansion-test"
        style={{ minHeight: '600px' }}
      />

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          ✅ Test Results:
        </h3>
        <ul className="text-green-700 space-y-1">
          <li>• Row expansion should work without the "config is not defined" error</li>
          <li>• Expand/collapse buttons should appear for each row</li>
          <li>• Expand All/Collapse All buttons should work</li>
          <li>• Nested order data should display correctly in expanded rows</li>
        </ul>
      </div>
    </div>
  );
}
