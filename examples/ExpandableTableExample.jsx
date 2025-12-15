import React, { useState } from 'react';
import PrimeDataTable from '../components/PrimeDataTable';

const ExpandableTableExample = () => {
  // Sample data with nested information
  const sampleData = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      department: 'Engineering',
      salary: 75000,
      details: {
        startDate: '2020-01-15',
        projects: ['Project Alpha', 'Project Beta'],
        skills: ['React', 'Node.js', 'Python'],
        manager: 'Jane Smith'
      }
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      department: 'Engineering',
      salary: 85000,
      details: {
        startDate: '2019-03-20',
        projects: ['Project Gamma', 'Project Delta'],
        skills: ['Vue.js', 'Java', 'AWS'],
        manager: 'Bob Johnson'
      }
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      department: 'Management',
      salary: 95000,
      details: {
        startDate: '2018-07-10',
        projects: ['Project Epsilon'],
        skills: ['Leadership', 'Strategy', 'Budgeting'],
        manager: 'CEO'
      }
    },
    {
      id: 4,
      name: 'Alice Brown',
      email: 'alice.brown@example.com',
      department: 'Design',
      salary: 70000,
      details: {
        startDate: '2021-02-28',
        projects: ['UI/UX Redesign', 'Brand Update'],
        skills: ['Figma', 'Sketch', 'Adobe Creative Suite'],
        manager: 'Jane Smith'
      }
    }
  ];

  // State for expanded rows
  const [expandedRows, setExpandedRows] = useState({});

  // Custom expansion template
  const customExpansionTemplate = (data) => (
    <div className="p-4 bg-gray-50 border-t border-gray-200">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h5 className="font-semibold text-lg mb-3 text-blue-600">
            Employee Details for {data.name}
          </h5>
          <div className="space-y-2">
            <p><strong>Start Date:</strong> {data.details.startDate}</p>
            <p><strong>Manager:</strong> {data.details.manager}</p>
            <p><strong>Department:</strong> {data.department}</p>
          </div>
        </div>
        <div>
          <h6 className="font-semibold mb-2 text-green-600">Skills</h6>
          <div className="flex flex-wrap gap-1">
            {data.details.skills.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
          
          <h6 className="font-semibold mb-2 text-purple-600 mt-3">Projects</h6>
          <div className="flex flex-wrap gap-1">
            {data.details.projects.map((project, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
              >
                {project}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          <strong>Contact:</strong> {data.email}
        </p>
      </div>
    </div>
  );

  // Handle row toggle
  const handleRowToggle = (e) => {
    setExpandedRows(e.data);
    console.log('Row expanded/collapsed:', e.data);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        PrimeDataTable - Expandable Table Example
      </h1>
      
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">
          Features Demonstrated:
        </h2>
        <ul className="text-blue-700 space-y-1">
          <li>• Row expansion with custom template</li>
          <li>• Expandable content with employee details</li>
          <li>• Skills and projects display</li>
          <li>• Responsive grid layout in expanded content</li>
          <li>• State management for expanded rows</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <PrimeDataTable
          data={sampleData}
          enableRowExpansion={true}
          rowExpansionTemplate={customExpansionTemplate}
          expandedRows={expandedRows}
          onRowToggle={handleRowToggle}
          
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
          dropdownFilterColumns={["department"]}
          numberFilterColumns={["salary"]}
          
          // Export
          enableExport={true}
          exportFilename="employee-data"
          
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
            <strong>1. Enable Row Expansion:</strong> Set <code>enableRowExpansion={true}</code>
          </p>
          <p>
            <strong>2. Custom Template:</strong> Provide <code>rowExpansionTemplate</code> function
          </p>
          <p>
            <strong>3. State Management:</strong> Use <code>expandedRows</code> and <code>onRowToggle</code> props
          </p>
          <p>
            <strong>4. Click the expand icon (▶️)</strong> in the first column to expand rows
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Code Example:
        </h3>
        <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`<PrimeDataTable
  data={employeeData}
  enableRowExpansion={true}
  rowExpansionTemplate={(data) => (
    <div className="p-4">
      <h5>Details for {data.name}</h5>
      <p>Skills: {data.skills.join(', ')}</p>
      <p>Projects: {data.projects.join(', ')}</p>
    </div>
  )}
  expandedRows={expandedRows}
  onRowToggle={(e) => setExpandedRows(e.data)}
/>`}
        </pre>
      </div>
    </div>
  );
};

export default ExpandableTableExample;
