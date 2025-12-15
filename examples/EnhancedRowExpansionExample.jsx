import React, { useState } from 'react';
import PrimeDataTable from '../components/PrimeDataTable';

export default function EnhancedRowExpansionExample() {
  // Sample data with nested structures
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
          status: 'DELIVERED',
          items: [
            { product: 'Pregabalin 75mg', qty: 500, price: 15 },
            { product: 'Pregabalin 150mg', qty: 300, price: 18 }
          ]
        },
        {
          orderId: 'ORD-002',
          customer: 'Clinic B',
          date: '2025-01-20',
          amount: 22000,
          status: 'PENDING',
          items: [
            { product: 'Pregabalin 300mg', qty: 400, price: 22 }
          ]
        }
      ],
      inventory: [
        { warehouse: 'Main', stock: 25000, location: 'Zone A' },
        { warehouse: 'Secondary', stock: 40244, location: 'Zone B' }
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
          status: 'DELIVERED',
          items: [
            { product: 'Metformin 500mg', qty: 600, price: 12 },
            { product: 'Metformin 1000mg', qty: 400, price: 15 }
          ]
        }
      ],
      inventory: [
        { warehouse: 'Main', stock: 30000, location: 'Zone C' },
        { warehouse: 'Secondary', stock: 15000, location: 'Zone D' }
      ]
    },
    {
      id: 3,
      brand: 'ASPIRIN',
      quantity_total: 30000,
      quantity: 30000,
      orders: [],
      inventory: [
        { warehouse: 'Main', stock: 20000, location: 'Zone E' },
        { warehouse: 'Secondary', stock: 10000, location: 'Zone F' }
      ]
    }
  ];

  const [expandedRows, setExpandedRows] = useState({});

  const handleRowToggle = (e) => {
    setExpandedRows(e.data);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Enhanced Row Expansion Example
      </h1>
      
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">
          Features Demonstrated:
        </h2>
        <ul className="text-blue-700 space-y-1">
          <li>• Dynamic nested DataTables for arrays</li>
          <li>• Automatic column detection and formatting</li>
          <li>• Expand/Collapse all functionality</li>
          <li>• Smart row expansion detection</li>
          <li>• Responsive nested table design</li>
        </ul>
      </div>

      <PrimeDataTable
        data={sampleData}
        enableRowExpansion={true}
        expandedRows={expandedRows}
        onRowToggle={handleRowToggle}
        enableSearch={true}
        enableColumnFilter={true}
        enableSorting={true}
        enablePagination={true}
        enableExport={true}
        pageSize={10}
        tableSize="normal"
        className="enhanced-expansion-demo"
        style={{ minHeight: '600px' }}
      />
    </div>
  );
}
