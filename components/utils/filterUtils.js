import { useCallback } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';

// Column type detection
export const getColumnType = (column) => {
  // Check if type is explicitly set
  if (column.type) {
    return column.type;
  }
  
  // Auto-detect based on column key patterns
  const key = column.key?.toLowerCase() || '';
  
  if (key.includes('date') || key.includes('time')) {
    return 'date';
  }
  
  if (key.includes('amount') || key.includes('price') || key.includes('total') || 
      key.includes('sum') || key.includes('value') || key.includes('cost') ||
      key.includes('revenue') || key.includes('profit')) {
    return 'number';
  }
  
  if (key.includes('active') || key.includes('enabled') || key.includes('visible') ||
      key.includes('published') || key.includes('completed')) {
    return 'boolean';
  }
  
  if (key.includes('status') || key.includes('type') || key.includes('category') ||
      key.includes('team') || key.includes('department')) {
    return 'dropdown';
  }
  
  return 'text';
};

// Safe filter callback
export const safeFilterCallback = (value) => {
  try {
    return value || '';
  } catch (error) {
    console.warn('Filter callback error:', error);
    return '';
  }
};

// Helper function to match filter values with enhanced null/undefined/empty value handling
export const matchFilterValue = (cellValue, filterValue, matchMode) => {
  // Handle null/undefined/empty values more comprehensively
  const isCellValueEmpty = cellValue === null || cellValue === undefined || cellValue === '' || cellValue === 0;
  const isFilterValueEmpty = filterValue === null || filterValue === undefined || filterValue === '';
  
  // Special handling for empty filter values
  if (isFilterValueEmpty) {
    return true; // Show all rows when filter is empty
  }
  
  // Special handling for empty cell values
  if (isCellValueEmpty) {
    // Only match if we're explicitly looking for empty values
    return filterValue === '' || filterValue === null || filterValue === undefined;
  }
  
  // Convert both values to strings for comparison, with null safety
  const cellStr = String(cellValue || '').toLowerCase();
  const filterStr = String(filterValue || '').toLowerCase();
  
  switch (matchMode) {
    case FilterMatchMode.STARTS_WITH:
      return cellStr.startsWith(filterStr);
    case FilterMatchMode.CONTAINS:
      return cellStr.includes(filterStr);
    case FilterMatchMode.NOT_CONTAINS:
      return !cellStr.includes(filterStr);
    case FilterMatchMode.ENDS_WITH:
      return cellStr.endsWith(filterStr);
    case FilterMatchMode.EQUALS:
      return cellStr === filterStr;
    case FilterMatchMode.NOT_EQUALS:
      return cellStr !== filterStr;
    case FilterMatchMode.LESS_THAN:
      return Number(cellValue) < Number(filterValue);
    case FilterMatchMode.LESS_THAN_OR_EQUAL_TO:
      return Number(cellValue) <= Number(filterValue);
    case FilterMatchMode.GREATER_THAN:
      return Number(cellValue) > Number(filterValue);
    case FilterMatchMode.GREATER_THAN_OR_EQUAL_TO:
      return Number(cellValue) >= Number(filterValue);
    case FilterMatchMode.BETWEEN:
      if (Array.isArray(filterValue) && filterValue.length === 2) {
        const [min, max] = filterValue;
        const numValue = Number(cellValue);
        return numValue >= Number(min || 0) && numValue <= Number(max || Number.MAX_VALUE);
      }
      return true;
    case FilterMatchMode.DATE_IS:
      return new Date(cellValue).toDateString() === new Date(filterValue).toDateString();
    case FilterMatchMode.DATE_IS_NOT:
      return new Date(cellValue).toDateString() !== new Date(filterValue).toDateString();
    case FilterMatchMode.DATE_BEFORE:
      return new Date(cellValue) < new Date(filterValue);
    case FilterMatchMode.DATE_AFTER:
      return new Date(cellValue) > new Date(filterValue);
    default:
      return cellStr.includes(filterStr);
  }
};

// Apply filters to data
export const applyFiltersToData = (data, filters) => {
  if (!filters || Object.keys(filters).length === 0) {
    return data;
  }
  
  return data.filter(row => {
    return Object.entries(filters).every(([field, filterConfig]) => {
      if (!filterConfig || !filterConfig.constraints) {
        return true;
      }
      
      const { constraints, operator } = filterConfig;
      const cellValue = row[field];
      
      if (operator === FilterOperator.AND) {
        return constraints.every(constraint => {
          return matchFilterValue(cellValue, constraint.value, constraint.matchMode);
        });
      } else {
        // OR operator
        return constraints.some(constraint => {
          return matchFilterValue(cellValue, constraint.value, constraint.matchMode);
        });
      }
    });
  });
};

// Clear all filters function
export const createClearAllFilters = (
  setFilters, 
  setGlobalFilterValue, 
  defaultColumns, 
  enableColumnFilter, 
  enableFooterTotals, 
  tableData, 
  getColumnType, 
  setFilteredDataForTotals
) => {
  return useCallback(() => {
    // Clear all column filters
    if (enableColumnFilter) {
      setFilters({});
    }
    
    // Clear global filter
    setGlobalFilterValue('');
    
    // Reset filtered data for totals calculation
    if (enableFooterTotals && setFilteredDataForTotals) {
      const validData = Array.isArray(tableData) 
        ? tableData.filter(row => row && typeof row === 'object')
        : [];
      setFilteredDataForTotals(validData);
    }
  }, [
    setFilters, 
    setGlobalFilterValue, 
    enableColumnFilter, 
    enableFooterTotals, 
    tableData, 
    setFilteredDataForTotals
  ]);
};

// Get column filter element based on column type
export const getColumnFilterElement = (column, value, onChange) => {
  const columnType = getColumnType(column);
  
  // This function returns the filter element configuration
  // The actual JSX elements should be created in the template utils
  return {
    type: columnType,
    value: value,
    onChange: onChange,
    column: column
  };
};

// Filter validation
export const validateFilterValue = (value, columnType) => {
  switch (columnType) {
    case 'number':
      return !isNaN(Number(value));
    case 'date':
      return !isNaN(Date.parse(value));
    case 'boolean':
      return typeof value === 'boolean' || value === 'true' || value === 'false';
    default:
      return true;
  }
};

// Get filter options for dropdown columns
export const getFilterOptions = (data, columnKey, customFilterOptions) => {
  // Check if custom options are provided
  if (customFilterOptions && customFilterOptions[columnKey]) {
    return customFilterOptions[columnKey];
  }
  
  // Generate options from data
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }
  
  const uniqueValues = [...new Set(
    data
      .map(row => row[columnKey])
      .filter(val => val !== null && val !== undefined && val !== '')
  )];
  
  return [
    { label: 'All', value: null },
    ...uniqueValues.map(val => ({ label: String(val), value: val }))
  ];
};