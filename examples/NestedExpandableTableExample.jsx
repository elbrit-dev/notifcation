import React, { useState } from 'react';
import PrimeDataTable from '../components/PrimeDataTable';

const NestedExpandableTableExample = () => {
  // Sample nested data structure
  const sampleData = [
    {
      Customer: "AADITYA PHARMEX",
      EBSCode: "EBS042",
      HQ: "Chennai",
      Incentive: 2000,
      CreditNote: -500,
      invoices: [
        {
          Invoice: "INV-25-10451",
          PostingDate: "2025-07-05",
          HQ: "HQ-Madurai",
          Incentive: 1200,
          CreditNote: 0,
          brands: [
            {
              Brand: "PAINFREE",
              HQ: "HQ-Madurai",
              Incentive: 1200,
              CreditNote: 0
            },
            {
              Brand: "VITAMAX",
              HQ: "HQ-Madurai",
              Incentive: 0,
              CreditNote: -100
            }
          ]
        },
        {
          Invoice: "INV-25-10452",
          PostingDate: "2025-07-06",
          HQ: "HQ-Chennai",
          Incentive: 800,
          CreditNote: -500,
          brands: [
            {
              Brand: "PAINFREE",
              HQ: "HQ-Chennai",
              Incentive: 800,
              CreditNote: -500
            }
          ]
        }
      ]
    },
    {
      Customer: "SRI LAKSHMI AGENCIES",
      EBSCode: "EBS311",
      HQ: "Madurai",
      Incentive: 0,
      CreditNote: -100,
      invoices: [
        {
          Invoice: "CN-25-01001",
          PostingDate: "2025-07-07",
          HQ: "HQ-Madurai",
          Incentive: 0,
          CreditNote: -100,
          brands: [
            {
              Brand: "VITAMAX",
              HQ: "HQ-Madurai",
              Incentive: 0,
              CreditNote: -100
            }
          ]
        }
      ]
    }
  ];

  // State for expanded rows (customer level)
  const [expandedCustomers, setExpandedCustomers] = useState({});
  
  // State for expanded invoices (invoice level)
  const [expandedInvoices, setExpandedInvoices] = useState({});

  // Handle customer row toggle
  const handleCustomerToggle = (e) => {
    setExpandedCustomers(e.data);
    console.log('Expanded customers:', e.data);
  };

  // Handle invoice row toggle
  const handleInvoiceToggle = (e) => {
    setExpandedInvoices(e.data);
    console.log('Expanded invoices:', e.data);
  };

  // Customer expansion template (shows invoices)
  const customerExpansionTemplate = (customerData) => (
    <div className="p-4 bg-blue-50 border-t border-blue-200">
      <h5 className="text-lg font-semibold text-blue-800 mb-4">
        📋 Invoices for {customerData.Customer}
      </h5>
      
      {/* Nested PrimeDataTable for Invoices */}
      <PrimeDataTable
        data={customerData.invoices || []}
        enableRowExpansion={true}
        rowExpansionTemplate={invoiceExpansionTemplate}
        expandedRows={expandedInvoices}
        onRowToggle={handleInvoiceToggle}
        
        // Basic table features
        enableSearch={false}
        enableColumnFilter={true}
        enableSorting={true}
        enablePagination={false}
        
        // Styling
        enableGridLines={true}
        enableStripedRows={true}
        tableSize="small"
        
        // Column configuration
        numberFilterColumns={["Incentive", "CreditNote"]}
        dropdownFilterColumns={["HQ"]
        
        // Export
        enableExport={true}
        exportFilename={`invoices-${customerData.Customer}`}
        
        // Column management
        enableColumnManagement={false}
      />
    </div>
  );

  // Invoice expansion template (shows brands)
  const invoiceExpansionTemplate = (invoiceData) => (
    <div className="p-4 bg-green-50 border-t border-green-200 ml-8">
      <h6 className="text-md font-semibold text-green-800 mb-3">
        🏷️ Brands for Invoice {invoiceData.Invoice}
      </h6>
      
      {/* Nested PrimeDataTable for Brands */}
      <PrimeDataTable
        data={invoiceData.brands || []}
        
        // Basic table features
        enableSearch={false}
        enableColumnFilter={true}
        enableSorting={true}
        enablePagination={false}
        
        // Styling
        enableGridLines={true}
        enableStripedRows={true}
        tableSize="small"
        
        // Column configuration
        numberFilterColumns={["Incentive", "CreditNote"]}
        dropdownFilterColumns={["HQ"]}
        
        // Export
        enableExport={true}
        exportFilename={`brands-${invoiceData.Invoice}`}
        
        // Column management
        enableColumnManagement={false}
      />
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        PrimeDataTable - Nested Expandable Table Example
      </h1>
      
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">
          Features Demonstrated:
        </h2>
        <ul className="text-blue-700 space-y-1">
          <li>• Customer level expansion (shows invoices)</li>
          <li>• Invoice level expansion (shows brands)</li>
          <li>• Nested PrimeDataTable components</li>
          <li>• Hierarchical data structure</li>
          <li>• Independent state management for each level</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <PrimeDataTable
          data={sampleData}
          enableRowExpansion={true}
          rowExpansionTemplate={customerExpansionTemplate}
          expandedRows={expandedCustomers}
          onRowToggle={handleCustomerToggle}
          
          // Basic table features
          enableSearch={true}
          enableColumnFilter={true}
          enableSorting={true}
          enablePagination={true}
          pageSize={10}
          
          // Styling
          enableGridLines={true}
          enableStripedRows={true}
          enableHoverEffect={true}
          tableSize="normal"
          
          // Column configuration
          dropdownFilterColumns={["HQ"]}
          numberFilterColumns={["Incentive", "CreditNote"]}
          
          // Export
          enableExport={true}
          exportFilename="customer-data"
          
          // Column management
          enableColumnManagement={true}
        />
      </div>

      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          How to Use:
        </h3>
        <div className="text-gray-700 space-y-2">
          <p>
            <strong>1. Click the expand icon (▶️)</strong> next to Customer rows to see Invoices
          </p>
          <p>
            <strong>2. Click the expand icon (▶️)</strong> next to Invoice rows to see Brands
          </p>
          <p>
            <strong>3. Each level has its own:</strong> filtering, sorting, and export functionality
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Data Structure Required:
        </h3>
        <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`[
  {
    "Customer": "AADITYA PHARMEX",
    "EBSCode": "EBS042",
    "HQ": "Chennai",
    "Incentive": 2000,
    "CreditNote": -500,
    "invoices": [
      {
        "Invoice": "INV-25-10451",
        "PostingDate": "2025-07-05",
        "HQ": "HQ-Madurai",
        "Incentive": 1200,
        "CreditNote": 0,
        "brands": [
          {
            "Brand": "PAINFREE",
            "HQ": "HQ-Madurai",
            "Incentive": 1200,
            "CreditNote": 0
          }
        ]
      }
    ]
  }
]`}
        </pre>
      </div>

      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h3 className="text-lg font-semibold text-purple-800 mb-2">
          Key Points:
        </h3>
        <ul className="text-purple-700 space-y-1">
          <li>• <strong>Customer level:</strong> Main expandable rows</li>
          <li>• <strong>Invoice level:</strong> Nested expandable rows within customers</li>
          <li>• <strong>Brand level:</strong> Final detail rows within invoices</li>
          <li>• <strong>Independent state:</strong> Each level manages its own expansion state</li>
          <li>• <strong>Nested components:</strong> Each level is a separate PrimeDataTable</li>
        </ul>
      </div>
    </div>
  );
};

export default NestedExpandableTableExample;
