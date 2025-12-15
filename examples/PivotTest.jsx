import React, { useState } from 'react';
import PrimeDataTable from '../components/PrimeDataTable';

const PivotTest = () => {
  const [enablePivot, setEnablePivot] = useState(false);
  const [pivotRows, setPivotRows] = useState([]);
  const [pivotColumns, setPivotColumns] = useState([]);
  const [pivotValues, setPivotValues] = useState([]);

  const testData = [
    {
      drCode: "00000001",
      drName: "Yuvaraj",
      salesTeam: "Elbrit Coimbatore",
      "2025-04-01__serviceAmount": 0,
      "2025-04-01__supportValue": 16521,
      "serviceAmount Total": 0,
      "supportValue Total": 16521
    },
    {
      drCode: "00000002", 
      drName: "Yuvaraj",
      salesTeam: "CND Coimbatore",
      "2025-04-01__serviceAmount": 5000,
      "2025-04-01__supportValue": 12000,
      "serviceAmount Total": 5000,
      "supportValue Total": 12000
    },
    {
      drCode: "00000003",
      drName: "Yuvaraj", 
      salesTeam: "Vasco Coimbatore",
      "2025-04-01__serviceAmount": 3500,
      "2025-04-01__supportValue": 8500,
      "serviceAmount Total": 3500,
      "supportValue Total": 8500
    }
  ];

  const handleTestPivot = () => {
    setEnablePivot(true);
    setPivotRows(["drName", "salesTeam"]);
    setPivotColumns([]);
    setPivotValues([
      { field: "supportValue Total", aggregation: "sum" },
      { field: "serviceAmount Total", aggregation: "sum" }
    ]);
  };

  const handleReset = () => {
    setEnablePivot(false);
    setPivotRows([]);
    setPivotColumns([]);
    setPivotValues([]);
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Pivot Table Test</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-4">Controls</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <input
                type="checkbox"
                checked={enablePivot}
                onChange={(e) => setEnablePivot(e.target.checked)}
                className="mr-2"
              />
              Enable Pivot Table
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Pivot Rows (JSON):</label>
            <input
              type="text"
              value={JSON.stringify(pivotRows)}
              onChange={(e) => {
                try {
                  setPivotRows(JSON.parse(e.target.value));
                } catch (err) {
                  // Ignore invalid JSON
                }
              }}
              className="w-full p-2 border rounded"
              placeholder='["drName", "salesTeam"]'
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Pivot Columns (JSON):</label>
            <input
              type="text"
              value={JSON.stringify(pivotColumns)}
              onChange={(e) => {
                try {
                  setPivotColumns(JSON.parse(e.target.value));
                } catch (err) {
                  // Ignore invalid JSON
                }
              }}
              className="w-full p-2 border rounded"
              placeholder='[]'
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Pivot Values (JSON):</label>
            <input
              type="text"
              value={JSON.stringify(pivotValues)}
              onChange={(e) => {
                try {
                  setPivotValues(JSON.parse(e.target.value));
                } catch (err) {
                  // Ignore invalid JSON
                }
              }}
              className="w-full p-2 border rounded"
              placeholder='[{"field": "supportValue Total", "aggregation": "sum"}]'
            />
          </div>
          
          <div className="space-x-4">
            <button
              onClick={handleTestPivot}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Pivot
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Configuration</h2>
        <div className="bg-gray-50 p-4 rounded">
          <pre className="text-sm">
            {JSON.stringify({
              enablePivotTable: enablePivot,
              pivotRows,
              pivotColumns,
              pivotValues
            }, null, 2)}
          </pre>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Data Table</h2>
        <PrimeDataTable
          data={testData}
          enablePivotTable={enablePivot}
          pivotRows={pivotRows}
          pivotColumns={pivotColumns}
          pivotValues={pivotValues}
          pivotShowGrandTotals={true}
          pivotShowRowTotals={false}
          currencyColumns={["supportValue Total", "serviceAmount Total"]}
          enableExport={true}
          enableSearch={true}
          enableColumnFilter={true}
        />
      </div>
    </div>
  );
};

export default PivotTest; 