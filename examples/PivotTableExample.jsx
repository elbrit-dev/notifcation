import React from 'react';
import PrimeDataTable from '../components/PrimeDataTable';

// Sample data matching the user's structure
const sampleData = [
  {
    drCode: "00000001",
    drName: "Yuvaraj",
    salesTeam: "Elbrit Coimbatore",
    date: "2025-04-01",
    serviceAmount: 0,
    supportValue: 16521,
    category: "Service"
  },
  {
    drCode: "00000002", 
    drName: "Rajesh",
    salesTeam: "Elbrit Chennai",
    date: "2025-04-01",
    serviceAmount: 5000,
    supportValue: 12000,
    category: "Service"
  },
  {
    drCode: "00000003",
    drName: "Priya",
    salesTeam: "Elbrit Bangalore",
    date: "2025-04-01", 
    serviceAmount: 3500,
    supportValue: 8500,
    category: "Support"
  },
  {
    drCode: "00000001",
    drName: "Yuvaraj",
    salesTeam: "Elbrit Coimbatore",
    date: "2025-04-02",
    serviceAmount: 2500,
    supportValue: 18000,
    category: "Service"
  },
  {
    drCode: "00000002",
    drName: "Rajesh", 
    salesTeam: "Elbrit Chennai",
    date: "2025-04-02",
    serviceAmount: 7500,
    supportValue: 14500,
    category: "Service"
  },
  {
    drCode: "00000003",
    drName: "Priya",
    salesTeam: "Elbrit Bangalore", 
    date: "2025-04-02",
    serviceAmount: 4000,
    supportValue: 9000,
    category: "Support"
  }
];

// Example with complex field names (like user's data structure)
const complexFieldData = [
  {
    drCode: "00000001",
    drName: "Yuvaraj",
    salesTeam: "Elbrit Coimbatore",
    "2025-04-01__serviceAmount": 0,
    "2025-04-01__supportValue": 16521,
    "2025-04-02__serviceAmount": 2500,
    "2025-04-02__supportValue": 18000,
    "serviceAmount Total": 2500,
    "supportValue Total": 34521
  },
  {
    drCode: "00000002",
    drName: "Rajesh",
    salesTeam: "Elbrit Chennai", 
    "2025-04-01__serviceAmount": 5000,
    "2025-04-01__supportValue": 12000,
    "2025-04-02__serviceAmount": 7500,
    "2025-04-02__supportValue": 14500,
    "serviceAmount Total": 12500,
    "supportValue Total": 26500
  }
];

const PivotTableExample = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">PrimeDataTable Pivot Examples</h1>
      
      {/* Example 1: Basic Pivot Table */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Example 1: Basic Pivot Table</h2>
        <p className="mb-4 text-gray-600">
          Group by doctor name and sales team, show values for different dates
        </p>
        <PrimeDataTable
          data={sampleData}
          enablePivotTable={true}
          pivotConfig={{
            enabled: true,
            rows: ["drName", "salesTeam"], // Group by doctor name and sales team
            columns: ["date"], // Pivot on dates
            values: [
              { field: "serviceAmount", aggregation: "sum" },
              { field: "supportValue", aggregation: "sum" }
            ],
            showGrandTotals: true,
            showRowTotals: true,
            numberFormat: "en-US",
            currency: "USD",
            precision: 0
          }}
          currencyColumns={["serviceAmount", "supportValue"]}
          enableExport={true}
          enableSearch={true}
          enableColumnFilter={true}
        />
      </div>

      {/* Example 2: Category-based Pivot */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Example 2: Category-based Pivot</h2>
        <p className="mb-4 text-gray-600">
          Group by sales team, pivot on category, show average values
        </p>
        <PrimeDataTable
          data={sampleData}
          enablePivotTable={true}
          pivotConfig={{
            enabled: true,
            rows: ["salesTeam"],
            columns: ["category"],
            values: [
              { field: "serviceAmount", aggregation: "average" },
              { field: "supportValue", aggregation: "sum" }
            ],
            showGrandTotals: true,
            showRowTotals: true,
            numberFormat: "en-US",
            currency: "USD",
            precision: 2
          }}
          currencyColumns={["serviceAmount", "supportValue"]}
        />
      </div>

      {/* Example 3: Simple Aggregation (No Column Grouping) */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Example 3: Simple Aggregation</h2>
        <p className="mb-4 text-gray-600">
          Group by doctor name, show total values (no column pivoting)
        </p>
        <PrimeDataTable
          data={sampleData}
          enablePivotTable={true}
          pivotConfig={{
            enabled: true,
            rows: ["drName"],
            columns: [], // No column grouping
            values: [
              { field: "serviceAmount", aggregation: "sum" },
              { field: "supportValue", aggregation: "sum" },
              { field: "serviceAmount", aggregation: "count" }
            ],
            showGrandTotals: true,
            showRowTotals: false, // Not applicable without column grouping
            numberFormat: "en-US",
            currency: "USD",
            precision: 0
          }}
          currencyColumns={["serviceAmount", "supportValue"]}
        />
      </div>

      {/* Example 4: Multiple Aggregations */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Example 4: Multiple Aggregations</h2>
        <p className="mb-4 text-gray-600">
          Show sum, average, min, and max for the same field
        </p>
        <PrimeDataTable
          data={sampleData}
          enablePivotTable={true}
          pivotConfig={{
            enabled: true,
            rows: ["salesTeam"],
            columns: ["date"],
            values: [
              { field: "serviceAmount", aggregation: "sum" },
              { field: "serviceAmount", aggregation: "average" },
              { field: "serviceAmount", aggregation: "min" },
              { field: "serviceAmount", aggregation: "max" }
            ],
            showGrandTotals: true,
            showRowTotals: true,
            numberFormat: "en-US",
            currency: "USD",
            precision: 2
          }}
          currencyColumns={["serviceAmount"]}
        />
      </div>

      {/* Example 5: Working with Complex Field Names */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Example 5: Regular Table with Complex Field Names</h2>
        <p className="mb-4 text-gray-600">
          Display data as-is without pivoting (like the user's original data structure)
        </p>
        <PrimeDataTable
          data={complexFieldData}
          enablePivotTable={false} // Disabled to show original structure
          enableColumnGrouping={true}
          enableAutoColumnGrouping={true}
          groupConfig={{
            enableHeaderGroups: true,
            enableFooterGroups: true,
            fieldSeparator: "__",
            dateFieldPattern: /^\d{4}-\d{2}-\d{2}$/,
            customGroupMappings: {
              "service": "Service Metrics",
              "support": "Support Metrics"
            }
          }}
          currencyColumns={["serviceAmount Total", "supportValue Total"]}
          numberFilterColumns={["serviceAmount Total", "supportValue Total"]}
          enableSearch={true}
          enableExport={true}
        />
      </div>

      {/* Configuration Examples */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Pivot Configuration Quick Reference</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Row Grouping</h4>
            <code className="text-sm bg-white p-2 rounded block">
              rows: ["drName", "salesTeam"]
            </code>
            <p className="text-sm text-gray-600 mt-1">Fields to group rows by (like Excel's "Rows" area)</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Column Pivoting</h4>
            <code className="text-sm bg-white p-2 rounded block">
              columns: ["date", "category"]
            </code>
            <p className="text-sm text-gray-600 mt-1">Fields to create column headers from (like Excel's "Columns" area)</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Value Aggregation</h4>
            <code className="text-sm bg-white p-2 rounded block">
              values: [<br/>
              &nbsp;&nbsp;&#123; field: "amount", aggregation: "sum" &#125;,<br/>
              &nbsp;&nbsp;&#123; field: "count", aggregation: "count" &#125;<br/>
              ]
            </code>
            <p className="text-sm text-gray-600 mt-1">Fields to aggregate with sum, count, average, min, max</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Totals Display</h4>
            <code className="text-sm bg-white p-2 rounded block">
              showGrandTotals: true,<br/>
              showRowTotals: true,<br/>
              showColumnTotals: true
            </code>
            <p className="text-sm text-gray-600 mt-1">Control which totals to display</p>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-semibold mb-2">Available Aggregation Functions</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <span className="bg-white p-2 rounded">sum</span>
            <span className="bg-white p-2 rounded">count</span>
            <span className="bg-white p-2 rounded">average</span>
            <span className="bg-white p-2 rounded">min</span>
            <span className="bg-white p-2 rounded">max</span>
            <span className="bg-white p-2 rounded">first</span>
            <span className="bg-white p-2 rounded">last</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PivotTableExample; 