import { useCallback } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';

// Exact event handler functions extracted from PrimeDataTable.js
export const createEventHandlers = ({
  setSortField,
  setSortOrder,
  onSortChange,
  safeCallback,
  setFilters,
  onFilterChange,
  finalTableData,
  setGlobalFilterValue,
  onSearch,
  onBulkAction,
  selectedRows,
  setCommonFilterField,
  setCommonFilterValue,
  defaultColumns,
  enableColumnFilter,
  enableFooterTotals,
  tableData,
  getColumnType,
  setFilteredDataForTotals,
  setSelectedRows,
  onRowSelect,
  enableExport,
  onExport,
  exportFileType,
  enableExcelExport,
  enablePdfExport,
  exportFilename,
  exportExpandedData,
  exportNestedAsColumns,
  enableRefresh,
  onRefresh,
  setIsRefreshing,
  setLocalEditingRows,
  onEditingRowsChange,
  setLocalContextMenuSelection,
  onContextMenuSelectionChange,
  onContextMenu,
  setLocalCurrentPage,
  setLocalPageSize,
  onPageChange,
  onRowEditSave,
  onRowEditCancel,
  onRowEditInit
}) => {

  // Enhanced event handlers - EXACT CODE FROM PRIMEDATATABLE.JS
  const handleSort = useCallback((event) => {
    setSortField(event.sortField);
    setSortOrder(event.sortOrder);
    
    // HYDRATION FIX: Use safe callback to prevent setState during render
    if (onSortChange) {
      safeCallback(onSortChange, event.sortField, event.sortOrder === 1 ? 'asc' : 'desc');
    }
  }, [onSortChange, safeCallback]);

  const handleFilter = useCallback((event) => {
    console.log('🔍 FILTER EVENT (handleFilter called):', {
      filters: event.filters,
      filteredValue: event.filteredValue?.length || 0,
      originalData: finalTableData?.length || 0,
      eventType: event.type,
      eventTarget: event.target
    });
    
    // FIXED: Ensure filters are properly structured before setting
    const validatedFilters = { ...event.filters };
    
    // Validate and fix filter structure if needed
    Object.keys(validatedFilters).forEach(key => {
      if (key !== 'global' && validatedFilters[key]) {
        const filter = validatedFilters[key];
        
        // Ensure filter has proper structure with operator and constraints
        if (!filter.operator && !filter.constraints) {
          // Convert simple filter to advanced structure
          validatedFilters[key] = {
            operator: FilterOperator.AND,
            constraints: [{
              value: filter.value || null,
              matchMode: filter.matchMode || FilterMatchMode.CONTAINS
            }]
          };
        } else if (filter.constraints && Array.isArray(filter.constraints)) {
          // Ensure constraints have proper structure
          filter.constraints = filter.constraints.map(constraint => ({
            value: constraint.value || null,
            matchMode: constraint.matchMode || FilterMatchMode.CONTAINS
          }));
        }
      }
    });
    
    setFilters(validatedFilters);
    
    // HYDRATION FIX: Use safe callback to prevent setState during render
    if (onFilterChange) {
      safeCallback(onFilterChange, validatedFilters);
    }
  }, [onFilterChange, safeCallback, finalTableData]);

  const handleSearch = useCallback((value) => {
    console.log('🔍 GLOBAL SEARCH:', value);
    setGlobalFilterValue(value);
    
    if (onSearch) {
      onSearch(value);
    }
  }, [onSearch]);

  const handleBulkAction = useCallback((action) => {
    if (onBulkAction) {
      onBulkAction(action, selectedRows);
    }
  }, [onBulkAction, selectedRows]);

  const clearAllFilters = useCallback(() => {
    console.log('🔍 CLEARING ALL FILTERS');
    setGlobalFilterValue("");
    
    // Clear common filter for column grouping
    setCommonFilterField('');
    setCommonFilterValue('');
    
    // Reset all filters to default state
    const clearedFilters = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
    
    // Reset column filters to default state with proper match modes
    defaultColumns.forEach(col => {
      const isFilterable = (col.filterable !== false) && enableColumnFilter;
      
      if (isFilterable) {
        // FIXED: Use appropriate match mode based on column type
        const columnType = getColumnType(col);
        let matchMode = FilterMatchMode.CONTAINS;
        
        switch (columnType) {
          case 'dropdown':
          case 'select':
          case 'categorical':
          case 'boolean':
            matchMode = FilterMatchMode.EQUALS;
            break;
          case 'number':
            matchMode = FilterMatchMode.EQUALS;
            break;
          case 'date':
          case 'datetime':
            matchMode = FilterMatchMode.DATE_IS;
            break;
          default:
            matchMode = FilterMatchMode.CONTAINS;
        }
        
        clearedFilters[col.key] = { 
          operator: FilterOperator.AND, 
          constraints: [{ value: null, matchMode }] 
        };
      }
    });
    
    setFilters(clearedFilters);
    setSortField(null);
    setSortOrder(1);
    
    // Clear filtered data for totals
    if (enableFooterTotals) {
      setFilteredDataForTotals(tableData.filter(row => row && typeof row === 'object'));
    }
  }, [defaultColumns, enableColumnFilter, enableFooterTotals, tableData, getColumnType]);

  const handleRowSelect = useCallback((event) => {
    setSelectedRows(event.value);
    
    if (onRowSelect) {
      onRowSelect(event.value);
    }
  }, [onRowSelect]);

  // Helper function to safely format cell values for export
  const formatCellForExport = useCallback((value, expandedMode = false) => {
    if (value == null) return '';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      // If it's an array of objects, create a detailed or summary view
      if (value.length > 0 && typeof value[0] === 'object' && !Array.isArray(value[0])) {
        if (expandedMode && exportExpandedData) {
          // Detailed export: show full object details
          return value.map((item, index) => {
            const keys = Object.keys(item);
            const details = keys.map(key => `${key}: ${formatCellForExport(item[key], false)}`).join('; ');
            return `[${index + 1}] ${details}`;
          }).join(' | ');
        } else {
          // Summary export: show condensed info
          return `${value.length} items: ${value.map((item, index) => {
            const keys = Object.keys(item);
            const summary = keys.slice(0, 3).map(key => `${key}: ${item[key]}`).join('; ');
            return `[${index + 1}] ${summary}${keys.length > 3 ? '...' : ''}`;
          }).join(' | ')}`;
        }
      }
      // If it's an array of primitives, join them
      return value.join('; ');
    }
    
    // Handle objects
    if (typeof value === 'object') {
      try {
        const keys = Object.keys(value);
        if (keys.length === 0) return '[empty object]';
        
        if (expandedMode && exportExpandedData) {
          // Detailed export: show all object properties
          const summary = keys.map(key => {
            const val = value[key];
            if (val == null) return `${key}: null`;
            if (Array.isArray(val)) return `${key}: [${val.length} items: ${formatCellForExport(val, false)}]`;
            if (typeof val === 'object') return `${key}: ${formatCellForExport(val, false)}`;
            return `${key}: ${String(val)}`;
          }).join('; ');
          return summary;
        } else {
          // Summary export: show limited properties
          const summary = keys.slice(0, 5).map(key => {
            const val = value[key];
            if (val == null) return `${key}: null`;
            if (Array.isArray(val)) return `${key}: [${val.length} items]`;
            if (typeof val === 'object') return `${key}: [object]`;
            return `${key}: ${String(val)}`;
          }).join('; ');
          
          return keys.length > 5 ? `${summary}; ...` : summary;
        }
      } catch {
        return '[object]';
      }
    }
    
    return String(value);
  }, [exportExpandedData]);

  const handleExport = useCallback(() => {
    if (!enableExport) return;
    
    // Skip export functionality in Plasmic Studio to avoid DOM API issues
    const isPlasmicStudio = typeof window !== 'undefined' && window.location?.hostname?.includes('plasmic');
    const isValidBrowserEnvironment = typeof window !== 'undefined' && typeof document !== 'undefined' && typeof URL !== 'undefined';
    
    if (isPlasmicStudio || !isValidBrowserEnvironment) {
      console.log('Export functionality disabled in Plasmic Studio environment');
      return;
    }
    
    // Use finalTableData which contains pivot-transformed data when pivot is enabled
    const dataToExport = finalTableData;
    
    if (onExport) {
      onExport(dataToExport);
    } else {
      // Enhanced export with multiple formats and proper nested data handling
      const generateCSVContent = () => {
        if (exportNestedAsColumns) {
          // Flatten nested objects as separate columns
          const allColumns = new Set();
          const flattenedData = [];
          
          // First pass: identify all possible columns including nested ones
          dataToExport.forEach(row => {
            const flatRow = {};
            
            defaultColumns.forEach(col => {
              const value = row[col.key];
              
              if (value && typeof value === 'object' && !Array.isArray(value)) {
                // Flatten object properties as separate columns
                Object.keys(value).forEach(nestedKey => {
                  const flatColumnKey = `${col.title}.${nestedKey}`;
                  allColumns.add(flatColumnKey);
                  flatRow[flatColumnKey] = formatCellForExport(value[nestedKey], false);
                });
              } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
                // For arrays of objects, create indexed columns
                value.forEach((item, index) => {
                  Object.keys(item).forEach(nestedKey => {
                    const flatColumnKey = `${col.title}[${index}].${nestedKey}`;
                    allColumns.add(flatColumnKey);
                    flatRow[flatColumnKey] = formatCellForExport(item[nestedKey], false);
                  });
                });
              } else {
                // Regular column
                allColumns.add(col.title);
                flatRow[col.title] = formatCellForExport(value, exportExpandedData);
              }
            });
            
            flattenedData.push(flatRow);
          });
          
          const headers = Array.from(allColumns);
          const rows = flattenedData.map(row => 
            headers.map(header => {
              const value = row[header] || '';
              return `"${String(value).replace(/"/g, '""')}"`;
            })
          );
          
          return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        } else {
          // Standard export with enhanced nested data formatting
          const headers = defaultColumns.map(col => col.title);
          const rows = dataToExport.map(row => 
            defaultColumns.map(col => {
              const cellValue = row[col.key];
              const formattedValue = formatCellForExport(cellValue, exportExpandedData);
              // Escape quotes and wrap in quotes for CSV
              return `"${formattedValue.replace(/"/g, '""')}"`;
            })
          );
          return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        }
      };

      switch (exportFileType) {
        case 'excel':
          if (enableExcelExport) {
            const csvContent = generateCSVContent();
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${exportFilename}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
          }
          break;
        case 'pdf':
          if (enablePdfExport) {
            // For PDF, we'll use CSV format for now (you can enhance this with actual PDF generation)
            const csvContent = generateCSVContent();
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${exportFilename}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
          }
          break;
        default:
          // Enhanced CSV export with proper nested data handling
          const csvContent = generateCSVContent();
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${exportFilename}.csv`;
          a.click();
          URL.revokeObjectURL(url);
          break;
      }
    }
  }, [enableExport, finalTableData, onExport, exportFileType, enableExcelExport, enablePdfExport, exportFilename, defaultColumns, formatCellForExport, exportExpandedData, exportNestedAsColumns]);

  const handleRefresh = useCallback(async () => {
    if (!enableRefresh) return;
    
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [enableRefresh, onRefresh]);

  // Inline editing handlers - EXACT CODE FROM PRIMEDATATABLE.JS
  const handleRowEditSave = useCallback((event) => {
    if (onRowEditSave) {
      onRowEditSave(event);
    }
  }, [onRowEditSave]);

  const handleRowEditCancel = useCallback((event) => {
    if (onRowEditCancel) {
      onRowEditCancel(event);
    }
  }, [onRowEditCancel]);

  const handleRowEditInit = useCallback((event) => {
    if (onRowEditInit) {
      onRowEditInit(event);
    }
  }, [onRowEditInit]);

  const handleEditingRowsChange = useCallback((event) => {
    setLocalEditingRows(event.value);
    if (onEditingRowsChange) {
      onEditingRowsChange(event);
    }
  }, [onEditingRowsChange]);

  // Context menu handlers - EXACT CODE FROM PRIMEDATATABLE.JS
  const handleContextMenuSelectionChange = useCallback((event) => {
    setLocalContextMenuSelection(event.value);
    if (onContextMenuSelectionChange) {
      onContextMenuSelectionChange(event);
    }
  }, [onContextMenuSelectionChange]);

  const handleContextMenu = useCallback((event) => {
    if (onContextMenu) {
      onContextMenu(event);
    }
  }, [onContextMenu]);

  const handlePageChange = useCallback((event) => {
    setLocalCurrentPage(event.page + 1);
    setLocalPageSize(event.rows);
    
    if (onPageChange) {
      onPageChange(event.page + 1);
    }
  }, [onPageChange]);

  return {
    handleSort,
    handleFilter,
    handleSearch,
    handleBulkAction,
    clearAllFilters,
    handleRowSelect,
    handleExport,
    handleRefresh,
    handleRowEditSave,
    handleRowEditCancel,
    handleRowEditInit,
    handleEditingRowsChange,
    handleContextMenuSelectionChange,
    handleContextMenu,
    handlePageChange
  };
};