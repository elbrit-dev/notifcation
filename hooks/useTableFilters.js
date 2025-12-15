import { useState, useEffect, useCallback, useMemo } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';

export const useTableFilters = ({
  defaultColumns = [],
  enableColumnFilter = true,
  globalFilterValue: initialGlobalFilterValue = '',
  finalTableData = [],
  onFilterChange,
  onSortChange,
  onSearch,
  currentPage = 1,
  pageSize = 10,
  onPageChange
}) => {
  // Filter state
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(1);
  const [globalFilterValue, setGlobalFilterValue] = useState(initialGlobalFilterValue);
  
  // Pagination state
  const [localCurrentPage, setLocalCurrentPage] = useState(currentPage);
  const [localPageSize, setLocalPageSize] = useState(pageSize);

  // Initialize filters based on columns
  useEffect(() => {
    const initialFilters = {
      global: { value: globalFilterValue, matchMode: FilterMatchMode.CONTAINS }
    };
    
    defaultColumns.forEach(col => {
      if (col.filterable && enableColumnFilter) {
        initialFilters[col.key] = { 
          operator: FilterOperator.AND, 
          constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] 
        };
      }
    });
    setFilters(initialFilters);
  }, [defaultColumns, enableColumnFilter, globalFilterValue]);

  // Helper function to match filter values
  const matchFilterValue = useCallback((cellValue, filterValue, matchMode) => {
    if (cellValue === null || cellValue === undefined) {
      return filterValue === null || filterValue === undefined || filterValue === '';
    }
    
    if (typeof cellValue === 'number' || typeof cellValue === 'boolean') {
      switch (matchMode) {
        case FilterMatchMode.EQUALS:
          return cellValue === filterValue;
        case FilterMatchMode.NOT_EQUALS:
          return cellValue !== filterValue;
        case FilterMatchMode.LESS_THAN:
          return cellValue < filterValue;
        case FilterMatchMode.LESS_THAN_OR_EQUAL_TO:
          return cellValue <= filterValue;
        case FilterMatchMode.GREATER_THAN:
          return cellValue > filterValue;
        case FilterMatchMode.GREATER_THAN_OR_EQUAL_TO:
          return cellValue >= filterValue;
        default:
          return cellValue === filterValue;
      }
    }
    
    const cellStr = String(cellValue).toLowerCase();
    const filterStr = String(filterValue).toLowerCase();
    
    switch (matchMode) {
      case FilterMatchMode.STARTS_WITH:
        return cellStr.startsWith(filterStr);
      case FilterMatchMode.ENDS_WITH:
        return cellStr.endsWith(filterStr);
      case FilterMatchMode.EQUALS:
        return cellStr === filterStr;
      case FilterMatchMode.NOT_EQUALS:
        return cellStr !== filterStr;
      case FilterMatchMode.CONTAINS:
      default:
        return cellStr.includes(filterStr);
    }
  }, []);

  // Apply filters to data manually
  const applyFiltersToData = useCallback((data, filters) => {
    if (!filters || Object.keys(filters).length === 0) return data;
    
    return data.filter(row => {
      if (!row || typeof row !== 'object') return false;
      
      // Check global filter
      if (filters.global && filters.global.value) {
        const globalValue = String(filters.global.value).toLowerCase();
        const globalMatch = defaultColumns.some(col => {
          const cellValue = String(row[col.key] || '').toLowerCase();
          return cellValue.includes(globalValue);
        });
        if (!globalMatch) return false;
      }
      
      // Check column filters
      for (const [columnKey, filterConfig] of Object.entries(filters)) {
        if (columnKey === 'global') continue;
        
        const cellValue = row[columnKey];
        
        if (filterConfig.operator && filterConfig.constraints) {
          const constraintResults = filterConfig.constraints.map(constraint => {
            if (!constraint.value && constraint.value !== 0 && constraint.value !== false) return true;
            
            const constraintValue = constraint.value;
            const matchMode = constraint.matchMode || FilterMatchMode.CONTAINS;
            
            return matchFilterValue(cellValue, constraintValue, matchMode);
          });
          
          const result = filterConfig.operator === FilterOperator.AND
            ? constraintResults.every(Boolean)
            : constraintResults.some(Boolean);
            
          if (!result) return false;
        } else {
          if (filterConfig.value !== null && filterConfig.value !== undefined && filterConfig.value !== '') {
            const matchMode = filterConfig.matchMode || FilterMatchMode.CONTAINS;
            if (!matchFilterValue(cellValue, filterConfig.value, matchMode)) {
              return false;
            }
          }
        }
      }
      
      return true;
    });
  }, [defaultColumns, matchFilterValue]);

  // Filtered data
  const filteredData = useMemo(() => {
    return applyFiltersToData(finalTableData, filters);
  }, [finalTableData, filters, applyFiltersToData]);

  // Event handlers
  const handleSort = useCallback((event) => {
    setSortField(event.sortField);
    setSortOrder(event.sortOrder);
    
    if (onSortChange) {
      onSortChange(event.sortField, event.sortOrder === 1 ? 'asc' : 'desc');
    }
  }, [onSortChange]);

  const handleFilter = useCallback((event) => {
    setFilters(event.filters);
    
    if (onFilterChange) {
      onFilterChange(event.filters);
    }
  }, [onFilterChange]);

  const handleSearch = useCallback((value) => {
    setGlobalFilterValue(value);
    
    let _filters = { ...filters };
    if (!_filters['global']) {
      _filters['global'] = { value: null, matchMode: FilterMatchMode.CONTAINS };
    }
    _filters['global'].value = value;
    setFilters(_filters);
    
    if (onSearch) {
      onSearch(value);
    }
  }, [onSearch, filters]);

  const clearAllFilters = useCallback(() => {
    setGlobalFilterValue("");
    
    const clearedFilters = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
    
    defaultColumns.forEach(col => {
      if (col.filterable && enableColumnFilter) {
        clearedFilters[col.key] = { 
          operator: FilterOperator.AND, 
          constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] 
        };
      }
    });
    
    setFilters(clearedFilters);
    setSortField(null);
    setSortOrder(1);
  }, [defaultColumns, enableColumnFilter]);

  const handlePageChange = useCallback((event) => {
    setLocalCurrentPage(event.page + 1);
    setLocalPageSize(event.rows);
    
    if (onPageChange) {
      onPageChange(event.page + 1);
    }
  }, [onPageChange]);

  return {
    // Filter state
    filters,
    setFilters,
    globalFilterValue,
    sortField,
    sortOrder,
    
    // Pagination state
    localCurrentPage,
    localPageSize,
    
    // Filtered data
    filteredData,
    
    // Event handlers
    handleSort,
    handleFilter,
    handleSearch,
    clearAllFilters,
    handlePageChange,
    
    // Utilities
    applyFiltersToData
  };
}; 