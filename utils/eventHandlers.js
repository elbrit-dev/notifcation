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

  const handleExport = useCallback(() => {
    if (!enableExport) return;
    
    // Use finalTableData which contains pivot-transformed data when pivot is enabled
    const dataToExport = finalTableData;
    
    if (onExport) {
      onExport(dataToExport);
    } else {
      // Enhanced export with multiple formats
      switch (exportFileType) {
        case 'excel':
          if (enableExcelExport) {
            // Excel export using jspdf-autotable
            const csvContent = [
              defaultColumns.map(col => col.title).join(','),
              ...dataToExport.map(row => 
                defaultColumns.map(col => `"${row[col.key] || ''}"`).join(',')
              )
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
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
            // PDF export using jspdf-autotable
            const csvContent = [
              defaultColumns.map(col => col.title).join(','),
              ...dataToExport.map(row => 
                defaultColumns.map(col => `"${row[col.key] || ''}"`).join(',')
              )
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${exportFilename}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
          }
          break;
        default:
          // Default CSV export
          const csvContent = [
            defaultColumns.map(col => col.title).join(','),
            ...dataToExport.map(row => 
              defaultColumns.map(col => `"${row[col.key] || ''}"`).join(',')
            )
          ].join('\n');
          
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${exportFilename}.csv`;
          a.click();
          URL.revokeObjectURL(url);
          break;
      }
    }
  }, [enableExport, finalTableData, onExport, exportFileType, enableExcelExport, enablePdfExport, exportFilename, defaultColumns]);

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