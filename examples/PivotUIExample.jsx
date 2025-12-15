import React from 'react';
import PrimeDataTable from '../components/PrimeDataTable';

// Sample data that works well with pivot tables
const sampleData = [
  { drName: 'Dr. Smith', salesTeam: 'Team A', region: 'North', date: '2025-01-01', serviceAmount: 1500, supportValue: 800, visits: 5 },
  { drName: 'Dr. Johnson', salesTeam: 'Team A', region: 'North', date: '2025-01-01', serviceAmount: 2200, supportValue: 1200, visits: 7 },
  { drName: 'Dr. Brown', salesTeam: 'Team B', region: 'South', date: '2025-01-01', serviceAmount: 1800, supportValue: 900, visits: 6 },
  { drName: 'Dr. Wilson', salesTeam: 'Team B', region: 'South', date: '2025-01-01', serviceAmount: 2500, supportValue: 1400, visits: 8 },
  
  { drName: 'Dr. Smith', salesTeam: 'Team A', region: 'North', date: '2025-01-02', serviceAmount: 1600, supportValue: 850, visits: 4 },
  { drName: 'Dr. Johnson', salesTeam: 'Team A', region: 'North', date: '2025-01-02', serviceAmount: 2100, supportValue: 1100, visits: 6 },
  { drName: 'Dr. Brown', salesTeam: 'Team B', region: 'South', date: '2025-01-02', serviceAmount: 1900, supportValue: 950, visits: 7 },
  { drName: 'Dr. Wilson', salesTeam: 'Team B', region: 'South', date: '2025-01-02', serviceAmount: 2400, supportValue: 1300, visits: 5 },
  
  { drName: 'Dr. Davis', salesTeam: 'Team C', region: 'East', date: '2025-01-01', serviceAmount: 2000, supportValue: 1000, visits: 6 },
  { drName: 'Dr. Miller', salesTeam: 'Team C', region: 'East', date: '2025-01-01', serviceAmount: 1700, supportValue: 750, visits: 4 },
  { drName: 'Dr. Davis', salesTeam: 'Team C', region: 'East', date: '2025-01-02', serviceAmount: 2100, supportValue: 1050, visits: 7 },
  { drName: 'Dr. Miller', salesTeam: 'Team C', region: 'East', date: '2025-01-02', serviceAmount: 1650, supportValue: 700, visits: 3 }
];

const PivotUIExample = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Pivot Table UI Configuration Example</h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        This example demonstrates the new pivot table configuration UI. Click the "Pivot" button in the toolbar 
        to open the configuration panel. The dropdowns are automatically populated with fields from your data.
      </p>
      
      <div style={{ marginBottom: '1rem' }}>
        <h3>How to use:</h3>
        <ol style={{ color: '#666' }}>
          <li><strong>Click "Pivot"</strong> button in the toolbar (chart icon)</li>
          <li><strong>Enable Pivot Table</strong> checkbox</li>
          <li><strong>Add Rows:</strong> Select categorical fields to group by (e.g., drName, salesTeam)</li>
          <li><strong>Add Columns:</strong> Select fields to pivot by (e.g., date, region)</li>
          <li><strong>Add Values:</strong> Select numeric fields to aggregate (e.g., serviceAmount, supportValue)</li>
          <li><strong>Choose aggregation:</strong> Sum, Average, Count, etc.</li>
          <li><strong>Apply</strong> to see the pivot table</li>
        </ol>
      </div>

      <PrimeDataTable
        data={sampleData}
        enablePivotTable={false} // Start with regular table
        enablePivotUI={true} // Enable UI configuration
        pivotUIPosition="toolbar" // Show pivot button in toolbar
        
        // Enhanced features
        enableSearch={true}
        enableColumnFilter={true}
        enableFooterTotals={true}
        currencyColumns={['serviceAmount', 'supportValue']}
        
        // Filter configurations
        dropdownFilterColumns={['salesTeam', 'region']}
        datePickerFilterColumns={['date']}
        numberFilterColumns={['serviceAmount', 'supportValue', 'visits']}
        
        footerTotalsConfig={{
          showTotals: true,
          showAverages: true,
          showCounts: true,
          numberFormat: 'en-US',
          currency: 'USD',
          precision: 2
        }}
        
        style={{ minHeight: '500px' }}
      />
      
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h4>Example Pivot Configurations to Try:</h4>
        <ul style={{ color: '#666' }}>
          <li><strong>Sales by Team and Date:</strong> Rows: [salesTeam], Columns: [date], Values: [serviceAmount (sum)]</li>
          <li><strong>Doctor Performance:</strong> Rows: [drName, salesTeam], Values: [serviceAmount (sum), visits (sum)]</li>
          <li><strong>Regional Analysis:</strong> Rows: [region], Columns: [date], Values: [serviceAmount (average), supportValue (average)]</li>
          <li><strong>Team Comparison:</strong> Rows: [salesTeam], Columns: [region], Values: [serviceAmount (sum), visits (count)]</li>
        </ul>
      </div>
    </div>
  );
};

export default PivotUIExample; 