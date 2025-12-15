import React, { useState } from 'react';
import SimpleDataTable from './SimpleDataTable';

/**
 * Example component demonstrating SimpleDataTable usage
 * 
 * Shows:
 * 1. Basic table with auto-generated columns
 * 2. Table with custom columns
 * 3. Table with custom filters (toggle)
 * 4. Table with custom toolbar (toggle)
 * 5. Table with row expansion
 * 6. Complete example with all features
 */

const SimpleDataTableExample = () => {
  // Sample data with nested items for row expansion
  const [userData] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      age: 30,
      department: 'Engineering',
      city: 'New York',
      salary: 85000,
      status: 'Active',
      joinDate: '2023-01-15',
      projects: [
        { projectId: 'PRJ-001', name: 'Website Redesign', hours: 120, status: 'Completed' },
        { projectId: 'PRJ-002', name: 'Mobile App', hours: 80, status: 'In Progress' }
      ]
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      age: 25,
      department: 'Marketing',
      city: 'London',
      salary: 72000,
      status: 'Active',
      joinDate: '2023-03-20',
      projects: [
        { projectId: 'PRJ-003', name: 'Social Media Campaign', hours: 60, status: 'Completed' },
        { projectId: 'PRJ-004', name: 'Brand Strategy', hours: 45, status: 'In Progress' }
      ]
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      age: 35,
      department: 'Engineering',
      city: 'San Francisco',
      salary: 95000,
      status: 'Active',
      joinDate: '2022-11-10',
      projects: [
        { projectId: 'PRJ-005', name: 'API Development', hours: 200, status: 'Completed' }
      ]
    },
    {
      id: 4,
      name: 'Alice Williams',
      email: 'alice.williams@example.com',
      age: 28,
      department: 'Design',
      city: 'Berlin',
      salary: 78000,
      status: 'Active',
      joinDate: '2023-05-01',
      projects: [
        { projectId: 'PRJ-006', name: 'UI Kit', hours: 90, status: 'In Progress' },
        { projectId: 'PRJ-007', name: 'Design System', hours: 150, status: 'Completed' }
      ]
    },
    {
      id: 5,
      name: 'Charlie Brown',
      email: 'charlie.brown@example.com',
      age: 42,
      department: 'Sales',
      city: 'Tokyo',
      salary: 88000,
      status: 'Inactive',
      joinDate: '2021-08-15',
      projects: []
    },
    {
      id: 6,
      name: 'Diana Prince',
      email: 'diana.prince@example.com',
      age: 31,
      department: 'Marketing',
      city: 'Paris',
      salary: 82000,
      status: 'Active',
      joinDate: '2023-02-10',
      projects: [
        { projectId: 'PRJ-008', name: 'Product Launch', hours: 110, status: 'In Progress' }
      ]
    },
    {
      id: 7,
      name: 'Ethan Hunt',
      email: 'ethan.hunt@example.com',
      age: 38,
      department: 'Engineering',
      city: 'Singapore',
      salary: 98000,
      status: 'Active',
      joinDate: '2022-06-20',
      projects: [
        { projectId: 'PRJ-009', name: 'Security Audit', hours: 75, status: 'Completed' },
        { projectId: 'PRJ-010', name: 'Performance Optimization', hours: 95, status: 'In Progress' }
      ]
    }
  ]);

  // State for toggle switches
  const [useCustomFilters, setUseCustomFilters] = useState(false);
  const [useCustomToolbar, setUseCustomToolbar] = useState(false);

  // Custom column definitions
  const columns = [
    { 
      key: 'name', 
      title: 'Full Name', 
      sortable: true, 
      filterable: true,
      type: 'text'
    },
    { 
      key: 'email', 
      title: 'Email Address', 
      sortable: true, 
      filterable: true,
      type: 'text'
    },
    { 
      key: 'age', 
      title: 'Age', 
      sortable: true, 
      filterable: true,
      type: 'number'
    },
    { 
      key: 'department', 
      title: 'Department', 
      sortable: true, 
      filterable: true,
      type: 'dropdown'
    },
    { 
      key: 'city', 
      title: 'City', 
      sortable: true, 
      filterable: true,
      type: 'dropdown'
    },
    { 
      key: 'salary', 
      title: 'Salary', 
      sortable: true, 
      filterable: true,
      type: 'number'
    },
    { 
      key: 'status', 
      title: 'Status', 
      sortable: true, 
      filterable: true,
      type: 'dropdown'
    },
    { 
      key: 'joinDate', 
      title: 'Join Date', 
      sortable: true, 
      filterable: true,
      type: 'date'
    }
  ];

  // Custom row expansion template
  const customExpansionTemplate = (rowData) => {
    const projects = rowData.projects || [];
    
    if (projects.length === 0) {
      return (
        <div style={{ 
          padding: '1.5rem', 
          backgroundColor: '#f9fafb',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <i className="pi pi-inbox" style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
          <p>No projects assigned to this employee</p>
        </div>
      );
    }

    return (
      <div style={{ 
        padding: '1.5rem', 
        backgroundColor: '#f9fafb',
        borderTop: '2px solid #e5e7eb'
      }}>
        <h4 style={{ 
          marginBottom: '1rem',
          color: '#374151',
          fontSize: '1.125rem',
          fontWeight: '600'
        }}>
          Projects ({projects.length})
        </h4>
        
        <div style={{ 
          display: 'grid', 
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))'
        }}>
          {projects.map((project, index) => (
            <div 
              key={index}
              style={{
                backgroundColor: '#ffffff',
                padding: '1rem',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{ 
                fontWeight: '600', 
                color: '#111827',
                marginBottom: '0.5rem',
                fontSize: '0.9375rem'
              }}>
                {project.name}
              </div>
              
              <div style={{ 
                fontSize: '0.8125rem',
                color: '#6b7280',
                marginBottom: '0.25rem'
              }}>
                <strong>ID:</strong> {project.projectId}
              </div>
              
              <div style={{ 
                fontSize: '0.8125rem',
                color: '#6b7280',
                marginBottom: '0.25rem'
              }}>
                <strong>Hours:</strong> {project.hours}h
              </div>
              
              <div style={{ 
                fontSize: '0.8125rem',
                marginTop: '0.5rem'
              }}>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  backgroundColor: project.status === 'Completed' ? '#d1fae5' : '#dbeafe',
                  color: project.status === 'Completed' ? '#065f46' : '#1e40af'
                }}>
                  {project.status}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ 
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: '#eff6ff',
          borderRadius: '0.375rem',
          border: '1px solid #bfdbfe'
        }}>
          <strong style={{ color: '#1e40af' }}>Total Hours:</strong>
          <span style={{ marginLeft: '0.5rem', color: '#1e3a8a' }}>
            {projects.reduce((sum, p) => sum + p.hours, 0)} hours
          </span>
        </div>
      </div>
    );
  };

  // Event handlers
  const handleRefresh = () => {
    console.log('Refreshing data...');
    alert('Data refreshed! (In real app, fetch from API here)');
  };

  const handleRowClick = (rowData, index) => {
    console.log('Row clicked:', rowData, 'at index:', index);
  };

  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '90rem',
      margin: '0 auto',
      backgroundColor: '#f3f4f6',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '2rem',
        backgroundColor: '#ffffff',
        padding: '2rem',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          margin: '0 0 0.5rem 0',
          color: '#111827',
          fontSize: '2rem',
          fontWeight: '700'
        }}>
          Employee Management System
        </h1>
        <p style={{ 
          margin: 0,
          color: '#6b7280',
          fontSize: '1rem'
        }}>
          Manage employee data with advanced filtering, sorting, and expansion features
        </p>
      </div>

      {/* Toggle Controls */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        marginBottom: '2rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ 
          margin: '0 0 1rem 0',
          color: '#374151',
          fontSize: '1.25rem',
          fontWeight: '600'
        }}>
          UI Options
        </h3>
        
        <div style={{ 
          display: 'flex', 
          gap: '2rem',
          flexWrap: 'wrap'
        }}>
          {/* Custom Filters Toggle */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <input
              type="checkbox"
              id="customFilters"
              checked={useCustomFilters}
              onChange={(e) => setUseCustomFilters(e.target.checked)}
              style={{ 
                width: '1.25rem',
                height: '1.25rem',
                cursor: 'pointer'
              }}
            />
            <label 
              htmlFor="customFilters"
              style={{ 
                cursor: 'pointer',
                fontSize: '0.9375rem',
                fontWeight: '500',
                color: '#374151'
              }}
            >
              Use Custom Filters
              <span style={{ 
                display: 'block',
                fontSize: '0.75rem',
                color: '#6b7280',
                fontWeight: '400',
                marginTop: '0.125rem'
              }}>
                {useCustomFilters ? 'Showing dedicated filter row' : 'Using native PrimeReact filters'}
              </span>
            </label>
          </div>

          {/* Custom Toolbar Toggle */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <input
              type="checkbox"
              id="customToolbar"
              checked={useCustomToolbar}
              onChange={(e) => setUseCustomToolbar(e.target.checked)}
              style={{ 
                width: '1.25rem',
                height: '1.25rem',
                cursor: 'pointer'
              }}
            />
            <label 
              htmlFor="customToolbar"
              style={{ 
                cursor: 'pointer',
                fontSize: '0.9375rem',
                fontWeight: '500',
                color: '#374151'
              }}
            >
              Use Custom Toolbar
              <span style={{ 
                display: 'block',
                fontSize: '0.75rem',
                color: '#6b7280',
                fontWeight: '400',
                marginTop: '0.125rem'
              }}>
                {useCustomToolbar ? 'Showing custom styled toolbar' : 'Using native PrimeReact toolbar'}
              </span>
            </label>
          </div>
        </div>

        {/* Info Box */}
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#eff6ff',
          borderRadius: '0.5rem',
          border: '1px solid #bfdbfe'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <i className="pi pi-info-circle" style={{ color: '#2563eb' }} />
            <strong style={{ color: '#1e40af', fontSize: '0.9375rem' }}>
              Features Enabled:
            </strong>
          </div>
          <ul style={{ 
            margin: 0,
            paddingLeft: '1.5rem',
            color: '#1e40af',
            fontSize: '0.875rem'
          }}>
            <li>Global search across all columns</li>
            <li>Column-wise sorting</li>
            <li>Row expansion with project details</li>
            <li>Pagination with customizable page sizes</li>
            <li>Single toggle button for expand/collapse all</li>
            <li>Responsive design with em/rem units</li>
          </ul>
        </div>
      </div>

      {/* SimpleDataTable */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <SimpleDataTable 
          // Data
          data={userData}
          columns={columns}
          dataKey="id"
          
          // Features
          enableSearch={true}
          enableSorting={true}
          enablePagination={true}
          enableRowExpansion={true}
          
          // Toggle custom UI components
          useCustomFilters={useCustomFilters}
          useCustomToolbar={useCustomToolbar}
          
          // Configuration
          pageSize={5}
          pageSizeOptions={[5, 10, 25]}
          tableSize="normal"
          
          // Row expansion
          nestedDataKey="projects"
          rowExpansionTemplate={customExpansionTemplate}
          
          // Callbacks
          onRefresh={handleRefresh}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Footer Info */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ 
          margin: '0 0 1rem 0',
          color: '#374151',
          fontSize: '1.125rem',
          fontWeight: '600'
        }}>
          Try These Features:
        </h3>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ 
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <strong style={{ color: '#374151' }}>🔍 Search:</strong>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
              Type in the search box to filter across all columns
            </p>
          </div>
          
          <div style={{ 
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <strong style={{ color: '#374151' }}>📊 Sort:</strong>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
              Click column headers to sort data
            </p>
          </div>
          
          <div style={{ 
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <strong style={{ color: '#374151' }}>🔽 Expand:</strong>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
              Click the arrow icon or "Expand All" button to see project details
            </p>
          </div>
          
          <div style={{ 
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <strong style={{ color: '#374151' }}>🎛️ Filter:</strong>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
              Toggle custom filters to see dedicated filter inputs for each column
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDataTableExample;

