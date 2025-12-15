import React from 'react';
import PrimeDataTable from '../components/PrimeDataTable';

const AutoMergeExample = () => {
  // Example data structure like $queries.serviceVsSupport.data.response.data
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
    ]
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Auto-Merge Example with Column Grouping</h2>
      <p>This example shows how the PrimeDataTable automatically merges data from an object with arrays and groups columns accordingly.</p>
      
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
            service: "Service",
            support: "Support"
          },
          ungroupedColumns: ["drCode", "drName", "salesTeam", "hq", "date"]
        }}
        enableSearch={true}
        enableColumnFilter={true}
        enableSorting={true}
        enablePagination={true}
        enableExport={true}
        currencyColumns={["serviceAmount", "supportValue"]}
        dropdownFilterColumns={["salesTeam", "hq"]}
        numberFilterColumns={["serviceAmount", "supportValue"]}
        datePickerFilterColumns={["date", "serviceDate"]}
      />
    </div>
  );
};

export default AutoMergeExample; 