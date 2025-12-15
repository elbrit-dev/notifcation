import React, { useState } from 'react';
import PrimeDataTable from '../components/PrimeDataTable';

const DynamicExpandableTableExample = () => {
  // Example 1: Customer -> Invoice -> Brand structure
  const customerData = [
    {
      id: 1,
      customerName: "ABC Corp",
      location: "Mumbai",
      invoices: [
        {
          invoiceNumber: "INV-001",
          amount: 50000,
          date: "2024-01-15",
          brands: [
            { brandName: "Brand A", incentive: 5000 },
            { brandName: "Brand B", incentive: 3000 }
          ]
        },
        {
          invoiceNumber: "INV-002", 
          amount: 75000,
          date: "2024-01-20",
          brands: [
            { brandName: "Brand C", incentive: 8000 }
          ]
        }
      ]
    },
    {
      id: 2,
      customerName: "XYZ Ltd",
      location: "Delhi",
      orders: [
        {
          orderId: "ORD-001",
          totalValue: 120000,
          status: "Completed",
          products: [
            { productName: "Product X", quantity: 10, price: 8000 },
            { productName: "Product Y", quantity: 5, price: 8000 }
          ]
        }
      ]
    }
  ];

  // Example 2: Employee -> Department -> Projects structure
  const employeeData = [
    {
      id: 1,
      employeeName: "John Doe",
      position: "Developer",
      departments: [
        {
          deptName: "Engineering",
          role: "Full Stack",
          projects: [
            { projectName: "E-commerce Platform", duration: "6 months", tech: "React, Node.js" },
            { projectName: "Mobile App", duration: "4 months", tech: "React Native" }
          ]
        }
      ]
    },
    {
      id: 2,
      employeeName: "Jane Smith",
      position: "Designer",
      teams: [
        {
          teamName: "UI/UX",
          specialization: "User Research",
          assignments: [
            { taskName: "User Interviews", participants: 15, duration: "2 weeks" },
            { taskName: "Prototype Testing", participants: 8, duration: "1 week" }
          ]
        }
      ]
    }
  ];

  const [selectedData, setSelectedData] = useState(customerData);
  const [dataType, setDataType] = useState('customer');

  const toggleDataType = () => {
    if (dataType === 'customer') {
      setSelectedData(employeeData);
      setDataType('employee');
    } else {
      setSelectedData(customerData);
      setDataType('customer');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Dynamic Expandable Table Example
        </h1>
        <p className="text-gray-600 mb-4">
          This example demonstrates how the expandable table automatically detects and renders 
          any nested data structure without hardcoded field names.
        </p>
        
        <div className="flex gap-4 mb-4">
          <button
            onClick={toggleDataType}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Switch to {dataType === 'customer' ? 'Employee' : 'Customer'} Data
          </button>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Current Data Structure:</h3>
          <p className="text-blue-700 text-sm">
            {dataType === 'customer' 
              ? "Customer → Invoices → Brands (3 levels deep)"
              : "Employee → Departments/Teams → Projects/Assignments (3 levels deep)"
            }
          </p>
        </div>
      </div>

      <PrimeDataTable
        data={selectedData}
        enableRowExpansion={true}
        // No need to specify rowExpansionTemplate - it will auto-detect the structure!
        // The component will automatically find nested arrays and render them appropriately
      />
    </div>
  );
};

export default DynamicExpandableTableExample;
