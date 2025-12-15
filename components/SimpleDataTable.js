import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import * as XLSX from 'xlsx';

// Dynamic imports for PrimeReact components
const DataTable = dynamic(() => import('primereact/datatable').then(m => m.DataTable), { ssr: false });
const Column = dynamic(() => import('primereact/column').then(m => m.Column), { ssr: false });
const InputText = dynamic(() => import('primereact/inputtext').then(m => m.InputText), { ssr: false });
const Button = dynamic(() => import('primereact/button').then(m => m.Button), { ssr: false });
const Toolbar = dynamic(() => import('primereact/toolbar').then(m => m.Toolbar), { ssr: false });
const Dropdown = dynamic(() => import('primereact/dropdown').then(m => m.Dropdown), { ssr: false });
const Calendar = dynamic(() => import('primereact/calendar').then(m => m.Calendar), { ssr: false });
const InputNumber = dynamic(() => import('primereact/inputnumber').then(m => m.InputNumber), { ssr: false });
const Paginator = dynamic(() => import('primereact/paginator').then(m => m.Paginator), { ssr: false });

import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Search, X, ChevronDown, ChevronRight, Plus, Minus, SlidersHorizontal, Download, RotateCw } from "lucide-react";

/**
 * SimpleDataTable - A simplified, clean version of PrimeDataTable
 * 
 * Features:
 * - Basic table with sorting and filtering
 * - Row expansion with auto-detection
 * - Custom column-wise filters (toggle with native filters)
 * - Custom toolbar (toggle with native toolbar)
 * - Single expand/collapse all button
 * - Responsive sizing with em/rem units
 * 
 * Props:
 * @param {Array} data - Table data
 * @param {Array} columns - Column definitions
 * @param {boolean} enableSearch - Enable global search
 * @param {boolean} enableSorting - Enable column sorting
 * @param {boolean} enablePagination - Enable pagination
 * @param {boolean} enableRowExpansion - Enable row expansion
 * @param {boolean} useCustomFilters - Use custom filters instead of native
 * @param {boolean} useCustomToolbar - Use custom toolbar instead of native
 * @param {number} pageSize - Rows per page
 * @param {string} dataKey - Unique identifier for rows
 * @param {function} onRowClick - Callback when parent row is clicked (rowData, index)
 * @param {function} onChildRowClick - Callback when child/nested row is clicked (parentRowDataWithClickedChild, childIndex, childRowData)
 *                                     Note: parentRowData includes nested array with ONLY the clicked child
 */

const SimpleDataTable = ({
  // Data props
  data = [],
  columns = [],
  loading = false,
  
  // Feature toggles
  enableSearch = true,
  enableGlobalSearch = true, // Enable/disable global search bar in toolbar
  enableSorting = true,
  enablePagination = true,
  enableRowExpansion = false,
  useCustomFilters = false,
  useCustomToolbar = false,
  searchOnlyFilters = false, // Force all filters to be text search input
  equalColumnWidths = true, // Give all columns equal width to avoid congestion
  
  // Configuration
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  dataKey = 'id',
  
  // Expansion
  rowExpansionTemplate = null,
  nestedDataKey = 'items',
  
  // Styling
  tableSize = "normal", // small, normal, large
  compactTextInSmall = false, // Enable compact text (12px cells, 14px headers) only when tableSize is "small"
  responsiveLayout = "scroll",
  stickyFirstColumn = false, // Make first column sticky/frozen during horizontal scroll
  className = "",
  style = {},
  
  // Footer Totals (Power BI style)
  enableFooterTotals = false, // Enable column-wise totals in footer
  footerTotalsType = "sum", // Type of calculation: "sum", "average", "count", "min", "max"
  
  // Callbacks
  onRowClick,
  onChildRowClick, // Row click handler for nested/expansion tables: (parentDataWithClickedChild, childIndex, childRowData)
  onRefresh,
}) => {
  // State management
  const [tableData, setTableData] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [columnFilters, setColumnFilters] = useState({}); // For search-only filters
  const [filters, setFilters] = useState({});
  const [customFilters, setCustomFilters] = useState({});
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState(pageSize);
  const [expandedRows, setExpandedRows] = useState({});
  const [allExpanded, setAllExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  const isMountedRef = useRef(true);
  
  // Determine if compact text mode should be active (only when tableSize is "small" and prop is enabled)
  const isCompactText = tableSize === "small" && compactTextInSmall;

  // Detect screen size for responsive toolbar
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Initialize data
  useEffect(() => {
    if (Array.isArray(data)) {
      setTableData(data);
    }
  }, [data]);

  // Auto-detect dataKey from data
  const resolvedDataKey = useMemo(() => {
    if (dataKey) return dataKey;
    
    if (tableData.length > 0) {
      const firstRow = tableData[0];
      const possibleKeys = ['id', 'Id', 'ID', '_id', 'code', 'key', 'uid'];
      
      for (const key of possibleKeys) {
        if (firstRow.hasOwnProperty(key)) return key;
      }
      
      return Object.keys(firstRow)[0] || 'id';
    }
    
    return 'id';
  }, [dataKey, tableData]);

  // Ensure all rows have the dataKey
  useEffect(() => {
    if (!Array.isArray(tableData)) return;
    
    tableData.forEach((row, i) => {
      if (row && row[resolvedDataKey] === undefined) {
        row[resolvedDataKey] = `_row_${i}`;
      }
    });
  }, [tableData, resolvedDataKey]);

  // Generate columns from data if not provided
  const generatedColumns = useMemo(() => {
    if (columns && columns.length > 0) {
      return columns.map(col => ({
        key: col.key || col.field || col.header,
        title: col.title || col.header || col.key,
        sortable: col.sortable !== false,
        filterable: col.filterable !== false,
        type: col.type || 'text',
        ...col
      }));
    }
    
    if (tableData.length === 0) return [];
    
    const firstRow = tableData[0];
    return Object.keys(firstRow).map(key => {
      const value = firstRow[key];
      let type = 'text';
      
      if (typeof value === 'number') type = 'number';
      else if (typeof value === 'boolean') type = 'boolean';
      else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) type = 'date';
      else if (Array.isArray(value)) type = 'array';
      
      return {
        key,
        title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        sortable: true,
        filterable: type !== 'array',
        type
      };
    });
  }, [columns, tableData]);

  // Filter out array columns from display
  const displayColumns = useMemo(() => {
    return generatedColumns.filter(col => col.type !== 'array');
  }, [generatedColumns]);

  // Initialize filters for each column
  useEffect(() => {
    if (!useCustomFilters && !searchOnlyFilters && displayColumns.length > 0) {
      const initialFilters = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
      };
      
      displayColumns.forEach(col => {
        if (col.filterable) {
          initialFilters[col.key] = { value: null, matchMode: FilterMatchMode.CONTAINS };
        }
      });
      
      setFilters(initialFilters);
    }
  }, [displayColumns, useCustomFilters, searchOnlyFilters]);

  // Detect column types for custom filters
  const getColumnType = useCallback((column) => {
    if (column.type) return column.type;
    
    if (tableData.length === 0) return 'text';
    
    const sampleValues = tableData
      .slice(0, 10)
      .map(row => row[column.key])
      .filter(val => val !== null && val !== undefined);
    
    if (sampleValues.length === 0) return 'text';
    
    const uniqueValues = [...new Set(sampleValues)];
    
    if (uniqueValues.length <= 10 && uniqueValues.length > 1) {
      return 'dropdown';
    }
    
    const firstValue = sampleValues[0];
    if (typeof firstValue === 'number') return 'number';
    if (typeof firstValue === 'boolean') return 'boolean';
    if (typeof firstValue === 'string' && /^\d{4}-\d{2}-\d{2}/.test(firstValue)) return 'date';
    
    return 'text';
  }, [tableData]);

  // Get unique values for dropdown filters
  const getUniqueValues = useCallback((columnKey) => {
    const values = tableData
      .map(row => row[columnKey])
      .filter(val => val !== null && val !== undefined);
    return [...new Set(values)];
  }, [tableData]);

  // Apply custom filters
  const filteredData = useMemo(() => {
    if (!useCustomFilters) return tableData;
    
    let filtered = [...tableData];
    
    // Apply global filter
    if (globalFilterValue) {
      const searchLower = globalFilterValue.toLowerCase();
      filtered = filtered.filter(row => {
        return displayColumns.some(col => {
          const value = row[col.key];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchLower);
        });
      });
    }
    
    // Apply column filters
    Object.keys(customFilters).forEach(key => {
      const filterValue = customFilters[key];
      if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
        filtered = filtered.filter(row => {
          const rowValue = row[key];
          if (rowValue === null || rowValue === undefined) return false;
          
          const column = displayColumns.find(col => col.key === key);
          const columnType = getColumnType(column);
          
          if (columnType === 'dropdown') {
            return String(rowValue) === String(filterValue);
          } else if (columnType === 'number') {
            return Number(rowValue) === Number(filterValue);
          } else if (columnType === 'date') {
            const rowDate = new Date(rowValue).toDateString();
            const filterDate = new Date(filterValue).toDateString();
            return rowDate === filterDate;
          } else {
            return String(rowValue).toLowerCase().includes(String(filterValue).toLowerCase());
          }
        });
      }
    });
    
    return filtered;
  }, [tableData, customFilters, globalFilterValue, displayColumns, useCustomFilters, getColumnType]);

  // Apply column filters for searchOnlyFilters mode
  const columnFilteredData = useMemo(() => {
    if (!searchOnlyFilters || useCustomFilters || Object.keys(columnFilters).length === 0) {
      return tableData;
    }
    
    return tableData.filter(row => {
      // Check each column filter
      return Object.entries(columnFilters).every(([columnKey, filterValue]) => {
        if (!filterValue || filterValue.trim() === '') return true;
        
        const cellValue = row[columnKey];
        const cellString = String(cellValue || '').toLowerCase();
        const filterString = String(filterValue).toLowerCase();
        
        return cellString.includes(filterString);
      });
    });
  }, [tableData, columnFilters, searchOnlyFilters, useCustomFilters]);

  // Data to display (filtered or original)
  const displayData = useCustomFilters ? filteredData : (searchOnlyFilters ? columnFilteredData : tableData);

  // Handle global search
  const handleGlobalSearch = useCallback((e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    
    if (!useCustomFilters) {
      const newFilters = { ...filters };
      newFilters['global'].value = value;
      setFilters(newFilters);
    }
  }, [filters, useCustomFilters]);

  // Handle custom filter change
  const handleCustomFilterChange = useCallback((columnKey, value) => {
    setCustomFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setGlobalFilterValue('');
    setCustomFilters({});
    setColumnFilters({});
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
  }, []);

  // Export data with format selection - opens modal
  const exportToExcel = useCallback(() => {
    if (!displayData || displayData.length === 0) {
      alert('No data to export');
      return;
    }
    
    // Show export format selection modal
    setShowExportModal(true);
  }, [displayData]);

  // Handle export format selection
  const handleExportFormat = useCallback((format) => {
    setShowExportModal(false);
    
    setTimeout(() => {
      if (format === 'excel') {
        exportToExcelXLSX();
      } else if (format === 'csv') {
        exportToCSV();
      }
    }, 100);
  }, [displayData, displayColumns, enableRowExpansion, nestedDataKey]);

  // Export to CSV format
  const exportToCSV = useCallback(() => {
    if (!displayData || displayData.length === 0) {
      alert('No data to export');
      return;
    }

    // Helper function to format cell value
    const formatCellValue = (value) => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    let csvRows = [];
    
    // Check if we have nested data (expansion rows)
    const hasNestedData = enableRowExpansion && displayData.some(row => {
      const nested = row[nestedDataKey] || row.items || row.children || row.HQs;
      return nested && Array.isArray(nested) && nested.length > 0;
    });

    if (hasNestedData) {
      // Export child rows with ALL non-numeric parent data merged
      
      // Get all non-numeric parent columns
      const parentNonNumericColumns = displayColumns.filter(col => {
        // Check if column contains numeric data
        const sampleValue = displayData.length > 0 ? displayData[0][col.key] : null;
        return typeof sampleValue !== 'number';
      });
      
      // Get all nested data columns from first nested row
      let nestedColumns = [];
      let allNestedDataRows = [];
      
      displayData.forEach((row) => {
        const nestedData = row[nestedDataKey] || row.items || row.children || row.HQs;
        
        if (nestedData && Array.isArray(nestedData) && nestedData.length > 0) {
          // Get nested columns from first nested row if not already set
          if (nestedColumns.length === 0) {
            nestedColumns = Object.keys(nestedData[0]);
          }
          
          // Add each nested row with ALL parent non-numeric data
          nestedData.forEach(nestedRow => {
            // Create an object with all non-numeric parent data
            const parentData = {};
            parentNonNumericColumns.forEach(col => {
              parentData[col.key] = row[col.key];
            });
            
            allNestedDataRows.push({
              parentData: parentData,
              nestedData: nestedRow
            });
          });
        }
      });
      
      // Create headers: All Parent Non-Numeric Columns + all nested columns
      const parentHeaders = parentNonNumericColumns.map(col => col.title);
      const nestedHeaders = nestedColumns.map(col => {
        // Format column name
        return col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1');
      });
      const headers = [...parentHeaders, ...nestedHeaders];
      
      // Create rows: All parent non-numeric values + all nested data values
      allNestedDataRows.forEach(({ parentData, nestedData }) => {
        const parentValues = parentNonNumericColumns.map(col => formatCellValue(parentData[col.key]));
        const nestedValues = nestedColumns.map(col => formatCellValue(nestedData[col]));
        const rowCells = [...parentValues, ...nestedValues];
        csvRows.push(rowCells.join(','));
      });
      
      const csvContent = `${headers.join(',')}\n${csvRows.join('\n')}`;

      // Create blob and download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `table_export_expansion_data_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Simple export without nested data
      const headers = displayColumns.map(col => col.title).join(',');
      const rows = displayData.map(row => {
        return displayColumns.map(col => formatCellValue(row[col.key])).join(',');
      }).join('\n');

      const csvContent = `${headers}\n${rows}`;

      // Create blob and download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `table_export_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [displayData, displayColumns, enableRowExpansion, nestedDataKey]);

  // Export to Excel XLSX format using SheetJS
  const exportToExcelXLSX = useCallback(() => {
    if (!displayData || displayData.length === 0) {
      alert('No data to export');
      return;
    }

    // Check if we have nested data (expansion rows)
    const hasNestedData = enableRowExpansion && displayData.some(row => {
      const nested = row[nestedDataKey] || row.items || row.children || row.HQs;
      return nested && Array.isArray(nested) && nested.length > 0;
    });

    let worksheetData = [];

    if (hasNestedData) {
      // Export child rows with ALL non-numeric parent data merged
      
      // Get all non-numeric parent columns
      const parentNonNumericColumns = displayColumns.filter(col => {
        // Check if column contains numeric data
        const sampleValue = displayData.length > 0 ? displayData[0][col.key] : null;
        return typeof sampleValue !== 'number';
      });
      
      // Get all nested data columns from first nested row
      let nestedColumns = [];
      let allNestedDataRows = [];
      
      displayData.forEach((row) => {
        const nestedData = row[nestedDataKey] || row.items || row.children || row.HQs;
        
        if (nestedData && Array.isArray(nestedData) && nestedData.length > 0) {
          // Get nested columns from first nested row if not already set
          if (nestedColumns.length === 0) {
            nestedColumns = Object.keys(nestedData[0]);
          }
          
          // Add each nested row with ALL parent non-numeric data
          nestedData.forEach(nestedRow => {
            // Create an object with all non-numeric parent data
            const parentData = {};
            parentNonNumericColumns.forEach(col => {
              parentData[col.key] = row[col.key];
            });
            
            allNestedDataRows.push({
              parentData: parentData,
              nestedData: nestedRow
            });
          });
        }
      });
      
      // Create headers: All Parent Non-Numeric Columns + all nested columns
      const parentHeaders = parentNonNumericColumns.map(col => col.title);
      const nestedHeaders = nestedColumns.map(col => {
        // Format column name
        return col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1');
      });
      const headers = [...parentHeaders, ...nestedHeaders];
      
      // Add headers as first row
      worksheetData.push(headers);
      
      // Add data rows: All parent non-numeric values + all nested data values
      allNestedDataRows.forEach(({ parentData, nestedData }) => {
        const parentValues = parentNonNumericColumns.map(col => parentData[col.key] ?? '');
        const nestedValues = nestedColumns.map(col => nestedData[col] ?? '');
        const rowCells = [...parentValues, ...nestedValues];
        worksheetData.push(rowCells);
      });
    } else {
      // Simple export without nested data
      const headers = displayColumns.map(col => col.title);
      worksheetData.push(headers);
      
      displayData.forEach(row => {
        const rowData = displayColumns.map(col => row[col.key] ?? '');
        worksheetData.push(rowData);
      });
    }

    // Create worksheet from data
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
    const columnWidths = worksheetData[0].map((_, colIndex) => {
      const maxLength = Math.max(
        ...worksheetData.map(row => {
          const cell = row[colIndex];
          return cell ? String(cell).length : 10;
        })
      );
      return { wch: Math.min(Math.max(maxLength, 10), 50) };
    });
    worksheet['!cols'] = columnWidths;
    
    // Style the header row
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    // Generate XLSX file and trigger download
    XLSX.writeFile(
      workbook, 
      `table_export_${hasNestedData ? 'expansion_data_' : ''}${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  }, [displayData, displayColumns, enableRowExpansion, nestedDataKey]);

  // Handle sort
  const handleSort = useCallback((e) => {
    setSortField(e.sortField);
    setSortOrder(e.sortOrder);
  }, []);

  // Handle page change
  const handlePageChange = useCallback((e) => {
    setCurrentPage(e.page + 1);
    setRows(e.rows);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  // Toggle expand/collapse all
  const toggleExpandAll = useCallback(() => {
    if (allExpanded) {
      // Collapse all
      setExpandedRows({});
      setAllExpanded(false);
    } else {
      // Expand all
      const expanded = {};
      displayData.forEach(row => {
        expanded[row[resolvedDataKey]] = true;
      });
      setExpandedRows(expanded);
      setAllExpanded(true);
    }
  }, [allExpanded, displayData, resolvedDataKey]);

  // Auto-detect nested data for expansion
  const defaultRowExpansionTemplate = useCallback((data) => {
    const nestedData = data[nestedDataKey] || data.items || data.children;
    
    if (!nestedData || !Array.isArray(nestedData) || nestedData.length === 0) {
      return <div style={{ padding: '1rem', color: '#6b7280' }}>No nested data available</div>;
    }
    
    const nestedColumns = Object.keys(nestedData[0]).map(key => {
      // Detect column type for nested data
      const firstValue = nestedData[0][key];
      const isNumeric = typeof firstValue === 'number';
      
      return {
        key,
        title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        isNumeric
      };
    });
    
    return (
      <div style={{ padding: '1rem' }}>
        <h5 style={{ marginBottom: '0.75rem', color: '#374151' }}>
          Details ({nestedData.length} items)
        </h5>
        <DataTable 
          value={nestedData} 
          size="small"
          sortMode="single"
          stripedRows
          showGridlines
          onRowClick={onChildRowClick ? (e) => {
            // Create parent data with only the clicked child in the nested array
            const parentWithClickedChild = {
              ...data,
              [nestedDataKey]: [e.data]
            };
            onChildRowClick(parentWithClickedChild, e.index, e.data);
          } : undefined}
          rowClassName={onChildRowClick ? () => 'clickable-child-row' : undefined}
        >
          {nestedColumns.map(col => (
            <Column 
              key={col.key} 
              field={col.key} 
              header={col.title}
              sortable={true}
              body={(rowData) => {
                const value = rowData[col.key];
                if (value === null || value === undefined) return '';
                
                // Format numbers with commas
                if (typeof value === 'number') {
                  const hasDecimals = value % 1 !== 0;
                  return new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: hasDecimals ? 2 : 0,
                    maximumFractionDigits: hasDecimals ? 2 : 0,
                  }).format(value);
                }
                
                if (typeof value === 'object') return JSON.stringify(value);
                return String(value);
              }}
            />
          ))}
        </DataTable>
      </div>
    );
  }, [nestedDataKey, onChildRowClick]);

  // Number formatter with comma separators
  const formatNumber = useCallback((value) => {
    if (typeof value !== 'number') return value;
    
    // Check if it's a whole number or has decimals
    const hasDecimals = value % 1 !== 0;
    
    // Format with commas and preserve decimals
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
    }).format(value);
  }, []);

  // Calculate column totals
  const calculateColumnTotal = useCallback((columnKey, type = 'sum') => {
    const values = displayData
      .map(row => row[columnKey])
      .filter(val => typeof val === 'number' && !isNaN(val));
    
    if (values.length === 0) return null;
    
    switch (type) {
      case 'sum':
        return values.reduce((acc, val) => acc + val, 0);
      case 'average':
        return values.reduce((acc, val) => acc + val, 0) / values.length;
      case 'count':
        return values.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      default:
        return values.reduce((acc, val) => acc + val, 0);
    }
  }, [displayData]);

  // Safe cell renderer
  const safeCell = useCallback((value) => {
    if (value === null || value === undefined) return '';
    
    // Format numbers with commas
    if (typeof value === 'number') {
      return formatNumber(value);
    }
    
    if (typeof value === 'string' || typeof value === 'boolean') {
      return String(value);
    }
    
    if (Array.isArray(value)) {
      return `${value.length} item(s)`;
    }
    
    if (typeof value === 'object') {
      try {
        const s = JSON.stringify(value);
        return s.length > 50 ? s.slice(0, 47) + '...' : s;
      } catch {
        return '[object]';
      }
    }
    
    return String(value);
  }, [formatNumber]);

  // Footer template for column totals
  const footerTemplate = useCallback((columnKey, isFirstColumn = false) => {
    if (!enableFooterTotals) return null;
    
    // For the first column, show the label
    if (isFirstColumn) {
      const label = footerTotalsType.charAt(0).toUpperCase() + footerTotalsType.slice(1);
      return (
        <div style={{ 
          fontWeight: '700', 
          color: '#1f2937',
          fontSize: isCompactText ? '0.75rem' : '0.875rem'
        }}>
          {label}:
        </div>
      );
    }
    
    // Calculate total for this column
    const total = calculateColumnTotal(columnKey, footerTotalsType);
    
    if (total === null) return '';
    
    return (
      <div style={{ 
        fontWeight: '600', 
        color: '#059669',
        fontSize: isCompactText ? '0.75rem' : '0.875rem'
      }}>
        {formatNumber(total)}
      </div>
    );
  }, [enableFooterTotals, footerTotalsType, calculateColumnTotal, formatNumber, isCompactText]);

  // Render custom filter element
  const renderCustomFilterElement = useCallback((column) => {
    const columnType = getColumnType(column);
    const filterValue = customFilters[column.key] || '';
    
    const commonStyle = {
      width: '100%',
      padding: '0.5rem',
      fontSize: '0.875rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem'
    };
    
    // If searchOnlyFilters is true, always use text input
    if (searchOnlyFilters) {
      return (
        <InputText
          value={filterValue}
          onChange={(e) => handleCustomFilterChange(column.key, e.target.value)}
          placeholder={`Search ${column.title}`}
          style={commonStyle}
        />
      );
    }
    
    if (columnType === 'dropdown') {
      const options = getUniqueValues(column.key).map(val => ({
        label: String(val),
        value: val
      }));
      
      return (
        <Dropdown
          value={filterValue}
          options={[{ label: 'All', value: '' }, ...options]}
          onChange={(e) => handleCustomFilterChange(column.key, e.value)}
          placeholder={`Filter ${column.title}`}
          style={commonStyle}
          showClear
        />
      );
    } else if (columnType === 'number') {
      return (
        <InputNumber
          value={filterValue}
          onValueChange={(e) => handleCustomFilterChange(column.key, e.value)}
          placeholder={`Filter ${column.title}`}
          style={commonStyle}
        />
      );
    } else if (columnType === 'date') {
      return (
        <Calendar
          value={filterValue ? new Date(filterValue) : null}
          onChange={(e) => handleCustomFilterChange(column.key, e.value)}
          placeholder={`Filter ${column.title}`}
          dateFormat="yy-mm-dd"
          showIcon
          style={commonStyle}
        />
      );
    } else {
      return (
        <InputText
          value={filterValue}
          onChange={(e) => handleCustomFilterChange(column.key, e.target.value)}
          placeholder={`Filter ${column.title}`}
          style={commonStyle}
        />
      );
    }
  }, [getColumnType, customFilters, getUniqueValues, handleCustomFilterChange, searchOnlyFilters]);

  // Custom Toolbar
  const customToolbar = useMemo(() => {
    if (!useCustomToolbar) return null;
    
    return (
      <div className="custom-toolbar-wrapper" style={{
        padding: '1rem',
        backgroundColor: '#ffffff',
        borderRadius: '0.5rem',
        marginBottom: '1rem'
      }}>
        {/* Mobile: Search row (full width) */}
        {/* Desktop: Search on left, buttons on right */}
        <div className="custom-toolbar-content" style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: isMobile ? 'flex-start' : 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: '1rem'
        }}>
          {/* Search section */}
          {enableGlobalSearch && enableSearch && (
            <div className="custom-toolbar-search" style={{ 
              position: 'relative',
              width: isMobile ? '100%' : 'auto',
              flex: isMobile ? 'none' : '1 1 auto',
              minWidth: isMobile ? 'auto' : '15rem',
              maxWidth: isMobile ? 'none' : '35rem'
            }}>
              <Search 
                size={18} 
                className="custom-search-icon"
                style={{ 
                  position: 'absolute', 
                  left: '0.75rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#6b7280',
                  zIndex: 1,
                  pointerEvents: 'none'
                }} 
              />
              <InputText
                value={globalFilterValue}
                onChange={handleGlobalSearch}
                placeholder="Search all columns..."
                className="custom-search-input p-inputtext"
                style={{
                  paddingLeft: '2.5rem',
                  width: '100%',
                  fontSize: '0.875rem',
                  padding: '0.5rem 0.5rem 0.5rem 2.5rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #93c5fd',
                  borderRadius: '0.5rem',
                  color: '#374151'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#60a5fa';
                  e.target.style.boxShadow = '0 0 0 3px rgba(96, 165, 250, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#93c5fd';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          )}
          
          {/* Actions section - Mobile: full width row, Desktop: right side */}
          <div className="custom-toolbar-actions" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isMobile ? '0.375rem' : '0.5rem',
            flexWrap: 'nowrap',
            width: isMobile ? '100%' : 'auto',
            flex: isMobile ? 'none' : '0 0 auto',
            justifyContent: isMobile ? 'flex-start' : 'flex-end',
            overflowX: isMobile ? 'auto' : 'visible'
          }}>
            {/* Expand/Collapse All Button */}
            {enableRowExpansion && (
              <button
                type="button"
                onClick={toggleExpandAll}
                className="custom-toolbar-button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: isMobile ? '0.375rem 0.625rem' : '0.375rem 0.75rem',
                  fontSize: isMobile ? '0.75rem' : '0.8125rem',
                  fontWeight: '400',
                  color: '#374151',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                {allExpanded ? (
                  <>
                    <Minus size={isMobile ? 14 : 15} color="#3b82f6" />
                    <span>{isMobile ? 'Collapse' : 'Collapse All'}</span>
                  </>
                ) : (
                  <>
                    <Plus size={isMobile ? 14 : 15} color="#3b82f6" />
                    <span>{isMobile ? 'Expand' : 'Expand All'}</span>
                  </>
                )}
              </button>
            )}
            
            {/* Clear filters button */}
            <button
              type="button"
              onClick={clearAllFilters}
              className="custom-toolbar-button"
              title="Clear all filters"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: isMobile ? '0.375rem 0.625rem' : '0.375rem 0.75rem',
                fontSize: isMobile ? '0.75rem' : '0.8125rem',
                fontWeight: '400',
                color: '#374151',
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <SlidersHorizontal size={isMobile ? 14 : 15} color="#3b82f6" />
              <span>{isMobile ? 'Clear' : 'Clear Filters'}</span>
            </button>
            
            {/* Export button */}
            <button
              type="button"
              onClick={exportToExcel}
              className="custom-toolbar-button"
              title="Export to Excel"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: isMobile ? '0.375rem 0.625rem' : '0.375rem 0.75rem',
                fontSize: isMobile ? '0.75rem' : '0.8125rem',
                fontWeight: '400',
                color: '#374151',
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <Download size={isMobile ? 14 : 15} color="#3b82f6" />
              <span>Export</span>
            </button>
            
            {/* Refresh button */}
            {onRefresh && (
              <button
                type="button"
                onClick={handleRefresh}
                className="custom-toolbar-button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: isMobile ? '0.375rem 0.625rem' : '0.375rem 0.75rem',
                  fontSize: isMobile ? '0.75rem' : '0.8125rem',
                  fontWeight: '400',
                  color: '#374151',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <RotateCw size={isMobile ? 14 : 15} color="#3b82f6" />
                <span>Refresh</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }, [
    useCustomToolbar,
    enableSearch,
    enableGlobalSearch,
    globalFilterValue,
    handleGlobalSearch,
    clearAllFilters,
    enableRowExpansion,
    allExpanded,
    toggleExpandAll,
    exportToExcel,
    onRefresh,
    handleRefresh,
    isMobile
  ]);

  // Native Toolbar
  const nativeToolbarLeft = useMemo(() => {
    return (
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {enableGlobalSearch && enableSearch && (
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={globalFilterValue}
              onChange={handleGlobalSearch}
              placeholder="Search..."
              style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
            />
          </span>
        )}
        
        <Button
          icon="pi pi-filter-slash"
          label="Clear"
          className="p-button-outlined p-button-secondary"
          onClick={clearAllFilters}
          style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
        />
      </div>
    );
  }, [enableGlobalSearch, enableSearch, globalFilterValue, handleGlobalSearch, clearAllFilters]);

  const nativeToolbarRight = useMemo(() => {
    return (
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        {enableRowExpansion && (
          <Button
            icon={allExpanded ? "pi pi-minus" : "pi pi-plus"}
            label={allExpanded ? "Collapse All" : "Expand All"}
            className="p-button-outlined p-button-info"
            onClick={toggleExpandAll}
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          />
        )}
        
        <Button
          icon="pi pi-file-excel"
          label="Export"
          className="p-button-outlined p-button-success"
          onClick={exportToExcel}
          style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          tooltip="Export to Excel"
        />
        
        {onRefresh && (
          <Button
            icon="pi pi-refresh"
            className="p-button-outlined"
            onClick={handleRefresh}
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          />
        )}
      </div>
    );
  }, [enableRowExpansion, allExpanded, toggleExpandAll, exportToExcel, onRefresh, handleRefresh]);

  // Custom Filters Row
  const customFiltersRow = useMemo(() => {
    if (!useCustomFilters) return null;
    
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
        gap: '0.75rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '0.5rem',
        marginBottom: '1rem'
      }}>
        {displayColumns.filter(col => col.filterable).map(column => (
          <div key={column.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ 
              fontSize: '0.75rem', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '0.25rem'
            }}>
              {column.title}
            </label>
            {renderCustomFilterElement(column)}
          </div>
        ))}
      </div>
    );
  }, [useCustomFilters, displayColumns, renderCustomFilterElement]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  if (loading) {
    return (
      <div className={className} style={style}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }} />
          <p style={{ marginTop: '1rem' }}>Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {/* Modern Export Format Selection Modal */}
      {showExportModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowExportModal(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              minWidth: '400px',
              maxWidth: '90vw',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              animation: 'modalSlideIn 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ 
              margin: '0 0 0.5rem 0', 
              fontSize: '1.5rem', 
              fontWeight: '600',
              color: '#1f2937'
            }}>
              Export Data
            </h3>
            <p style={{ 
              margin: '0 0 1.5rem 0', 
              fontSize: '0.875rem', 
              color: '#6b7280'
            }}>
              Choose your preferred export format
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* CSV Option */}
              <button
                onClick={() => handleExportFormat('csv')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  backgroundColor: '#f9fafb',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  textAlign: 'left',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#10b981',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'white',
                  flexShrink: 0
                }}>
                  CSV
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                    CSV File
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Comma-separated values, universal compatibility
                  </div>
                </div>
                <div style={{ color: '#3b82f6', fontSize: '1.5rem' }}>→</div>
              </button>
              
              {/* Excel Option */}
              <button
                onClick={() => handleExportFormat('excel')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  backgroundColor: '#f9fafb',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  textAlign: 'left',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#059669',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: 'white',
                  flexShrink: 0
                }}>
                  XLSX
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                    Excel File (.xlsx)
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Modern Excel format, all versions supported
                  </div>
                </div>
                <div style={{ color: '#3b82f6', fontSize: '1.5rem' }}>→</div>
              </button>
            </div>
            
            {/* Cancel Button */}
            <button
              onClick={() => setShowExportModal(false)}
              style={{
                marginTop: '1rem',
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#6b7280',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        /* Responsive sizing with em/rem units */
        .simple-datatable-wrapper {
          font-size: 1rem;
        }
        
        .simple-datatable-wrapper .p-datatable {
          font-size: 0.875rem;
        }
        
        .simple-datatable-wrapper .p-datatable-thead > tr > th {
          padding: 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
        }
        
        .simple-datatable-wrapper .p-datatable-tbody > tr > td {
          padding: 0.75rem;
          font-size: 0.875rem;
        }
        
        .simple-datatable-wrapper.size-small .p-datatable-thead > tr > th {
          padding: 0.5rem;
          font-size: 0.8125rem;
        }
        
        .simple-datatable-wrapper.size-small .p-datatable-tbody > tr > td {
          padding: 0.5rem;
          font-size: 0.8125rem;
        }
        
        /* Compact text size mode - SM (12px cells, 14px headers) */
        /* Must come AFTER size-small to override when tableSize="small" and compactTextInSmall=true */
        .simple-datatable-wrapper.compact-text .p-datatable-thead > tr > th {
          font-size: 0.85rem !important; /* 14px */
          padding: 0.5rem;
        }
        
        .simple-datatable-wrapper.compact-text .p-datatable-tbody > tr > td {
          font-size: 0.75rem !important; /* 12px */
          padding: 0.5rem;
        }
        
        /* Adjust arrow icon size in compact mode */
        .simple-datatable-wrapper.compact-text .pi-chevron-down,
        .simple-datatable-wrapper.compact-text .pi-chevron-right {
          font-size: 0.65rem !important;
        }
        
        .simple-datatable-wrapper.size-large .p-datatable-thead > tr > th {
          padding: 1rem;
          font-size: 1rem;
        }
        
        .simple-datatable-wrapper.size-large .p-datatable-tbody > tr > td {
          padding: 1rem;
          font-size: 1rem;
        }
        
        /* Responsive breakpoints */
        @media (max-width: 48rem) {
          .simple-datatable-wrapper {
            font-size: 0.875rem;
          }
          
          .simple-datatable-wrapper .p-datatable-thead > tr > th {
            padding: 0.5rem;
            font-size: 0.8125rem;
          }
          
          .simple-datatable-wrapper .p-datatable-tbody > tr > td {
            padding: 0.5rem;
            font-size: 0.8125rem;
          }
        }
        
        @media (max-width: 30rem) {
          .simple-datatable-wrapper {
            font-size: 0.8125rem;
          }
          
          .simple-datatable-wrapper .p-datatable-thead > tr > th {
            padding: 0.375rem;
            font-size: 0.75rem;
          }
          
          .simple-datatable-wrapper .p-datatable-tbody > tr > td {
            padding: 0.375rem;
            font-size: 0.75rem;
          }
        }
        
        /* Expansion row styling */
        .simple-datatable-wrapper .p-datatable-tbody > tr.p-datatable-row-expansion > td {
          background-color: #f9fafb;
          border-top: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
        }
        
        /* Hover effect */
        .simple-datatable-wrapper .p-datatable-tbody > tr:hover {
          background-color: #f3f4f6;
        }
        
        /* Footer totals styling */
        .simple-datatable-wrapper .p-datatable-tfoot > tr > td {
          background-color: #f9fafb;
          border-top: 2px solid #d1d5db;
          font-weight: 600;
          padding: 0.75rem;
        }
        
        .simple-datatable-wrapper.compact-text .p-datatable-tfoot > tr > td {
          padding: 0.5rem;
          font-size: 0.75rem;
        }
        
        /* Nested/Expansion table styling */
        .simple-datatable-wrapper .p-datatable-row-expansion .p-datatable {
          background-color: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
        }
        
        .simple-datatable-wrapper .p-datatable-row-expansion .p-datatable-thead > tr > th {
          background-color: #f9fafb;
          font-size: 0.8125rem;
          font-weight: 600;
          padding: 0.5rem;
        }
        
        .simple-datatable-wrapper .p-datatable-row-expansion .p-datatable-tbody > tr > td {
          font-size: 0.8125rem;
          padding: 0.5rem;
        }
        
        /* Clickable child rows styling */
        .simple-datatable-wrapper .p-datatable-row-expansion .clickable-child-row {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .simple-datatable-wrapper .p-datatable-row-expansion .clickable-child-row:hover {
          background-color: #eff6ff !important;
        }
        
        .simple-datatable-wrapper .p-datatable-row-expansion .clickable-child-row:active {
          background-color: #dbeafe !important;
        }
        
        /* Sorting arrows in nested table */
        .simple-datatable-wrapper .p-datatable-row-expansion .p-sortable-column-icon {
          font-size: 0.75rem;
          margin-left: 0.25rem;
        }
        
        /* Sticky/Frozen first column using PrimeReact's frozen column feature */
        .simple-datatable-wrapper.sticky-first-column .p-datatable-scrollable-header,
        .simple-datatable-wrapper.sticky-first-column .p-datatable-scrollable-body,
        .simple-datatable-wrapper.sticky-first-column .p-datatable-scrollable-footer {
          overflow-x: auto !important;
        }
        
        /* Frozen column styling */
        .simple-datatable-wrapper.sticky-first-column .p-frozen-column {
          background-color: #ffffff !important;
          box-shadow: 2px 0 5px -2px rgba(0, 0, 0, 0.15) !important;
        }
        
        .simple-datatable-wrapper.sticky-first-column .p-datatable-thead .p-frozen-column {
          background-color: #f9fafb !important;
          z-index: 3 !important;
        }
        
        .simple-datatable-wrapper.sticky-first-column .p-datatable-tfoot .p-frozen-column {
          background-color: #f9fafb !important;
          z-index: 2 !important;
        }
        
        /* Frozen column on hover */
        .simple-datatable-wrapper.sticky-first-column .p-datatable-tbody > tr:hover .p-frozen-column {
          background-color: #f3f4f6 !important;
        }
        
        /* Striped rows with frozen column */
        .simple-datatable-wrapper.sticky-first-column .p-datatable-tbody > tr.p-row-odd .p-frozen-column {
          background-color: #f9fafb !important;
        }
        
        .simple-datatable-wrapper.sticky-first-column .p-datatable-tbody > tr.p-row-odd:hover .p-frozen-column {
          background-color: #f3f4f6 !important;
        }
        
        /* Custom Toolbar Responsive Styles */
        /* Mobile: Column layout (search on top, buttons below) */
        .custom-toolbar-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .custom-toolbar-search {
          width: 100%;
          position: relative;
        }
        
        .custom-toolbar-actions {
          width: 100%;
          justify-content: flex-start;
        }
        
        /* Ensure search input takes full width of its container */
        .custom-toolbar-search .p-inputtext {
          width: 100% !important;
        }
        
        /* Custom Toolbar Search Input Styles */
        .custom-toolbar-wrapper .custom-search-input,
        .custom-toolbar-wrapper .custom-search-input input {
          background-color: #ffffff !important;
          border: 1px solid #93c5fd !important;
          border-radius: 0.5rem !important;
        }
        
        .custom-toolbar-wrapper .custom-search-input:focus,
        .custom-toolbar-wrapper .custom-search-input:focus-within,
        .custom-toolbar-wrapper .custom-search-input input:focus {
          border-color: #60a5fa !important;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1) !important;
          outline: none !important;
        }
        
        .custom-toolbar-wrapper .custom-search-input input::placeholder {
          color: #9ca3af !important;
        }
        
        .custom-toolbar-wrapper .p-inputtext.custom-search-input,
        .custom-toolbar-wrapper .p-inputtext.custom-search-input input {
          background-color: #ffffff !important;
          border: 1px solid #93c5fd !important;
          border-radius: 0.5rem !important;
          color: #374151 !important;
        }
        
        .custom-toolbar-wrapper .p-inputtext.custom-search-input:focus,
        .custom-toolbar-wrapper .p-inputtext.custom-search-input:enabled:focus,
        .custom-toolbar-wrapper .p-inputtext.custom-search-input:focus-within,
        .custom-toolbar-wrapper .p-inputtext.custom-search-input input:focus {
          border-color: #60a5fa !important;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1) !important;
          outline: none !important;
        }
        
        .custom-toolbar-wrapper .p-inputtext.custom-search-input input::placeholder {
          color: #9ca3af !important;
        }
        
        /* Custom Toolbar Button Styles */
        .custom-toolbar-wrapper .custom-toolbar-button {
          display: flex !important;
          align-items: center !important;
          gap: 0.375rem !important;
          padding: 0.375rem 0.625rem !important;
          font-size: 0.75rem !important;
          font-weight: 400 !important;
          color: #374151 !important;
          background-color: #f3f4f6 !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 0.375rem !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          font-family: inherit !important;
          white-space: nowrap !important;
          flex-shrink: 0 !important;
        }
        
        .custom-toolbar-wrapper .custom-toolbar-button:hover {
          background-color: #e5e7eb !important;
          border-color: #d1d5db !important;
        }
        
        .custom-toolbar-wrapper .custom-toolbar-button:active {
          background-color: #d1d5db !important;
          border-color: #9ca3af !important;
        }
        
        .custom-toolbar-wrapper .custom-toolbar-button:focus {
          outline: none !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
        }
        
        /* Desktop: Row layout (search on left, buttons on right) */
        @media (min-width: 768px) {
          .custom-toolbar-content {
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
            gap: 1rem !important;
          }
          
          .custom-toolbar-search {
            flex: 1 1 auto !important;
            min-width: 15rem !important;
            max-width: 35rem !important;
            width: auto !important;
          }
          
          .custom-toolbar-search .p-inputtext {
            width: 100% !important;
          }
          
          .custom-toolbar-actions {
            width: auto !important;
            flex: 0 0 auto !important;
            justify-content: flex-end !important;
            flex-shrink: 0 !important;
          }
          
          /* Desktop: Slightly larger buttons */
          .custom-toolbar-wrapper .custom-toolbar-button {
            padding: 0.375rem 0.75rem !important;
            font-size: 0.8125rem !important;
            gap: 0.375rem !important;
          }
        }
        
        /* Mobile: Ensure buttons stay in one row */
        @media (max-width: 767px) {
          .custom-toolbar-actions {
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            scrollbar-width: none !important;
          }
          
          .custom-toolbar-actions::-webkit-scrollbar {
            display: none !important;
          }
        }
      `}</style>
      
      <div className={`simple-datatable-wrapper size-${tableSize}${isCompactText ? ' compact-text' : ''}${stickyFirstColumn ? ' sticky-first-column' : ''}`}>
        {/* Render toolbar based on toggle */}
        {useCustomToolbar ? (
          customToolbar
        ) : (
          <Toolbar
            left={nativeToolbarLeft}
            right={nativeToolbarRight}
            style={{ marginBottom: '1rem', borderRadius: '0.5rem' }}
          />
        )}
        
        {/* Render custom filters if enabled */}
        {customFiltersRow}
        
        {/* DataTable */}
        <DataTable
          value={displayData}
          loading={loading}
          dataKey={resolvedDataKey}
          filters={useCustomFilters ? undefined : filters}
          onFilter={useCustomFilters ? undefined : (e) => setFilters(e.filters)}
          filterDisplay={useCustomFilters ? undefined : (searchOnlyFilters ? "row" : "row")}
          globalFilterFields={displayColumns.map(col => col.key)}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          onRowClick={onRowClick ? (e) => onRowClick(e.data, e.index) : undefined}
          expandedRows={enableRowExpansion ? expandedRows : undefined}
          onRowToggle={enableRowExpansion ? (e) => {
            // Only update if e.data is provided (from PrimeReact's internal handling)
            // Our custom button handles expansion, so we ignore this in most cases
            if (e.data && typeof e.data === 'object') {
              setExpandedRows(e.data);
              setAllExpanded(false);
            }
          } : undefined}
          rowExpansionTemplate={enableRowExpansion ? (rowExpansionTemplate || defaultRowExpansionTemplate) : undefined}
          paginator={enablePagination}
          rows={rows}
          rowsPerPageOptions={pageSizeOptions}
          onPage={handlePageChange}
          first={(currentPage - 1) * rows}
          totalRecords={displayData.length}
          size={tableSize}
          responsiveLayout={responsiveLayout}
          scrollable={stickyFirstColumn}
          stripedRows
          showGridlines
          emptyMessage="No data available"
          style={{ borderRadius: '0.5rem' }}
          tableStyle={{
            tableLayout: equalColumnWidths ? 'fixed' : 'auto',
            width: '100%',
            minWidth: stickyFirstColumn ? '100%' : 'auto'
          }}
        >
          {/* Data columns */}
          {displayColumns.map((column, index) => {
            // Column width styles
            const equalWidthStyle = equalColumnWidths ? {
              width: '9.5rem',
              minWidth: '8rem',
              maxWidth: '9.5rem'
            } : {
              // When equalColumnWidths is disabled, set reasonable min/max widths
              minWidth: '6rem',  // 96px minimum
              maxWidth: '15rem', // 240px maximum
              width: 'auto'      // Auto-fit content within constraints
            };
            
            // Custom filter element for search-only mode
            const filterElement = (searchOnlyFilters && column.filterable && !useCustomFilters) ? () => {
              const handleFilterChange = (e) => {
                const value = e.target.value;
                setColumnFilters(prev => ({
                  ...prev,
                  [column.key]: value
                }));
              };
              
              return (
                <InputText
                  value={columnFilters[column.key] || ''}
                  onChange={handleFilterChange}
                  placeholder={`Search ${column.title}`}
                  style={{
                    width: '8rem',
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.875rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '1.5rem',
                    minHeight: '1.875rem',
                    backgroundColor: '#f9fafb',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.borderColor = '#3b82f6';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.borderColor = '#e5e7eb';
                  }}
                />
              );
            } : undefined;
            
            // Custom body template for first column with expander
            const bodyTemplate = (rowData) => {
              if (index === 0 && enableRowExpansion) {
                const rowKey = rowData[resolvedDataKey];
                
                // Safety check: ensure rowKey exists
                if (!rowKey && rowKey !== 0) {
                  console.warn('Row missing dataKey:', rowData);
                  return safeCell(rowData[column.key]);
                }
                
                const isExpanded = expandedRows && (expandedRows[rowKey] === true || expandedRows[String(rowKey)] === true);
                
                const handleExpandClick = (e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  
                  setExpandedRows(prevExpandedRows => {
                    const newExpandedRows = {};
                    const rowKeyStr = String(rowKey);
                    
                    // Copy all existing expanded rows except the one being toggled
                    Object.keys(prevExpandedRows || {}).forEach(key => {
                      if (key !== rowKeyStr && key !== String(rowKey)) {
                        newExpandedRows[key] = true;
                      }
                    });
                    
                    // Toggle the clicked row
                    const wasExpanded = prevExpandedRows[rowKey] === true || prevExpandedRows[rowKeyStr] === true;
                    if (!wasExpanded) {
                      newExpandedRows[rowKeyStr] = true;
                    }
                    
                    return newExpandedRows;
                  });
                  setAllExpanded(false);
                };
                
                return (
                  <div 
                    onClick={handleExpandClick}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%',
                      padding: '0.25rem 0',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Click to expand/collapse"
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: '#6b7280',
                        minWidth: '1.25rem',
                        padding: '0.25rem'
                      }}
                    >
                      <i className={isExpanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'} style={{ fontSize: isCompactText ? '0.65rem' : '0.75rem' }} />
                    </div>
                    <span style={{ fontSize: isCompactText ? '0.75rem' : 'inherit' }}>{safeCell(rowData[column.key])}</span>
                  </div>
                );
              }
              return safeCell(rowData[column.key]);
            };
            
            return (
              <Column
                key={column.key}
                field={column.key}
                header={column.title}
                frozen={stickyFirstColumn && index === 0}
                sortable={column.sortable && enableSorting}
                filter={column.filterable && !useCustomFilters}
                filterField={column.key}
                filterPlaceholder={`Search ${column.title}`}
                showFilterMenu={false}
                filterElement={searchOnlyFilters ? filterElement : undefined}
                body={bodyTemplate}
                footer={enableFooterTotals ? () => footerTemplate(column.key, index === 0) : undefined}
                style={{
                  ...equalWidthStyle,
                  ...column.style
                }}
                headerStyle={{
                  ...equalWidthStyle,
                  ...column.headerStyle
                }}
                footerStyle={{
                  fontWeight: '600',
                  backgroundColor: '#f3f4f6',
                  borderTop: '2px solid #d1d5db'
                }}
              />
            );
          })}
        </DataTable>
      </div>
    </div>
  );
};

export default SimpleDataTable;

