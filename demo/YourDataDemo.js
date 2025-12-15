import React from 'react';
import PrimeDataTable from '../components/PrimeDataTable';

// Example using exactly your data structure
const YourDataDemo = () => {
  const yourData = [
    {
      drCode: "00000001",
      drName: "Yuvaraj",
      salesTeam: "Elbrit Coimbatore",
      "2025-04-01__serviceAmount": 0,
      "2025-04-01__supportValue": 16521,
      "serviceAmount Total": 0,
      "supportValue Total": 16521
    },
    // Adding more sample data to show the grouping better
    {
      drCode: "00000002",
      drName: "Priya",
      salesTeam: "Chennai Express",
      "2025-04-01__serviceAmount": 5000,
      "2025-04-01__supportValue": 12000,
      "serviceAmount Total": 5000,
      "supportValue Total": 12000
    },
    {
      drCode: "00000003",
      drName: "Ravi",
      salesTeam: "Bangalore Tech",
      "2025-04-01__serviceAmount": 3500,
      "2025-04-01__supportValue": 8900,
      "serviceAmount Total": 3500,
      "supportValue Total": 8900
    }
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Your Data with Auto Column Grouping</h1>
      <p>
        This shows exactly how your data structure will look with the enhanced column grouping.
        The drCode, drName, and salesTeam remain as individual columns, while the service and 
        support related columns are automatically grouped under "Service" and "Support" headers.
      </p>

      <PrimeDataTable
        data={yourData}
        
        // Enable the column grouping features
        enableColumnGrouping={true}
        enableAutoColumnGrouping={true}
        enableFooterTotals={true}
        
        // Configure number columns for proper filtering and formatting
        numberFilterColumns={[
          "2025-04-01__serviceAmount", 
          "2025-04-01__supportValue", 
          "serviceAmount Total", 
          "supportValue Total"
        ]}
        
        // Configure currency formatting
        currencyColumns={[
          "2025-04-01__serviceAmount", 
          "2025-04-01__supportValue", 
          "serviceAmount Total", 
          "supportValue Total"
        ]}
        
        // Grouping configuration
        groupConfig={{
          enableHeaderGroups: true,
          enableFooterGroups: true,
          groupSeparator: '__', // This detects the pattern in your column names
          ungroupedColumns: ['drCode', 'drName', 'salesTeam'], // These stay as individual columns
          totalColumns: ['serviceAmount Total', 'supportValue Total'], // These are totals
          headerGroupStyle: {
            backgroundColor: '#e3f2fd',
            fontWeight: 'bold',
            textAlign: 'center',
            border: '1px solid #1976d2',
            color: '#1976d2'
          },
          groupStyle: {
            backgroundColor: '#f5f5f5',
            fontSize: '0.9em',
            textAlign: 'center'
          }
        }}
        
        // Footer totals configuration  
        footerTotalsConfig={{
          showTotals: true,
          showCounts: true,
          currency: 'USD',
          precision: 0
        }}
        
        // Enable other useful features
        enableSearch={true}
        enableColumnFilter={true}
        enableSorting={true}
        enablePagination={true}
        enableExport={true}
        pageSize={10}
      />

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f8ff', borderRadius: '4px' }}>
        <h3>What Happened:</h3>
        <ul>
          <li>✅ <strong>drCode, drName, salesTeam</strong> remain as individual columns</li>
          <li>✅ <strong>2025-04-01__serviceAmount</strong> was grouped under "Service"</li>
          <li>✅ <strong>2025-04-01__supportValue</strong> was grouped under "Support"</li>
          <li>✅ <strong>serviceAmount Total</strong> was added to the "Service" group</li>
          <li>✅ <strong>supportValue Total</strong> was added to the "Support" group</li>
          <li>✅ Currency formatting applied to all numeric columns</li>
          <li>✅ Footer totals calculated automatically</li>
        </ul>
      </div>

             <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
         <h3>For Different Data Structures:</h3>
         <p><strong>Built-in word detection works for:</strong></p>
         <ul>
           <li><code>2025-05-01__serviceAmount</code> → Groups under "Service"</li>
           <li><code>Q1__salesRevenue</code> → Groups under "Sales"</li>
           <li><code>Jan2025__marketingSpend</code> → Groups under "Marketing"</li>
           <li><code>period__revenueTotal</code> → Groups under "Revenue"</li>
           <li><code>month__costAnalysis</code> → Groups under "Cost"</li>
           <li><code>year__budgetPlanning</code> → Groups under "Budget"</li>
         </ul>
         
         <p><strong>For custom words, use customGroupMappings:</strong></p>
         <pre style={{ backgroundColor: '#f8f9fa', padding: '8px', borderRadius: '4px', fontSize: '0.9em' }}>
{`groupConfig={{
  customGroupMappings: {
    "inventory": "Inventory",
    "stock": "Stock", 
    "warehouse": "Warehouse",
    "production": "Production"
  }
}}`}
         </pre>
         <p>Then <code>Q1__inventoryCount</code> → Groups under "Inventory"</p>
       </div>
    </div>
  );
};

export default YourDataDemo; 