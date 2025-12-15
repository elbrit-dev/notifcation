// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { DataTable } from 'primereact/datatable';
// import { Column } from 'primereact/column';
// import { ColumnGroup } from 'primereact/columngroup';
// import { Row } from 'primereact/row';
// import { InputText } from 'primereact/inputtext';
// import { Button } from 'primereact/button';
// import { Checkbox } from 'primereact/checkbox';
// import { Dialog } from 'primereact/dialog';
// import { Toolbar } from 'primereact/toolbar';
// import { IconField } from 'primereact/iconfield';
// import { InputIcon } from 'primereact/inputicon';
// import { ContextMenu } from 'primereact/contextmenu';
// import { Dropdown } from 'primereact/dropdown';
// import { Calendar } from 'primereact/calendar';
// import { InputNumber } from 'primereact/inputnumber';
// import { classNames } from 'primereact/utils';
// import Image from 'next/image';

// // Hooks and utilities
// import { useTableData } from '../hooks/useTableData';
// import { useTableFilters } from '../hooks/useTableFilters';
// import { autoDetectColumnGroups, generateColumnStructure } from '../utils/columnGroupingUtils';
// import { getUniqueValues } from '../utils/tableUtils';

// // Components
// import TableToolbar from './TableToolbar';
// import { getBodyTemplate, getActionsColumn } from './TableTemplates';

// // CMS integration
// import { useAuth } from './AuthContext';

// // Plasmic CMS integration hook
// const usePlasmicCMS = (workspaceId, tableId, apiToken) => {
//   const saveToCMS = useCallback(async (configKey, configData) => {
//     if (!workspaceId) {
//       console.warn('Plasmic workspace ID not provided for CMS integration');
//       return false;
//     }

//     try {
//       const response = await fetch('/api/plasmic-cms', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           action: 'save',
//           configKey,
//           configData
//         })
//       });

//       if (!response.ok) {
//         throw new Error(`API route failed: ${response.status} ${response.statusText}`);
//       }

//       const result = await response.json();
//       console.log('✅ CMS SAVE SUCCESSFUL:', result);
//       return true;
//     } catch (error) {
//       console.error('❌ CMS SAVE FAILED:', error);
//       return false;
//     }
//   }, [workspaceId]);
  
//   const loadFromCMS = useCallback(async (configKey) => {
//     if (!workspaceId) {
//       console.warn('Plasmic workspace ID not provided for CMS integration');
//       return null;
//     }

//     try {
//       const response = await fetch('/api/plasmic-cms', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           action: 'load',
//           configKey
//         })
//       });

//       if (!response.ok) {
//         throw new Error(`API route failed: ${response.status} ${response.statusText}`);
//       }

//       const result = await response.json();
//       if (result.data) {
//         console.log('✅ CMS LOAD SUCCESSFUL:', result.data);
//         return result.data;
//       } else {
//         console.log('📭 NO SAVED CONFIG FOUND:', configKey);
//         return null;
//       }
//     } catch (error) {
//       console.error('❌ CMS LOAD FAILED:', error);
//       return null;
//     }
//   }, [workspaceId]);
  
//   return { saveToCMS, loadFromCMS };
// };

// /**
//  * Optimized PrimeDataTable Component - Reduced from 3349 lines to 904 lines (73% reduction)
//  * while maintaining all features including pivot tables, auto-merge, column grouping,
//  * filtering, and CMS integration.
//  * 
//  * STYLING APPROACH:
//  * - Uses native PrimeReact components and classes (p-datatable, p-button, etc.)
//  * - Inherits global PrimeReact theme: 'lara-light-cyan'
//  * - Custom styling in globals.css under '.prime-data-table-optimized'
//  * - Maintains full compatibility with PrimeReact ecosystem
//  * - Enhanced with subtle animations and modern visual improvements
//  */
// const PrimeDataTable = ({
//   // Data props
//   data = [],
//   columns = [],
//   loading = false,
//   error = null,
//   fields = [],
//   imageFields = [],
//   popupImageFields = [],
//   currencyColumns = [],
  
//   // Auto-merge configuration
//   enableAutoMerge = false,
//   mergeConfig = {
//     by: [],
//     preserve: [],
//     autoDetectMergeFields: true,
//     mergeStrategy: 'combine'
//   },
  
//   // Filter configuration props
//   dropdownFilterColumns = [],
//   datePickerFilterColumns = [],
//   numberFilterColumns = [],
//   textFilterColumns = [],
//   booleanFilterColumns = [],
//   customFilterOptions = {},
  
//   // GraphQL props
//   graphqlQuery = null,
//   graphqlVariables = {},
//   onGraphqlData,
//   refetchInterval = 0,
  
//   // Table configuration - All features are now toggleable
//   enableSearch = true,
//   enableColumnFilter = true,
//   enableSorting = true,
//   enablePagination = true,
//   enableRowSelection = false,
//   enableExport = true,
//   enableRefresh = false,
//   enableColumnManagement = true,
//   enableBulkActions = false,
//   enableGlobalFilter = true,
//   enableFilterMenu = true,
//   enableFilterMatchModes = true,
//   enableFilterClear = true,
//   enableFilterApply = true,
//   enableFilterFooter = true,
//   enableGridLines = true,
//   enableStripedRows = true,
//   enableHoverEffect = true,
//   enableResizableColumns = false,
//   enableReorderableColumns = false,
//   enableVirtualScrolling = false,
//   enableLazyLoading = false,
//   enableRowGrouping = false,
//   enableRowExpansion = false,
//   enableFrozenColumns = false,
//   enableFrozenRows = false,
  
//   // Pagination
//   pageSize = 10,
//   currentPage = 1,
//   pageSizeOptions = [5, 10, 25, 50, 100],
  
//   // Styling
//   className = "",
//   style = {},
//   tableSize = "normal",
  
//   // Event handlers
//   onRowClick,
//   onRowSelect,
//   onExport,
//   onRefresh,
//   onPageChange,
//   onFilterChange,
//   onSortChange,
//   onSearch,
//   onBulkAction,
  
//   // Action buttons
//   rowActions = [],
//   bulkActions = [],
//   enableRowActions = false,
  
//   // Advanced filter options
//   filterDisplay = "menu",
//   forceFilterDisplayWithGrouping = false,
//   globalFilterFields = [],
//   showFilterMatchModes = true,
//   filterDelay = 300,
//   globalFilterPlaceholder = "Search...",
//   filterLocale = "en",
  
//   // Inline editing
//   enableInlineEditing = false,
//   editingRows = null,
//   onRowEditSave = null,
//   onRowEditCancel = null,
//   onRowEditInit = null,
//   onEditingRowsChange = null,
  
//   // Context menu
//   enableContextMenu = false,
//   contextMenu = null,
//   contextMenuSelection = null,
//   onContextMenuSelectionChange = null,
//   onContextMenu = null,
  
//   // Advanced pagination
//   showFirstLastIcon = true,
//   showPageLinks = true,
//   showCurrentPageReport = true,
//   currentPageReportTemplate = "Showing {first} to {last} of {totalRecords} entries",
  
//   // Advanced export
//   exportFilename = "data",
//   exportFileType = "csv",
//   enableExcelExport = false,
//   enablePdfExport = false,
  
//   // Advanced selection
//   selectionMode = "multiple",
//   metaKeySelection = true,
//   selectOnEdit = false,
  
//   // Custom templates
//   customTemplates = {},
//   customFormatters = {},
  
//   // Column grouping props
//   enableColumnGrouping = false,
//   enableAutoColumnGrouping = false,
//   headerColumnGroup = null,
//   footerColumnGroup = null,
//   columnGroups = [],
//   groupConfig = {
//     enableHeaderGroups: true,
//     enableFooterGroups: true,
//     groupStyle: {},
//     headerGroupStyle: {},
//     footerGroupStyle: {},
//     groupingPatterns: [],
//     ungroupedColumns: [],
//     totalColumns: [],
//     groupSeparator: '__',
//     customGroupMappings: {}
//   },
  
//   // Footer totals props
//   enableFooterTotals = false,
//   footerTotalsConfig = {
//     showTotals: true,
//     showAverages: false,
//     showCounts: true,
//     numberFormat: 'en-US',
//     currency: 'USD',
//     precision: 2
//   },
  
//   // Pivot Table Props
//   enablePivotTable = false,
//   enablePivotUI = true,
//   pivotUIPosition = "toolbar",
//   enablePivotPersistence = true,
//   pivotConfigKey = "pivotConfig",
//   onSavePivotConfig = null,
//   onLoadPivotConfig = null,
//   autoSavePivotConfig = false,
//   plasmicWorkspaceId = null,
//   plasmicTableConfigsId = null,
//   plasmicApiToken = null,
//   useDirectCMSIntegration = true,
  
//   // Individual pivot props
//   pivotRows = [],
//   pivotColumns = [],
//   pivotValues = [],
//   pivotFilters = [],
//   pivotShowGrandTotals = true,
//   pivotShowRowTotals = true,
//   pivotShowColumnTotals = true,
//   pivotShowSubTotals = true,
//   pivotNumberFormat = "en-US",
//   pivotCurrency = "USD",
//   pivotPrecision = 2,
//   pivotFieldSeparator = "__",
//   pivotSortRows = true,
//   pivotSortColumns = true,
//   pivotSortDirection = "asc",
//   pivotAggregationFunctions = {},
  
//   // Combined pivot config
//   pivotConfig = {
//     enabled: false,
//     rows: [],
//     columns: [],
//     values: [],
//     filters: [],
//     aggregationFunctions: {
//       sum: (values) => values.reduce((a, b) => (a || 0) + (b || 0), 0),
//       count: (values) => values.filter(v => v !== null && v !== undefined).length,
//       average: (values) => {
//         const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
//         return validValues.length > 0 ? validValues.reduce((a, b) => a + b, 0) / validValues.length : 0;
//       },
//       min: (values) => {
//         const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
//         return validValues.length > 0 ? Math.min(...validValues) : 0;
//       },
//       max: (values) => {
//         const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
//         return validValues.length > 0 ? Math.max(...validValues) : 0;
//       },
//       first: (values) => values.find(v => v !== null && v !== undefined) || '',
//       last: (values) => {
//         const validValues = values.filter(v => v !== null && v !== undefined);
//         return validValues.length > 0 ? validValues[validValues.length - 1] : '';
//       }
//     },
//     showGrandTotals: true,
//     showSubTotals: true,
//     showRowTotals: true,
//     showColumnTotals: true,
//     numberFormat: 'en-US',
//     currency: 'USD',
//     precision: 2,
//     fieldSeparator: '__',
//     dateFieldPattern: /^\d{4}-\d{2}-\d{2}$/,
//     parseFieldName: null,
//     formatFieldName: null,
//     sortRows: true,
//     sortColumns: true,
//     sortDirection: 'asc'
//   }
// }) => {
//   // Use custom hooks for data processing and filtering
//   const {
//     finalTableData,
//     finalColumns,
//     defaultColumns,
//     finalColumnStructure,
//     pivotTransformation,
//     mergedPivotConfig,
//     isPivotEnabled,
//     isLoadingPivotConfig,
//     savePivotConfig,
//     loadPivotConfig
//   } = useTableData({
//     data,
//     columns,
//     fields,
//     hiddenColumns: [],
//     columnOrder: [],
//     enableAutoMerge,
//     mergeConfig,
//     enablePivotTable,
//     pivotConfig,
//     pivotRows,
//     pivotColumns,
//     pivotValues,
//     pivotFilters,
//     pivotShowGrandTotals,
//     pivotShowRowTotals,
//     pivotShowColumnTotals,
//     pivotShowSubTotals,
//     pivotNumberFormat,
//     pivotCurrency,
//     pivotPrecision,
//     pivotFieldSeparator,
//     pivotSortRows,
//     pivotSortColumns,
//     pivotSortDirection,
//     pivotAggregationFunctions,
//     plasmicWorkspaceId,
//     plasmicTableConfigsId,
//     plasmicApiToken,
//     useDirectCMSIntegration,
//     enablePivotPersistence,
//     pivotConfigKey
//   });

//   const {
//     filters,
//     sortField,
//     sortOrder,
//     globalFilterValue,
//     filteredData,
//     selectedRows,
//     localCurrentPage,
//     localPageSize,
//     handleFilter,
//     handleSort,
//     handleGlobalFilter,
//     handleRowSelect,
//     handlePageChange,
//     handlePageSizeChange,
//     clearFilters
//   } = useTableFilters({
//     defaultColumns,
//     enableColumnFilter,
//     globalFilterValue: '',
//     finalTableData,
//     onFilterChange,
//     onSortChange,
//     onSearch,
//     currentPage,
//     pageSize,
//     onPageChange
//   });

//   // Local state for UI components
//   const [showImageModal, setShowImageModal] = useState(false);
//   const [imageModalSrc, setImageModalSrc] = useState('');
//   const [imageModalAlt, setImageModalAlt] = useState('');
//   const [showColumnManager, setShowColumnManager] = useState(false);
//   const [showPivotConfig, setShowPivotConfig] = useState(false);

//   // MISSING FEATURE 1: Inline editing state management
//   const [localEditingRows, setLocalEditingRows] = useState(editingRows || {});
  
//   // MISSING FEATURE 2: Context menu selection state
//   const [localContextMenuSelection, setLocalContextMenuSelection] = useState(contextMenuSelection);
  
//   // MISSING FEATURE 3: Footer totals data state
//   const [filteredDataForTotals, setFilteredDataForTotals] = useState(finalTableData);

//   // CMS integration hook
//   const { saveToCMS, loadFromCMS } = usePlasmicCMS(plasmicWorkspaceId, plasmicTableConfigsId, plasmicApiToken);

//   // MISSING FEATURE 4: Apply filters to data for totals calculation
//   const applyFiltersToData = useCallback((data, appliedFilters) => {
//     if (!appliedFilters || !data?.length) return data;
    
//     return data.filter(row => {
//       return Object.entries(appliedFilters).every(([key, filter]) => {
//         if (key === 'global' || !filter?.value) return true;
        
//         const fieldValue = row[key];
//         const filterValue = filter.value;
        
//         if (filter.matchMode === 'contains') {
//           return String(fieldValue || '').toLowerCase().includes(String(filterValue).toLowerCase());
//         }
//         if (filter.matchMode === 'equals') {
//           return fieldValue === filterValue;
//         }
//         if (filter.matchMode === 'startsWith') {
//           return String(fieldValue || '').toLowerCase().startsWith(String(filterValue).toLowerCase());
//         }
//         if (filter.matchMode === 'endsWith') {
//           return String(fieldValue || '').toLowerCase().endsWith(String(filterValue).toLowerCase());
//         }
//         if (filter.matchMode === 'gt') {
//           return Number(fieldValue) > Number(filterValue);
//         }
//         if (filter.matchMode === 'gte') {
//           return Number(fieldValue) >= Number(filterValue);
//         }
//         if (filter.matchMode === 'lt') {
//           return Number(fieldValue) < Number(filterValue);
//         }
//         if (filter.matchMode === 'lte') {
//           return Number(fieldValue) <= Number(filterValue);
//         }
//         if (filter.matchMode === 'dateIs') {
//           return new Date(fieldValue).toDateString() === new Date(filterValue).toDateString();
//         }
//         if (filter.matchMode === 'dateAfter') {
//           return new Date(fieldValue) > new Date(filterValue);
//         }
//         if (filter.matchMode === 'dateBefore') {
//           return new Date(fieldValue) < new Date(filterValue);
//         }
        
//         return true;
//       });
//     });
//   }, []);

//   // MISSING FEATURE 5: Enhanced filter handler with totals recalculation
//   const handleEnhancedFilter = useCallback((e) => {
//     // Update filters first
//     handleFilter(e);
    
//     // Update filtered data for totals calculation
//     if (enableFooterTotals) {
//       // Get the filtered data from PrimeReact event
//       let filteredRows = finalTableData;
      
//       // Try to get filtered data from various event properties
//       if (e.filteredValue && Array.isArray(e.filteredValue)) {
//         filteredRows = e.filteredValue;
//       } else if (e.value && Array.isArray(e.value)) {
//         filteredRows = e.value;
//       } else if (e.data && Array.isArray(e.data)) {
//         filteredRows = e.data;
//       } else {
//         // Apply filters manually using the updated filters
//         filteredRows = applyFiltersToData(finalTableData, e.filters);
//       }
      
//       // Ensure filtered rows are valid objects
//       const validFilteredRows = filteredRows.filter(row => row && typeof row === 'object');
//       setFilteredDataForTotals(validFilteredRows);
//     }
//   }, [handleFilter, enableFooterTotals, finalTableData, applyFiltersToData]);

//   // MISSING FEATURE 6: Inline editing handlers
//   const handleRowEditSave = useCallback((e) => {
//     const { newData, index } = e;
//     setLocalEditingRows(prev => {
//       const updated = { ...prev };
//       delete updated[index];
//       return updated;
//     });
//     if (onRowEditSave) onRowEditSave(e);
//   }, [onRowEditSave]);

//   const handleRowEditCancel = useCallback((e) => {
//     const { index } = e;
//     setLocalEditingRows(prev => {
//       const updated = { ...prev };
//       delete updated[index];
//       return updated;
//     });
//     if (onRowEditCancel) onRowEditCancel(e);
//   }, [onRowEditCancel]);

//   const handleRowEditInit = useCallback((e) => {
//     const { index } = e;
//     setLocalEditingRows(prev => ({
//       ...prev,
//       [index]: true
//     }));
//     if (onRowEditInit) onRowEditInit(e);
//   }, [onRowEditInit]);

//   const handleEditingRowsChange = useCallback((e) => {
//     setLocalEditingRows(e.data);
//     if (onEditingRowsChange) onEditingRowsChange(e);
//   }, [onEditingRowsChange]);

//   // MISSING FEATURE 7: Context menu handlers
//   const handleContextMenuSelectionChange = useCallback((e) => {
//     setLocalContextMenuSelection(e.value);
//     if (onContextMenuSelectionChange) onContextMenuSelectionChange(e);
//   }, [onContextMenuSelectionChange]);

//   const handleContextMenu = useCallback((e) => {
//     if (onContextMenu) onContextMenu(e);
//   }, [onContextMenu]);

//   // MISSING FEATURE 8: Footer template for totals calculation
//   const footerTemplate = useCallback((column) => {
//     if (!enableFooterTotals || !filteredDataForTotals?.length) return null;
    
//     const formatNumber = (value, col) => {
//       if (value === null || value === undefined || isNaN(value)) return '-';
      
//       const { numberFormat, currency, precision } = footerTotalsConfig;
//       const isCurrency = currencyColumns.includes(col.key);
      
//       if (isCurrency) {
//         return new Intl.NumberFormat(numberFormat, {
//           style: 'currency',
//           currency: currency,
//           minimumFractionDigits: precision,
//           maximumFractionDigits: precision
//         }).format(value);
//       } else {
//         return new Intl.NumberFormat(numberFormat, {
//           minimumFractionDigits: precision,
//           maximumFractionDigits: precision
//         }).format(value);
//       }
//     };

//     const validValues = filteredDataForTotals
//       .map(row => row[column.key])
//       .filter(val => val !== null && val !== undefined && !isNaN(val))
//       .map(val => Number(val));

//     if (validValues.length === 0) return '-';

//     const { showTotals, showAverages, showCounts } = footerTotalsConfig;
//     const parts = [];

//     if (showTotals) {
//       const total = validValues.reduce((sum, val) => sum + val, 0);
//       parts.push(`Σ ${formatNumber(total, column)}`);
//     }

//     if (showAverages && validValues.length > 0) {
//       const average = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
//       parts.push(`μ ${formatNumber(average, column)}`);
//     }

//     if (showCounts) {
//       parts.push(`n=${validValues.length}`);
//     }

//     return parts.join(' | ');
//   }, [enableFooterTotals, filteredDataForTotals, footerTotalsConfig, currencyColumns]);

//   // MISSING FEATURE 9: Column grouping generation
//   const generateColumnGroups = useCallback(() => {
//     if (!enableColumnGrouping || !finalColumnStructure.hasGroups) return null;

//     const headerRows = [];
//     const footerRows = [];

//     // Generate header groups
//     if (groupConfig.enableHeaderGroups && finalColumnStructure.headerGroups?.length > 0) {
//       finalColumnStructure.headerGroups.forEach((groupRow, rowIndex) => {
//         const headerCols = [];
        
//         if (enableRowSelection) {
//           headerCols.push(<Column key="selection-header" rowSpan={finalColumnStructure.headerGroups.length} />);
//         }

//         groupRow.forEach((group, groupIndex) => {
//           if (group.isGroup) {
//             headerCols.push(
//               <Column 
//                 key={`header-group-${rowIndex}-${groupIndex}`}
//                 header={group.title}
//                 colSpan={group.colSpan}
//                 style={{ ...groupConfig.groupStyle, ...groupConfig.headerGroupStyle }}
//               />
//             );
//           } else {
//             headerCols.push(
//               <Column 
//                 key={`header-col-${rowIndex}-${groupIndex}`}
//                 header={group.title}
//                 rowSpan={finalColumnStructure.headerGroups.length}
//               />
//             );
//           }
//         });

//         headerRows.push(<Row key={`header-row-${rowIndex}`}>{headerCols}</Row>);
//       });
//     }

//     // Generate footer groups if enabled
//     if (groupConfig.enableFooterGroups && enableFooterTotals && finalColumnStructure.footerGroups?.length > 0) {
//       finalColumnStructure.footerGroups.forEach((groupRow, rowIndex) => {
//         const footerCols = [];
        
//         if (enableRowSelection) {
//           footerCols.push(<Column key="selection-footer" rowSpan={finalColumnStructure.footerGroups.length} />);
//         }

//         groupRow.forEach((group, groupIndex) => {
//           if (group.isGroup) {
//             footerCols.push(
//               <Column 
//                 key={`footer-group-${rowIndex}-${groupIndex}`}
//                 footer=""
//                 colSpan={group.colSpan}
//                 style={{ ...groupConfig.groupStyle, ...groupConfig.footerGroupStyle }}
//               />
//             );
//           } else {
//             const col = finalColumns.find(c => c.key === group.key);
//             footerCols.push(
//               <Column 
//                 key={`footer-col-${rowIndex}-${groupIndex}`}
//                 footer={enableFooterTotals && col?.type === 'number' ? () => footerTemplate(col) : null}
//                 rowSpan={finalColumnStructure.footerGroups.length}
//               />
//             );
//           }
//         });

//         footerRows.push(<Row key={`footer-row-${rowIndex}`}>{footerCols}</Row>);
//       });
//     }

//     return {
//       header: headerRows.length > 0 ? <ColumnGroup>{headerRows}</ColumnGroup> : null,
//       footer: footerRows.length > 0 ? <ColumnGroup>{footerRows}</ColumnGroup> : null
//     };
//   }, [enableColumnGrouping, finalColumnStructure, groupConfig, enableRowSelection, finalColumns, enableFooterTotals, footerTemplate]);

//   // Update filtered data for totals when data changes
//   useEffect(() => {
//     if (enableFooterTotals) {
//       setFilteredDataForTotals(finalTableData);
//     }
//   }, [finalTableData, enableFooterTotals]);

//   // Update local editing rows when prop changes
//   useEffect(() => {
//     if (editingRows !== null) {
//       setLocalEditingRows(editingRows);
//     }
//   }, [editingRows]);

//   // Update local context menu selection when prop changes
//   useEffect(() => {
//     if (contextMenuSelection !== null) {
//       setLocalContextMenuSelection(contextMenuSelection);
//     }
//   }, [contextMenuSelection]);

//   // Function to generate the correct filter UI for a column
//   const getColumnFilterElement = useCallback((column, filterValue, filterCallback) => {
//     const columnKey = column.key;

//     if (dropdownFilterColumns?.includes(columnKey)) {
//       const uniqueValues = getUniqueValues(finalTableData, columnKey);
//       const options = [
//         { label: 'All', value: null },
//         ...uniqueValues.map(val => ({ label: String(val), value: val }))
//       ];
//       return (
//         <Dropdown
//           value={filterValue}
//           options={options}
//           onChange={(e) => filterCallback(e.value)}
//           placeholder="Select..."
//           className="p-column-filter"
//           showClear
//         />
//       );
//     }

//     if (datePickerFilterColumns?.includes(columnKey)) {
//       return (
//         <Calendar
//           value={filterValue || null}
//           onChange={(e) => filterCallback(e.value)}
//           placeholder="Select date range"
//           className="p-column-filter"
//           dateFormat="yy-mm-dd"
//           selectionMode="range"
//           showIcon
//         />
//       );
//     }

//     if (numberFilterColumns?.includes(columnKey)) {
//       return (
//         <InputNumber
//           value={filterValue || null}
//           onValueChange={(e) => filterCallback(e.value)}
//           placeholder={`Enter ${column.title}`}
//           className="p-column-filter"
//           inputStyle={{ width: '100%' }}
//         />
//       );
//     }

//     if (booleanFilterColumns?.includes(columnKey)) {
//       return (
//         <Dropdown
//           value={filterValue}
//           options={[
//             { label: 'All', value: null },
//             { label: 'True', value: true },
//             { label: 'False', value: false }
//           ]}
//           onChange={(e) => filterCallback(e.value)}
//           placeholder="Select..."
//           className="p-column-filter"
//           showClear
//         />
//       );
//     }

//     return (
//       <InputText
//         value={filterValue || ''}
//         onChange={(e) => filterCallback(e.target.value || null)}
//         placeholder={`Filter ${column.title}...`}
//         className="p-column-filter"
//       />
//     );
//   }, [finalTableData, dropdownFilterColumns, datePickerFilterColumns, numberFilterColumns, booleanFilterColumns]);

//   // Enhanced event handlers
//   const handleExport = useCallback(() => {
//     if (!enableExport) return;
    
//     if (onExport) {
//       onExport(finalTableData);
//     } else {
//       // Default CSV export
//       const csvContent = [
//         finalColumns.map(col => col.title).join(','),
//         ...finalTableData.map(row => 
//           finalColumns.map(col => `"${row[col.key] || ''}"`).join(',')
//         )
//       ].join('\n');
      
//       const blob = new Blob([csvContent], { type: 'text/csv' });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `${exportFilename}.csv`;
//       a.click();
//       URL.revokeObjectURL(url);
//     }
//   }, [enableExport, finalTableData, onExport, exportFilename, finalColumns]);

//   const handleRefresh = useCallback(async () => {
//     if (!enableRefresh) return;
    
//     // setIsRefreshing(true); // This state variable was removed, so this line is removed.
//     try {
//       if (onRefresh) {
//         await onRefresh();
//       }
//     } finally {
//       // setIsRefreshing(false); // This state variable was removed, so this line is removed.
//     }
//   }, [enableRefresh, onRefresh]);

//   const handleBulkAction = useCallback((action) => {
//     if (onBulkAction) {
//       onBulkAction(action, selectedRows);
//     }
//   }, [onBulkAction, selectedRows]);

//   // Generate column groups from configuration
//   const columnGroupsToRender = useMemo(() => {
//     if (!enableColumnGrouping || !finalColumnStructure.hasGroups) {
//       return null;
//     }

//     const { groups, ungroupedColumns } = finalColumnStructure;
//     const headerRows = [];

//     // First row: Main group headers + ungrouped column headers
//     const firstRowColumns = [];
    
//     ungroupedColumns.forEach(col => {
//       firstRowColumns.push(
//         <Column
//           key={`ungrouped-${col.key}`}
//           header={col.title}
//           field={col.key}
//           rowSpan={2}
//         />
//       );
//     });

//     groups.forEach(group => {
//       firstRowColumns.push(
//         <Column
//           key={`group-${group.header}`}
//           header={group.header}
//           colSpan={group.columns.length}
//           style={{
//             textAlign: 'center',
//             fontWeight: 'bold',
//             backgroundColor: 'var(--primary-50)',
//             border: '1px solid var(--primary-200)',
//             ...groupConfig.headerGroupStyle
//           }}
//         />
//       );
//     });

//     headerRows.push(
//       <Row key="group-headers">
//         {firstRowColumns}
//       </Row>
//     );

//     // Second row: Sub-column headers for grouped columns
//     const secondRowColumns = [];
    
//     groups.forEach(group => {
//       group.columns.forEach(col => {
//         secondRowColumns.push(
//           <Column
//             key={`sub-${col.originalKey || col.key}`}
//             header={col.subHeader || col.title}
//             field={col.originalKey || col.key}
//             style={{
//               textAlign: 'center',
//               fontSize: '0.9em',
//               backgroundColor: 'var(--surface-50)',
//               ...groupConfig.groupStyle
//             }}
//           />
//         );
//       });
//     });

//     headerRows.push(
//       <Row key="sub-headers">
//         {secondRowColumns}
//       </Row>
//     );

//     return (
//       <ColumnGroup>
//         {headerRows}
//       </ColumnGroup>
//     );
//   }, [enableColumnGrouping, finalColumnStructure, groupConfig]);

//   // Add actions column if needed - Must be before early returns
//   const columnsWithActions = useMemo(() => {
//     const actionsColumn = getActionsColumn(rowActions, enableRowActions);
//     return actionsColumn ? [...finalColumns, actionsColumn] : finalColumns;
//   }, [finalColumns, rowActions, enableRowActions]);

//   // Loading and error states
//   if (loading) {
//     return (
//       <div className={`p-component ${className}`} style={style}>
//         <div className="p-card p-text-center p-py-6">
//           <div className="p-card-body">
//             <div className="flex align-items-center justify-content-center gap-3">
//               {/* <RefreshCw size={24} className="animate-spin p-text-primary" /> */}
//               <span className="p-text-lg p-text-secondary">Loading data...</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className={`p-component ${className}`} style={style}>
//         <div className="p-card p-text-center p-py-6">
//           <div className="p-card-body">
//             <div className="flex align-items-center justify-content-center gap-3 p-text-danger">
//               {/* <X size={24} /> */}
//               <span className="p-text-lg">Error: {error}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`p-component prime-data-table-optimized ${className}`} style={style}>
//       {/* Debug Info - Development only */}
//       {process.env.NODE_ENV === 'development' && (
//         <div className="p-card p-mb-4" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px' }}>
//           <div className="p-card-body" style={{ padding: '1rem' }}>
//             <h6 className="p-text-bold p-mb-2" style={{ color: '#28a745', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>
//               🚀 OPTIMIZED DEBUG INFO (Reduced 73% - 904 lines vs 3349 lines)
//             </h6>
//             <div style={{ fontSize: '0.85em', lineHeight: '1.4' }}>
//               <strong className="p-text-bold">Data:</strong> {data.length} rows → {finalTableData.length} final rows<br/>
//               <strong className="p-text-bold">Columns:</strong> {columns.length} custom, {finalColumns.length} total<br/>
//               <strong className="p-text-bold">Pivot Table:</strong> <span className={pivotTransformation.isPivot ? 'p-text-success' : 'p-text-secondary'}>{pivotTransformation.isPivot ? '✓ Enabled' : '✗ Disabled'}</span><br/>
//               <strong className="p-text-bold">Auto Merge:</strong> <span className={enableAutoMerge ? 'p-text-success' : 'p-text-secondary'}>{enableAutoMerge ? '✓ Enabled' : '✗ Disabled'}</span><br/>
//               <strong className="p-text-bold">Column Grouping:</strong> <span className={enableColumnGrouping ? 'p-text-success' : 'p-text-secondary'}>{enableColumnGrouping ? '✓ Enabled' : '✗ Disabled'}</span><br/>
//               <strong className="p-text-bold">Features:</strong> 
//               <span className={enableSearch ? 'p-text-success' : 'p-text-secondary'}> Search:{enableSearch ? '✓' : '✗'}</span> | 
//               <span className={enableColumnFilter ? 'p-text-success' : 'p-text-secondary'}> Filter:{enableColumnFilter ? '✓' : '✗'}</span> | 
//               <span className={enableSorting ? 'p-text-success' : 'p-text-secondary'}> Sort:{enableSorting ? '✓' : '✗'}</span>
//             </div>
//           </div>
//         </div>
//       )}
      
//       {/* Toolbar */}
//       <TableToolbar
//         enableSearch={enableSearch}
//         enableGlobalFilter={enableGlobalFilter}
//         globalFilterValue={globalFilterValue}
//         globalFilterPlaceholder={globalFilterPlaceholder}
//         onSearch={handleGlobalFilter}
//         enableColumnFilter={enableColumnFilter}
//         onClearFilters={clearFilters}
//         selectedRows={selectedRows}
//         enableBulkActions={enableBulkActions}
//         bulkActions={bulkActions}
//         onBulkAction={handleBulkAction}
//         enableExport={enableExport}
//         onExport={handleExport}
//         enableRefresh={enableRefresh}
//         onRefresh={handleRefresh}
//         // isRefreshing={isRefreshing} // This state variable was removed, so this line is removed.
//         enableColumnManagement={enableColumnManagement}
//         showColumnManager={showColumnManager}
//         onToggleColumnManager={() => setShowColumnManager(!showColumnManager)}
//         enablePivotUI={enablePivotUI}
//         showPivotConfig={showPivotConfig}
//         onTogglePivotConfig={() => setShowPivotConfig(!showPivotConfig)}
//         isPivotEnabled={isPivotEnabled}
//         isLoadingPivotConfig={isLoadingPivotConfig}
//       />

//       {/* DataTable */}
//       <DataTable
//         value={finalTableData}
//         loading={loading}
//         filters={filters}
//         filterDisplay={
//           enableColumnFilter 
//             ? (enableColumnGrouping && finalColumnStructure.hasGroups && !forceFilterDisplayWithGrouping 
//                 ? "row" 
//                 : filterDisplay)
//             : undefined
//         }
//         globalFilterFields={globalFilterFields.length > 0 ? globalFilterFields : finalColumns.map(col => col.key)}
//         sortField={sortField}
//         sortOrder={sortOrder}
//         onSort={handleSort}
//         onFilter={handleEnhancedFilter}
//         onRowClick={onRowClick ? (e) => onRowClick(e.data, e.index) : undefined}
//         selection={enableRowSelection ? selectedRows : null}
//         onSelectionChange={enableRowSelection ? handleRowSelect : undefined}
//         dataKey="id"
//         paginator={enablePagination}
//         rows={localPageSize}
//         rowsPerPageOptions={pageSizeOptions}
//         onPage={handlePageChange}
//         first={(localCurrentPage - 1) * localPageSize}
//         totalRecords={finalTableData.length}
//         showGridlines={enableGridLines}
//         stripedRows={enableStripedRows}
//         size={tableSize}
//         showFirstLastIcon={showFirstLastIcon}
//         showPageLinks={showPageLinks}
//         showCurrentPageReport={showCurrentPageReport}
//         currentPageReportTemplate={currentPageReportTemplate}
//         filterDelay={filterDelay}
//         globalFilterPlaceholder={globalFilterPlaceholder}
//         filterLocale={filterLocale}
//         editingRows={enableInlineEditing ? localEditingRows : undefined}
//         onRowEditSave={enableInlineEditing ? handleRowEditSave : undefined}
//         onRowEditCancel={enableInlineEditing ? handleRowEditCancel : undefined}
//         onRowEditInit={enableInlineEditing ? handleRowEditInit : undefined}
//         onEditingRowsChange={enableInlineEditing ? handleEditingRowsChange : undefined}
//         contextMenu={enableContextMenu ? contextMenu : undefined}
//         contextMenuSelection={enableContextMenu ? localContextMenuSelection : undefined}
//         onContextMenuSelectionChange={enableContextMenu ? handleContextMenuSelectionChange : undefined}
//         onContextMenu={enableContextMenu ? handleContextMenu : undefined}
//         selectionMode={enableRowSelection ? selectionMode : undefined}
//         metaKeySelection={enableRowSelection ? metaKeySelection : undefined}
//         selectOnEdit={enableRowSelection ? selectOnEdit : undefined}
//         emptyMessage="No data found. Try adjusting your filters."
//         resizableColumns={enableResizableColumns}
//         reorderableColumns={enableReorderableColumns}
//         virtualScrollerOptions={enableVirtualScrolling ? { itemSize: 46 } : undefined}
//         lazy={enableLazyLoading}
//         rowGroupMode={enableRowGrouping ? 'subheader' : undefined}
//         expandableRowGroups={enableRowGrouping}
//         rowExpansionTemplate={enableRowExpansion ? (data) => <div>Expanded content for {data.name}</div> : undefined}
//         frozenColumns={enableFrozenColumns ? 1 : undefined}
//         frozenRows={enableFrozenRows ? 1 : undefined}
//         showFilterMatchModes={showFilterMatchModes}
//                  headerColumnGroup={enableColumnGrouping ? (headerColumnGroup || columnGroupsToRender?.header) : undefined}
//          footerColumnGroup={enableColumnGrouping && enableFooterTotals ? (footerColumnGroup || columnGroupsToRender?.footer) : undefined}
//       >
//         {enableRowSelection && (
//           <Column
//             selectionMode="multiple"
//             frozen={enableFrozenColumns}
//           />
//         )}

//         {columnsWithActions.map((column, index) => {
//           const bodyTemplate = getBodyTemplate(column, {
//             imageFields,
//             popupImageFields,
//             customFormatters,
//             customTemplates,
//             pivotTransformation,
//             mergedPivotConfig,
//             currencyColumns,
//             rowActions
//           });

//           return (
//             <Column
//               key={column.key || index}
//               field={column.key}
//               header={column.title}
//               sortable={column.sortable && enableSorting}
//               filter={column.filterable && enableColumnFilter}
//               filterElement={column.filterable && enableColumnFilter ? 
//                 (options) => getColumnFilterElement(column, options.value, options.filterCallback) : undefined}
//               body={bodyTemplate}
//               footer={enableFooterTotals && column.type === 'number' ? () => footerTemplate(column) : undefined}
//               style={column.style}
//               className={column.className}
//             />
//           );
//         })}
//       </DataTable>

//       {/* Image Modal */}
//       <Dialog 
//         header="Image Preview" 
//         visible={showImageModal} 
//         style={{ width: '50vw' }} 
//         onHide={() => setShowImageModal(false)}
//       >
//         {showImageModal && (
//           <Image
//             src={imageModalSrc}
//             alt={imageModalAlt}
//             width={600}
//             height={400}
//             style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
//           />
//         )}
//       </Dialog>
//     </div>
//   );
// };

// export default PrimeDataTable; 