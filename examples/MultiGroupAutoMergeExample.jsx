import React from 'react';
import PrimeDataTable from '../components/PrimeDataTable';

const MultiGroupAutoMergeExample = () => {
  // Example data structure with multiple groups
  const sampleData = {
    service: [
      {
        drCode: "00034943",
        drName: "TARUN PRAKESH PARASHAR",
        hq: "Jaipur",
        salesTeam: "Elbrit Rajasthan",
        serviceAmount: 20000,
        serviceId: "250400137",
        serviceMonth: "Apr-2025",
        serviceDate: "2025-04-18",
        date: "2025-04-01"
      },
      {
        drCode: "00034944",
        drName: "JOHN DOE",
        hq: "Mumbai",
        salesTeam: "Elbrit Maharashtra",
        serviceAmount: 15000,
        serviceId: "250400138",
        serviceMonth: "Apr-2025",
        serviceDate: "2025-04-19",
        date: "2025-04-01"
      }
    ],
    support: [
      {
        drCode: "00059156",
        drName: null,
        salesTeam: "Elbrit Delhi",
        supportValue: 3314,
        date: "2025-03-01"
      },
      {
        drCode: "00059157",
        drName: "JANE SMITH",
        salesTeam: "Elbrit Delhi",
        supportValue: 4500,
        date: "2025-03-01"
      }
    ],
    inventory: [
      {
        drCode: "00034943",
        drName: "TARUN PRAKESH PARASHAR",
        hq: "Jaipur",
        salesTeam: "Elbrit Rajasthan",
        inventoryValue: 50000,
        inventoryItems: 150,
        date: "2025-04-01"
      },
      {
        drCode: "00034944",
        drName: "JOHN DOE",
        hq: "Mumbai",
        salesTeam: "Elbrit Maharashtra",
        inventoryValue: 35000,
        inventoryItems: 120,
        date: "2025-04-01"
      }
    ],
    finance: [
      {
        drCode: "00034943",
        drName: "TARUN PRAKESH PARASHAR",
        hq: "Jaipur",
        salesTeam: "Elbrit Rajasthan",
        revenue: 75000,
        expenses: 25000,
        profit: 50000,
        date: "2025-04-01"
      },
      {
        drCode: "00034944",
        drName: "JOHN DOE",
        hq: "Mumbai",
        salesTeam: "Elbrit Maharashtra",
        revenue: 60000,
        expenses: 20000,
        profit: 40000,
        date: "2025-04-01"
      }
    ],
    marketing: [
      {
        drCode: "00034943",
        drName: "TARUN PRAKESH PARASHAR",
        hq: "Jaipur",
        salesTeam: "Elbrit Rajasthan",
        marketingBudget: 10000,
        campaigns: 5,
        leads: 25,
        date: "2025-04-01"
      },
      {
        drCode: "00034944",
        drName: "JOHN DOE",
        hq: "Mumbai",
        salesTeam: "Elbrit Maharashtra",
        marketingBudget: 8000,
        campaigns: 3,
        leads: 18,
        date: "2025-04-01"
      }
    ]
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Multi-Group Auto-Merge Example</h2>
      <p>This example shows how the PrimeDataTable automatically merges data from multiple groups (service, support, inventory, finance, marketing) and groups columns accordingly.</p>
      
      <PrimeDataTable
        data={sampleData}
        enableAutoMerge={true}
        enableColumnGrouping={true}
        enableAutoColumnGrouping={true}
        mergeConfig={{
          by: ["drCode", "date"], // Merge by doctor code and date
          preserve: ["drName", "salesTeam", "hq"], // Preserve these fields across merges
          autoDetectMergeFields: true
        }}
        groupConfig={{
          customGroupMappings: {
            service: "Service Revenue",
            support: "Support Revenue",
            inventory: "Inventory Management",
            finance: "Financial Data",
            marketing: "Marketing Activities"
          },
          ungroupedColumns: ["drCode", "drName", "salesTeam", "hq", "date"]
        }}
        enableSearch={true}
        enableColumnFilter={true}
        enableSorting={true}
        enablePagination={true}
        enableExport={true}
        currencyColumns={["serviceAmount", "supportValue", "inventoryValue", "revenue", "expenses", "profit", "marketingBudget"]}
        dropdownFilterColumns={["salesTeam", "hq"]}
        numberFilterColumns={["serviceAmount", "supportValue", "inventoryValue", "revenue", "expenses", "profit", "marketingBudget", "inventoryItems", "campaigns", "leads"]}
        datePickerFilterColumns={["date", "serviceDate"]}
      />
    </div>
  );
};

export default MultiGroupAutoMergeExample; 