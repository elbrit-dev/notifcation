import React from 'react';
import PrimeDataTable from '../components/PrimeDataTable';

const ColumnGroupingExample = () => {
  // Sample data with the structure provided by the user
  const sampleData = [
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

  // Enhanced sample data with multiple date periods
  const multiPeriodData = [
    {
      drCode: "00000001",
      drName: "Yuvaraj",
      salesTeam: "Elbrit Coimbatore",
      "2025-04-01__serviceAmount": 0,
      "2025-04-01__supportValue": 16521,
      "2025-05-01__serviceAmount": 2500,
      "2025-05-01__supportValue": 18000,
      "serviceAmount Total": 2500,
      "supportValue Total": 34521
    },
    {
      drCode: "00000002", 
      drName: "Priya",
      salesTeam: "Chennai Express",
      "2025-04-01__serviceAmount": 5000,
      "2025-04-01__supportValue": 12000,
      "2025-05-01__serviceAmount": 3000,
      "2025-05-01__supportValue": 10000,
      "serviceAmount Total": 8000,
      "supportValue Total": 22000
    }
  ];

  // Sample data with different categories (beyond service/support)
  const categoryData = [
    {
      drCode: "00000001",
      drName: "Yuvaraj", 
      salesTeam: "Elbrit Coimbatore",
      "Q1__salesAmount": 15000,
      "Q1__salesCount": 45,
      "Q1__marketingSpend": 3000,
      "Q1__marketingLeads": 120,
      "Q2__salesAmount": 18000,
      "Q2__salesCount": 52,
      "Q2__marketingSpend": 3500,
      "Q2__marketingLeads": 140,
      "salesAmount Total": 33000,
      "marketingSpend Total": 6500
    }
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Column Grouping Examples</h1>
      
      {/* Example 1: Basic Auto-Grouping */}
      <div style={{ marginBottom: '3rem' }}>
        <h2>Example 1: Basic Auto-Grouping (Service & Support)</h2>
        <p>
          This example demonstrates automatic column grouping where columns with patterns like 
          "2025-04-01__serviceAmount" are automatically grouped under "Service" and "Support" headers.
        </p>
        
        <PrimeDataTable
          data={sampleData}
          enableColumnGrouping={true}
          enableAutoColumnGrouping={true}
          enableFooterTotals={true}
          numberFilterColumns={["2025-04-01__serviceAmount", "2025-04-01__supportValue", "serviceAmount Total", "supportValue Total"]}
          currencyColumns={["2025-04-01__serviceAmount", "2025-04-01__supportValue", "serviceAmount Total", "supportValue Total"]}
          groupConfig={{
            enableHeaderGroups: true,
            enableFooterGroups: true,
            groupSeparator: '__',
            ungroupedColumns: ['drCode', 'drName', 'salesTeam'], // These won't be grouped
            totalColumns: ['serviceAmount Total', 'supportValue Total'], // These are total columns
            headerGroupStyle: {
              backgroundColor: '#e3f2fd',
              fontWeight: 'bold',
              textAlign: 'center'
            },
            groupStyle: {
              backgroundColor: '#f5f5f5',
              fontSize: '0.9em'
            }
          }}
          footerTotalsConfig={{
            showTotals: true,
            showCounts: true,
            currency: 'USD',
            precision: 0
          }}
        />
      </div>

      {/* Example 2: Multi-Period Data */}
      <div style={{ marginBottom: '3rem' }}>
        <h2>Example 2: Multi-Period Auto-Grouping</h2>
        <p>
          This example shows how the component handles multiple time periods automatically,
          creating groups for different date ranges.
        </p>
        
        <PrimeDataTable
          data={multiPeriodData}
          enableColumnGrouping={true}
          enableAutoColumnGrouping={true}
          enableFooterTotals={true}
          numberFilterColumns={[
            "2025-04-01__serviceAmount", "2025-04-01__supportValue",
            "2025-05-01__serviceAmount", "2025-05-01__supportValue",
            "serviceAmount Total", "supportValue Total"
          ]}
          currencyColumns={[
            "2025-04-01__serviceAmount", "2025-04-01__supportValue",
            "2025-05-01__serviceAmount", "2025-05-01__supportValue", 
            "serviceAmount Total", "supportValue Total"
          ]}
          groupConfig={{
            enableHeaderGroups: true,
            ungroupedColumns: ['drCode', 'drName', 'salesTeam'],
            totalColumns: ['serviceAmount Total', 'supportValue Total'],
            groupSeparator: '__'
          }}
        />
      </div>

      {/* Example 3: Different Categories */}
      <div style={{ marginBottom: '3rem' }}>
        <h2>Example 3: Sales & Marketing Categories</h2>
        <p>
          This example demonstrates the flexibility of auto-grouping with different business categories
          like Sales and Marketing data.
        </p>
        
        <PrimeDataTable
          data={categoryData}
          enableColumnGrouping={true}
          enableAutoColumnGrouping={true}
          enableFooterTotals={true}
          numberFilterColumns={[
            "Q1__salesAmount", "Q1__salesCount", "Q1__marketingSpend", "Q1__marketingLeads",
            "Q2__salesAmount", "Q2__salesCount", "Q2__marketingSpend", "Q2__marketingLeads",
            "salesAmount Total", "marketingSpend Total"
          ]}
          currencyColumns={["Q1__salesAmount", "Q2__salesAmount", "salesAmount Total", "Q1__marketingSpend", "Q2__marketingSpend", "marketingSpend Total"]}
          groupConfig={{
            enableHeaderGroups: true,
            ungroupedColumns: ['drCode', 'drName', 'salesTeam'],
            totalColumns: ['salesAmount Total', 'marketingSpend Total'],
            groupSeparator: '__'
          }}
        />
      </div>

      {/* Example 4: Custom Grouping Patterns */}
      <div style={{ marginBottom: '3rem' }}>
        <h2>Example 4: Custom Grouping Patterns</h2>
        <p>
          This example shows how to define custom regex patterns for more complex grouping scenarios.
        </p>
        
        <PrimeDataTable
          data={sampleData}
          enableColumnGrouping={true}
          enableAutoColumnGrouping={true}
          groupConfig={{
            enableHeaderGroups: true,
            ungroupedColumns: ['drCode', 'drName', 'salesTeam'],
            groupSeparator: '__',
            groupingPatterns: [
              {
                regex: '(\\d{4}-\\d{2}-\\d{2})__service.*',
                groupName: 'Service Revenue',
                subHeaderExtractor: (key) => {
                  const parts = key.split('__');
                  return `${parts[0]} - ${parts[1]}`;
                }
              },
              {
                regex: '(\\d{4}-\\d{2}-\\d{2})__support.*',
                groupName: 'Support Revenue',
                subHeaderExtractor: (key) => {
                  const parts = key.split('__');
                  return `${parts[0]} - ${parts[1]}`;
                }
              }
            ]
          }}
        />
      </div>

             {/* Example 5: Custom Group Mappings */}
       <div style={{ marginBottom: '3rem' }}>
         <h2>Example 5: Custom Group Mappings</h2>
         <p>
           This example shows how to use custom group mappings for words that aren't built-in.
           Perfect for industry-specific terminology or custom business categories.
         </p>
         
         <PrimeDataTable
           data={[
             {
               drCode: "00000001",
               drName: "Yuvaraj",
               salesTeam: "Elbrit Coimbatore",
               "Q1__inventoryCount": 1500,
               "Q1__inventoryValue": 45000,
               "Q1__warehouseCost": 8000,
               "Q1__warehouseSpace": 250,
               "inventoryTotal": 1500,
               "warehouseTotal": 250
             }
           ]}
           enableColumnGrouping={true}
           enableAutoColumnGrouping={true}
           numberFilterColumns={["Q1__inventoryCount", "Q1__inventoryValue", "Q1__warehouseCost", "Q1__warehouseSpace", "inventoryTotal", "warehouseTotal"]}
           currencyColumns={["Q1__inventoryValue", "Q1__warehouseCost"]}
           groupConfig={{
             enableHeaderGroups: true,
             ungroupedColumns: ['drCode', 'drName', 'salesTeam'],
             groupSeparator: '__',
             customGroupMappings: {
               "inventory": "Inventory Management",
               "warehouse": "Warehouse Operations",
               "production": "Production",
               "quality": "Quality Control"
             }
           }}
         />
       </div>

               {/* Example 6: Manual Column Groups (Traditional Approach) */}
       <div style={{ marginBottom: '3rem' }}>
         <h2>Example 6: Manual Column Groups</h2>
        <p>
          For more control, you can also define column groups manually using the traditional approach.
        </p>
        
        <PrimeDataTable
          data={sampleData}
          enableColumnGrouping={true}
          enableAutoColumnGrouping={false} // Disabled auto-grouping
          columnGroups={[
            {
              header: 'Basic Info',
              columns: [
                { header: 'Code', field: 'drCode' },
                { header: 'Name', field: 'drName' },
                { header: 'Team', field: 'salesTeam' }
              ]
            },
            {
              header: 'Financial Data',
              columns: [
                { header: 'Service', field: '2025-04-01__serviceAmount' },
                { header: 'Support', field: '2025-04-01__supportValue' },
                { header: 'Service Total', field: 'serviceAmount Total' },
                { header: 'Support Total', field: 'supportValue Total' }
              ]
            }
          ]}
        />
      </div>

      {/* Usage Instructions */}
      <div style={{ marginTop: '3rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
        <h3>How to Use Column Grouping</h3>
        <h4>Auto-Grouping (Recommended):</h4>
        <ol>
          <li>Set <code>enableColumnGrouping={`{true}`}</code></li>
          <li>Set <code>enableAutoColumnGrouping={`{true}`}</code></li>
          <li>Use a separator in your column names (default: '__')</li>
          <li>Configure <code>groupConfig</code> with your preferences</li>
        </ol>

                 <h4>Naming Conventions for Auto-Grouping:</h4>
         <ul>
           <li><code>prefix__serviceXxx</code> → Groups under "Service"</li>
           <li><code>prefix__supportXxx</code> → Groups under "Support"</li>
           <li><code>prefix__salesXxx</code> → Groups under "Sales"</li>
           <li><code>prefix__marketingXxx</code> → Groups under "Marketing"</li>
           <li><code>prefix__revenueXxx</code> → Groups under "Revenue"</li>
           <li><code>prefix__costXxx</code> → Groups under "Cost"</li>
           <li><code>prefix__budgetXxx</code> → Groups under "Budget"</li>
           <li><code>xxxTotal</code> → Automatically grouped with parent groups (Service, Support, etc.)</li>
         </ul>

         <h4>For Custom Words:</h4>
         <p>Use <code>customGroupMappings</code> for industry-specific terms:</p>
         <pre style={{ backgroundColor: '#f8f9fa', padding: '8px', borderRadius: '4px', fontSize: '0.9em' }}>
{`groupConfig={{
  customGroupMappings: {
    "inventory": "Inventory Management",
    "warehouse": "Warehouse Operations",
    "production": "Production",
    "quality": "Quality Control"
  }
}}`}
         </pre>

         <h4>Configuration Options:</h4>
         <ul>
           <li><code>groupSeparator</code>: Change the separator (default: '__')</li>
           <li><code>ungroupedColumns</code>: Array of column keys that should remain ungrouped</li>
           <li><code>totalColumns</code>: Array of column keys that represent totals</li>
           <li><code>groupingPatterns</code>: Custom regex patterns for advanced grouping</li>
           <li><code>customGroupMappings</code>: Object mapping keywords to group names</li>
         </ul>
      </div>
    </div>
  );
};

export default ColumnGroupingExample; 