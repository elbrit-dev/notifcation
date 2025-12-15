import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';

// Custom hook for managing PrimeDataTable state and logic
export const usePrimeDataTable = ({
  data,
  columns,
  enableAutoMerge,
  mergeConfig,
  enableROICalculation,
  roiConfig,
  enablePivotTable,
  pivotConfig,
  enableFooterTotals,
  footerTotalsConfig,
  enableColumnGrouping,
  groupConfig,
  enableColumnFilter,
  defaultFilters
}) => {

  // Core state management
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState(defaultFilters || {});
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filteredDataForTotals, setFilteredDataForTotals] = useState([]);
  
  // Sorting state
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(1);
  
  // Selection state
  const [selectedRows, setSelectedRows] = useState([]);
  
  // Column management state
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [columnOrder, setColumnOrder] = useState([]);
  
  // Pivot state
  const [isPivotEnabled, setIsPivotEnabled] = useState(false);
  const [localPivotConfig, setLocalPivotConfig] = useState(pivotConfig || {});
  const [showPivotConfig, setShowPivotConfig] = useState(false);
  const [isLoadingPivotConfig, setIsLoadingPivotConfig] = useState(false);
  const [isSavingPivotConfig, setIsSavingPivotConfig] = useState(false);
  
  // UI state
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalSrc, setImageModalSrc] = useState('');
  const [imageModalAlt, setImageModalAlt] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Column grouping state
  const [commonFilterField, setCommonFilterField] = useState('');
  const [commonFilterValue, setCommonFilterValue] = useState('');
  
  // Refs for performance optimization
  const isMountedRef = useRef(false);
  const lastValidDataRef = useRef([]);
  
  // Initialize mounted ref
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Process initial data
  useEffect(() => {
    if (data) {
      setTableData(data);
      lastValidDataRef.current = data;
    }
  }, [data]);

  // Initialize default filters
  const initializeFilters = useCallback(() => {
    if (!enableColumnFilter) return {};
    
    const initialFilters = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
    
    columns.forEach(col => {
      if (col.filterable !== false) {
        const matchMode = col.type === 'dropdown' ? FilterMatchMode.EQUALS : FilterMatchMode.CONTAINS;
        initialFilters[col.key] = { 
          operator: FilterOperator.AND, 
          constraints: [{ value: null, matchMode }] 
        };
      }
    });
    
    return initialFilters;
  }, [columns, enableColumnFilter]);

  // Initialize filters when columns change
  useEffect(() => {
    if (columns.length > 0) {
      const initialFilters = initializeFilters();
      setFilters(initialFilters);
    }
  }, [columns, initializeFilters]);

  // Merge configuration
  const mergedPivotConfig = useMemo(() => {
    const defaultConfig = {
      enabled: enablePivotTable || false,
      rows: [],
      columns: [],
      values: [],
      filters: [],
      showGrandTotals: true,
      showRowTotals: true,
      showColumnTotals: true,
      showSubTotals: true,
      numberFormat: 'en-US',
      currency: 'USD',
      precision: 2,
      fieldSeparator: '__',
      dateFieldPattern: /^\d{4}-\d{2}-\d{2}$/,
      sortRows: true,
      sortColumns: true,
      sortDirection: 'asc',
      aggregationFunctions: {
        sum: (values) => values.reduce((a, b) => (a || 0) + (b || 0), 0),
        count: (values) => values.filter(v => v !== null && v !== undefined).length,
        average: (values) => {
          const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
          return validValues.length > 0 ? validValues.reduce((a, b) => a + b, 0) / validValues.length : 0;
        },
        min: (values) => {
          const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
          return validValues.length > 0 ? Math.min(...validValues) : 0;
        },
        max: (values) => {
          const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
          return validValues.length > 0 ? Math.max(...validValues) : 0;
        },
        first: (values) => values.find(v => v !== null && v !== undefined) || '',
        last: (values) => {
          const validValues = values.filter(v => v !== null && v !== undefined);
          return validValues.length > 0 ? validValues[validValues.length - 1] : '';
        }
      }
    };

    return {
      ...defaultConfig,
      ...pivotConfig,
      ...localPivotConfig
    };
  }, [pivotConfig, localPivotConfig, enablePivotTable]);

  // Safe callback wrapper to prevent React state updates during render
  const safeCallback = useCallback((callback, ...args) => {
    if (!isMountedRef.current) return;
    
    try {
      if (typeof callback === 'function') {
        // Use setTimeout to ensure callback runs after current render cycle
        setTimeout(() => {
          if (isMountedRef.current) {
            callback(...args);
          }
        }, 0);
      }
    } catch (error) {
      console.error('Safe callback error:', error);
    }
  }, []);

  // Column utilities
  const getAvailableFields = useMemo(() => {
    if (!tableData.length) return [];
    const sampleRow = tableData[0];
    return Object.keys(sampleRow).filter(key => key !== '__group');
  }, [tableData]);

  const getNumericFields = useMemo(() => {
    return getAvailableFields.filter(field => {
      const sampleValues = tableData.slice(0, 10).map(row => row[field]);
      return sampleValues.some(val => typeof val === 'number' && !isNaN(val));
    });
  }, [getAvailableFields, tableData]);

  const getCategoricalFields = useMemo(() => {
    return getAvailableFields.filter(field => {
      const uniqueValues = [...new Set(tableData.map(row => row[field]))];
      return uniqueValues.length <= 50; // Arbitrary threshold for categorical data
    });
  }, [getAvailableFields, tableData]);

  // Update filtered data when tableData or filters change
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    // Simple filter application for filtered data totals
    let filtered = tableData;
    
    if (globalFilterValue) {
      filtered = filtered.filter(row => {
        return Object.values(row).some(value => 
          String(value).toLowerCase().includes(globalFilterValue.toLowerCase())
        );
      });
    }
    
    const validFilteredData = filtered.filter(row => row && typeof row === 'object');
    setFilteredDataForTotals(validFilteredData);
  }, [tableData, globalFilterValue]);

  return {
    // State
    tableData,
    setTableData,
    loading,
    setLoading,
    error,
    setError,
    filters,
    setFilters,
    globalFilterValue,
    setGlobalFilterValue,
    filteredDataForTotals,
    setFilteredDataForTotals,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    selectedRows,
    setSelectedRows,
    hiddenColumns,
    setHiddenColumns,
    columnOrder,
    setColumnOrder,
    isPivotEnabled,
    setIsPivotEnabled,
    localPivotConfig,
    setLocalPivotConfig,
    showPivotConfig,
    setShowPivotConfig,
    isLoadingPivotConfig,
    setIsLoadingPivotConfig,
    isSavingPivotConfig,
    setIsSavingPivotConfig,
    showColumnManager,
    setShowColumnManager,
    showImageModal,
    setShowImageModal,
    imageModalSrc,
    setImageModalSrc,
    imageModalAlt,
    setImageModalAlt,
    isRefreshing,
    setIsRefreshing,
    commonFilterField,
    setCommonFilterField,
    commonFilterValue,
    setCommonFilterValue,
    
    // Computed values
    mergedPivotConfig,
    
    // Utilities
    safeCallback,
    getAvailableFields,
    getNumericFields,
    getCategoricalFields,
    
    // Refs
    isMountedRef,
    lastValidDataRef
  };
};