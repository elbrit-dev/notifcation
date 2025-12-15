import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
const DataTable = dynamic(() => import('primereact/datatable').then(m => m.DataTable), { ssr: false });
const Column = dynamic(() => import('primereact/column').then(m => m.Column), { ssr: false });
const ColumnGroup = dynamic(() => import('primereact/columngroup').then(m => m.ColumnGroup), { ssr: false });
const Row = dynamic(() => import('primereact/row').then(m => m.Row), { ssr: false });
const InputText = dynamic(() => import('primereact/inputtext').then(m => m.InputText), { ssr: false });
const Button = dynamic(() => import('primereact/button').then(m => m.Button), { ssr: false });
const Checkbox = dynamic(() => import('primereact/checkbox').then(m => m.Checkbox), { ssr: false });
const Dialog = dynamic(() => import('primereact/dialog').then(m => m.Dialog), { ssr: false });
const Toolbar = dynamic(() => import('primereact/toolbar').then(m => m.Toolbar), { ssr: false });
import { FilterMatchMode, FilterOperator } from 'primereact/api';
const IconField = dynamic(() => import('primereact/iconfield').then(m => m.IconField), { ssr: false });
const InputIcon = dynamic(() => import('primereact/inputicon').then(m => m.InputIcon), { ssr: false });
const ContextMenu = dynamic(() => import('primereact/contextmenu').then(m => m.ContextMenu), { ssr: false });
const Dropdown = dynamic(() => import('primereact/dropdown').then(m => m.Dropdown), { ssr: false });
const Calendar = dynamic(() => import('primereact/calendar').then(m => m.Calendar), { ssr: false });
const InputNumber = dynamic(() => import('primereact/inputnumber').then(m => m.InputNumber), { ssr: false });
const Paginator = dynamic(() => import('primereact/paginator').then(m => m.Paginator), { ssr: false });
import { classNames } from 'primereact/utils';
import Image from 'next/image';

// Import utility functions
import { usePlasmicCMS, defaultSaveToCMS, defaultLoadFromCMS } from './utils/cmsUtils';
import { mergeData, needsMerging, processData, getUniqueValues, getDataSize } from './utils/dataUtils';
import { transformToPivotData, generatePivotColumns, groupDataBy, parsePivotFieldName } from './utils/pivotUtils';
import { useROICalculation, calculateFooterTotals, formatFooterNumber, isNumericColumn } from './utils/calculationUtils';
import { formatCalculatedValue } from './utils/calculatedFieldsUtils';
import { getColumnType, applyFiltersToData, createClearAllFilters, safeFilterCallback, matchFilterValue, getFilterOptions, getColumnFilterElement } from './utils/filterUtils';
import { detectGroupKeywords, processFinalColumnStructure, generateDefaultColumns, createColumnGroups } from './utils/columnUtils';
import { 
  createImageBodyTemplate, 
  dateBodyTemplate, 
  numberBodyTemplate, 
  booleanBodyTemplate,
  createROIBodyTemplate,
  createPivotValueBodyTemplate,
  pivotRowBodyTemplate,
  createActionsBodyTemplate,
  createFilterClearTemplate,
  createFilterApplyTemplate,
  createFilterFooterTemplate,
  createFooterTemplate,
  createLeftToolbarTemplate,
  createRightToolbarTemplate,
  createFilterElement
} from './utils/templateUtils';

// Import additional extracted functions
import { createEventHandlers } from './utils/eventHandlers';
import { createPivotConfigHandlers } from './utils/pivotConfigUtils';
import { createColumnGroupingHandlers } from './utils/columnGroupingUtils';
// Row expansion is now handled automatically within the component
import CalculatedFieldsManager from './CalculatedFieldsManager';

// ✅ Row expansion helpers
import {
  createRowExpansionConfig,
  generateAutoDetectedExpansionTemplate
} from './utils/rowExpansionUtils';

// HIBERNATION FIX: Production-safe console wrapper
const safeConsole = {
  log: process.env.NODE_ENV === 'development' ? console.log : () => {},
  warn: console.warn, // Keep warnings in production
  error: console.error, // Keep errors in production
  info: process.env.NODE_ENV === 'development' ? console.info : () => {}
};

// ---- SAFETY: never render raw objects/arrays in a cell ----
const safeCell = (val) => {
  if (val == null) return '';
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return String(val);

  // Arrays
  if (Array.isArray(val)) {
    // If it's an array of objects (e.g., invoices), show a friendly summary instead of the raw array
    const first = val[0];
    const looksLikeObjects = first && typeof first === 'object' && !Array.isArray(first);
    return looksLikeObjects ? `${val.length} item(s)` : val.join(', ');
  }

  // Plain objects → short preview (do NOT return the object itself)
  try {
    // Keep it short so the grid stays clean
    const s = JSON.stringify(val);
    return s.length > 120 ? s.slice(0, 117) + '...' : s;
  } catch {
    return '[object]';
  }
};


import {
  RefreshCw,
  X,
  Calendar as CalendarIcon
} from "lucide-react";

import { useAuth } from './AuthContext';

// NEW: Direct Plasmic CMS integration functions
// CMS integration moved to utils/cmsUtils.js

// Data processing functions moved to utils/dataUtils.js

// Helper functions moved to utils/dataUtils.js

// Column helper functions moved to utils/dataUtils.js

// Pivot table functions moved to utils/pivotUtils.js

// Group data functions moved to utils/pivotUtils.js

// Large pivot transformation functions moved to utils/pivotUtils.js

// Generate pivot columns function moved to utils/pivotUtils.js

/**
 * PrimeDataTable Component with Configurable Column Filters, Pivot Table Support, and Auto-Merge
 *
 * Auto-Merge Configuration:
 * - enableAutoMerge: Boolean to enable automatic data merging for object with arrays
 * - mergeConfig: Object with merge configuration
 *   Example: {
 *     by: ["drCode", "date"], // Fields to merge by
 *     preserve: ["drName", "salesTeam"], // Fields to preserve across merges
 *     autoDetectMergeFields: true, // Auto-detect common fields for merging
 *     mergeStrategy: "combine" // "combine" or "replace"
 *   }
 *
 * Filter Configuration Props:
 * - dropdownFilterColumns: Array of column keys that should use dropdown filters
 *   Example: ["salesteam", "status", "category"]
 *
 * - datePickerFilterColumns: Array of column keys that should use date picker filters
 *   Example: ["createdDate", "updatedDate", "dueDate"]
 *
 * - numberFilterColumns: Array of column keys that should use number filters
 *   Example: ["amount", "quantity", "price"]
 *
 * - textFilterColumns: Array of column keys that should use text filters
 *   Example: ["name", "description", "notes"]
 *
 * - booleanFilterColumns: Array of column keys that should use boolean filters
 *   Example: ["isActive", "isCompleted", "isPublished"]
 *
 * - customFilterOptions: Object with column keys as keys and array of options as values
 *   Example: {
 *     "salesteam": [
 *       { label: "All", value: null },
 *       { label: "Team A", value: "team_a" },
 *       { label: "Team B", value: "team_b" }
 *     ]
 *   }
 *
 * Pivot Table Configuration:
 * - enablePivotTable: Boolean to enable pivot table functionality
 * - pivotConfig: Object with pivot configuration
 *   Example: {
 *     enabled: true,
 *     rows: ["drName", "salesTeam"], // Row grouping fields
 *     columns: ["date"], // Column grouping fields  
 *     values: [
 *       { field: "serviceAmount", aggregation: "sum" },
 *       { field: "supportValue", aggregation: "sum" }
 *     ],
 *     showGrandTotals: true,
 *     showRowTotals: true
 *   }
 *
 * Usage Examples:
 * 
 * Basic Table:
 * <PrimeDataTable
 *   data={salesData}
 *   dropdownFilterColumns={["salesteam", "status"]}
 *   datePickerFilterColumns={["createdDate"]}
 *   numberFilterColumns={["amount"]}
 * />
 *
 * Auto-Merge with Column Grouping:
 * <PrimeDataTable
 *   data={$queries.serviceVsSupport.data.response.data} // {service: [...], support: [...]}
 *   enableAutoMerge={true}
 *   enableColumnGrouping={true}
 *   enableAutoColumnGrouping={true}
 *   mergeConfig={{
 *     by: ["drCode", "date"], // Merge by doctor code and date
 *     preserve: ["drName", "salesTeam"], // Preserve these fields
 *     autoDetectMergeFields: true
 *   }}
 *   groupConfig={{
 *     customGroupMappings: {
 *       service: "Service",
 *       support: "Support"
 *     },
 *     ungroupedColumns: ["drCode", "drName", "salesTeam", "date"]
 *   }}
 * />
 *
 * Pivot Table:
 * <PrimeDataTable
 *   data={salesData}
 *   enablePivotTable={true}
 *   pivotConfig={{
 *     enabled: true,
 *     rows: ["drName", "salesTeam"],
 *     columns: ["date"],
 *     values: [
 *       { field: "serviceAmount", aggregation: "sum" },
 *       { field: "supportValue", aggregation: "average" }
 *     ],
 *     showGrandTotals: true,
 *     showRowTotals: true,
 *     fieldSeparator: "__", // For parsing "2025-04-01__serviceAmount" style fields
 *     numberFormat: "en-US",
 *     currency: "USD"
 *   }}
 * />
 *
 *   currencyColumns={["serviceAmount", "supportValue"]}
 * />
 *
 * Row Expansion:
 * <PrimeDataTable
 *   data={productsWithOrders}
 *   enableRowExpansion={true}
 *   rowExpansionTemplate={(data) => (
 *     <div className="p-3">
 *       <h5>Orders for {data.name}</h5>
 *       <DataTable value={data.orders}>
 *         <Column field="id" header="Order ID" sortable />
 *         <Column field="customer" header="Customer" sortable />
 *         <Column field="amount" header="Amount" sortable />
 *         <Column field="status" header="Status" sortable />
 *       </DataTable>
 *     </div>
 *   )}
 *   allowExpansion={(rowData) => rowData.orders.length > 0}
 *   showExpandAllButtons={true}
 *   expandAllLabel="Expand All Products"
 *   collapseAllLabel="Collapse All Products"
 * />
 *
 * Native Mobile Responsive (PrimeReact):
 * <PrimeDataTable
 *   data={salesData}
 *   responsiveLayout="reflow"  // "scroll" | "reflow" | "stack"
 *   tableSize="small"         // "small" | "normal" | "large"
 * />
 * 
 * For individual column responsive priority:
 * const columns = [
 *   { field: 'name', header: 'Name', responsivePriority: 1 },
 *   { field: 'email', header: 'Email', responsivePriority: 2 },
 *   { field: 'phone', header: 'Phone', responsivePriority: 3 }
 * ];
 */

const PrimeDataTable = ({
  // Data props
  data = [],
  columns = [],
  loading = false,
  error = null,
  fields = [],
  imageFields = [],
  popupImageFields = [],
  currencyColumns = [], // Array of column keys that should be formatted as currency in footer totals
  
  // Merge configuration (auto-merge only)
  enableMerge = false, // Enable automatic data merging for objects with arrays
  
  // Filter configuration props
  dropdownFilterColumns = [], // Array of column keys that should use dropdown filters
  datePickerFilterColumns = [], // Array of column keys that should use date picker filters
  numberFilterColumns = [], // Array of column keys that should use number filters
  textFilterColumns = [], // Array of column keys that should use text filters
  booleanFilterColumns = [], // Array of column keys that should use boolean filters
  customFilterOptions = {}, // Object with column keys as keys and array of options as values
  
  // GraphQL props
  graphqlQuery = null,
  graphqlVariables = {},
  onGraphqlData,
  refetchInterval = 0,
  
  // Table configuration - All features are now toggleable
  enableSearch = false,
  enableColumnFilter = false,
  enableSorting = false,
  enablePagination = false,
  enableRowSelection = false,
  enableExport = false,
  enableRefresh = false,
  enableColumnManagement = false,
  enableBulkActions = false,
  enableGlobalFilter = false,
  enableFilterMenu = false,
  enableFilterMatchModes = false,
  enableFilterClear = false,
  enableFilterApply = false,
  enableFilterFooter = false,
  enableGridLines = false,
  enableStripedRows = false,
  enableHoverEffect = false,
  enableResizableColumns = false,
  enableReorderableColumns = false,
  enableVirtualScrolling = false,
  enableLazyLoading = false,
  enableRowGrouping = false,
  enableFrozenColumns = false,
  enableFrozenRows = false,
  // NEW: Row Expansion Props
  enableRowExpansion = false,
  dataKey = null, // Manual dataKey override (highest priority). If null, we auto-detect.
  expandedRows = null,
  onRowToggle = null,
  onRowExpand = null,
  onRowCollapse = null,
  rowExpansionTemplate = null,
  allowExpansion = null,
  validateExpansion = null,
  expansionColumnStyle = { width: '5rem' },
  expansionColumnWidth = '5rem',
  expansionColumnHeader = null,
  expansionColumnBody = null,
  expansionColumnPosition = 'left',
  showExpandAllButtons = true,
  expandAllLabel = "Expand All",
  collapseAllLabel = "Collapse All",
  expansionButtonStyle = {},
  expansionButtonClassName = "",
  expandIcon = "pi pi-plus",
  collapseIcon = "pi pi-minus",
  enableExpansionAnimation = true,
  nestedDataConfig = {
    enableNestedSorting: true,
    enableNestedFiltering: true,
    enableNestedPagination: false,
    nestedPageSize: 10
  },

  // NEW: Variant/layout controls
  tableVariant = "default", // "default" | "register"
  showRowNumbers = false, // Force show row numbers regardless of variant
  rowNumberColumnHeader = "No.",
  rowNumberColumnWidth = '4rem',
  // Native PrimeReact editing props
  editMode = null, // "cell" | "row" for PrimeReact native editing
  editableColumns = [], // Array of column keys that should be editable (auto-handles editors)
  useCustomRowEditor = false, // If true and editMode="row", opens custom dialog instead of native inline editing
  
  // Layout/View Mode props
  viewMode = "table", // "table" | "cards" | "form" - Different layout presentations
  
  // Toolbar Size Control Props
  toolbarSize = "normal", // "small" | "normal" | "large" - Controls overall toolbar size
  leftToolbarSize = "normal", // "small" | "normal" | "large" - Overrides toolbarSize for left section
  rightToolbarSize = "normal", // "small" | "normal" | "large" - Overrides toolbarSize for right section
  
  // Toolbar Control Props for Card/Form Views
  enableToolbarInCardForm = false, // If true, shows full toolbar in card/form modes (disabled by default)
  
  // Row Actions
  onRowDelete = null, // Callback for row delete action
  
  // Pagination
  pageSize = 10,
  currentPage = 1,
  pageSizeOptions = [5, 10, 25, 50, 100],
  
  // Styling
  className = "",
  style = {},


  tableSize = "normal", // small, normal, large

  // PrimeReact native responsive props
  responsiveLayout = "scroll", // "scroll" | "reflow" | "stack" - Native PrimeReact responsive behavior

  // Event handlers
  onRowClick,
  onRowSelect,
  onExport,
  onRefresh,
  onPageChange,
  onFilterChange,
  onSortChange,
  onSearch,
  onBulkAction,
  
  // Action buttons
  rowActions = [],
  bulkActions = [],
  enableRowActions = false,
  
  // Advanced filter options
  filterDisplay = "menu", // menu, row
  forceFilterDisplayWithGrouping = false, // Force specific filterDisplay mode even with grouping
  globalFilterFields = [],
  showFilterMatchModes = true,
  filterDelay = 300,
  globalFilterPlaceholder = "Search...",
  filterLocale = "en",
  
  // NEW: Filter mode toggle (native row filters vs custom row filters)
  enableFilterModeToggle = false,
  defaultFilterMode = 'native', // 'native' | 'custom'
  customRowFilterColumns = [], // keys to show in custom row filter when enabled
  
  // Native PrimeReact editing callbacks
  editingRows = null,
  onRowEditSave = null,
  onRowEditCancel = null,
  onRowEditInit = null,
  onEditingRowsChange = null,
  
  // Context menu
  enableContextMenu = false,
  contextMenu = null,
  contextMenuSelection = null,
  onContextMenuSelectionChange = null,
  onContextMenu = null,
  
  // Advanced pagination
  showFirstLastIcon = true,
  showPageLinks = true,
  showCurrentPageReport = true,
  currentPageReportTemplate = "Showing {first} to {last} of {totalRecords} entries",
  
  // Advanced export
  exportFilename = "data",
  exportFileType = "csv", // csv, excel, pdf
  enableExcelExport = false,
  enablePdfExport = false,
  exportExpandedData = false, // Include expanded nested data in export
  exportNestedAsColumns = false, // Flatten nested objects as separate columns
  
  // Advanced selection
  selectionMode = "multiple", // single, multiple, checkbox
  metaKeySelection = true,
  selectOnEdit = false,
  
  // Custom templates
  customTemplates = {},
  customFormatters = {},
  
  // Column grouping props
  enableColumnGrouping = false,
  enableAutoColumnGrouping = false, // New: Auto-detect column groups from data
  headerColumnGroup = null,
  footerColumnGroup = null,
  columnGroups = [],
  groupConfig = {
    enableHeaderGroups: true,
    enableFooterGroups: true,
    groupStyle: {},
    headerGroupStyle: {},
    footerGroupStyle: {},
    groupingPatterns: [], // Custom patterns for grouping
    ungroupedColumns: [], // Columns that should not be grouped
    totalColumns: [], // Columns that represent totals
    groupSeparator: '__', // Default separator for detecting groups
    customGroupMappings: {} // Custom word to group name mappings e.g., { "inventory": "Inventory", "warehouse": "Warehouse" }
  },

  // Performance: gate heavy table until visible
  deferRenderUntilVisible = true,
  deferHydrationMs = 0,
  minPlaceholderHeight = '320px',
  
  // Footer totals props
  enableFooterTotals = false,
  enableFixedFooterTotals = false, // NEW: Always show footer totals at bottom, even with pivot
  footerTotalsConfig = {
    showTotals: true,
    showAverages: false,
    showCounts: true,
    numberFormat: 'en-US',
    currency: 'USD',
    precision: 2
  },
  
  // NEW: ROI Calculation Props
  enableROICalculation = false, // Enable ROI calculation feature
  roiConfig = {
    // ROI calculation fields
    revenueField: 'revenue', // Field name for revenue data
    costField: 'cost', // Field name for cost data
    investmentField: 'investment', // Field name for investment data
    profitField: 'profit', // Field name for profit data (optional, will be calculated if not provided)
    
    // ROI calculation formula: ROI = ((Revenue - Cost) / Investment) * 100
    // Alternative: ROI = (Profit / Investment) * 100
    calculationMethod: 'standard', // 'standard' (revenue-cost/investment) or 'profit' (profit/investment)
    
    // Display options
    showROIColumn: true, // Show ROI as a separate column
    showROIAsPercentage: true, // Display ROI as percentage
    roiColumnTitle: 'ROI (%)', // Title for ROI column
    roiColumnKey: 'roi', // Key for ROI column in data
    
    // Formatting options
    roiNumberFormat: 'en-US',
    roiPrecision: 2, // Decimal places for ROI
    roiCurrency: 'USD',
    
    // Color coding for ROI values
    enableROIColorCoding: true,
    roiColorThresholds: {
      positive: '#22c55e', // Green for positive ROI
      neutral: '#6b7280', // Gray for neutral ROI
      negative: '#ef4444' // Red for negative ROI
    },
    
    // Thresholds for color coding
    positiveROIThreshold: 0, // Values >= this are positive
    negativeROIThreshold: 0, // Values < this are negative
    
    // Custom ROI calculation function (optional)
    customROICalculation: null, // Custom function for ROI calculation
  },
  
  // NEW: Total display preference - controls which type of totals to show
  totalDisplayMode = "none", // minimal default: no totals
  
  // Pivot Table Props - Excel-like pivot functionality  
  enablePivotTable = false,
  
  // NEW: Pivot UI Configuration Props
  enablePivotUI = false, // minimal default: off
  pivotUIPosition = "toolbar", // "toolbar", "panel", "sidebar"
  
  // NEW: CMS Persistence Props
  enablePivotPersistence = false, // minimal default: off
  pivotConfigKey = "", // empty by default; set when you want persistence
  onSavePivotConfig = null, // Callback to save config to CMS (deprecated - use direct integration)
  onLoadPivotConfig = null, // Callback to load config from CMS (deprecated - use direct integration)
  autoSavePivotConfig = false, // Auto-save changes to CMS (disabled by default for explicit control)
  
  // NEW: Direct Plasmic CMS Integration Props
  plasmicWorkspaceId = null, // Plasmic workspace ID for CMS integration
  plasmicTableConfigsId = null, // TableConfigs table ID for CMS integration
  plasmicApiToken = null, // Plasmic API token for direct CMS integration
  useDirectCMSIntegration = true, // Use direct CMS integration instead of callback props
  
  // Individual pivot props for Plasmic interface
  pivotRows = [],
  pivotColumns = [],
  pivotValues = [],
  pivotFilters = [],
  pivotShowGrandTotals = true,
  pivotShowRowTotals = true,
  pivotShowColumnTotals = true,
  pivotShowSubTotals = true,
  pivotNumberFormat = "en-US",
  pivotCurrency = "USD",
  pivotPrecision = 2,
  pivotFieldSeparator = "__",
  pivotSortRows = true,
  pivotSortColumns = true,
  pivotSortDirection = "asc",
  pivotAggregationFunctions = {},
  
  // Combined pivot config object (alternative to individual props)
  pivotConfig = {
    enabled: false,
    rows: [], // Array of field names to use as row grouping (like Excel's "Rows" area)
    columns: [], // Array of field names to use as column headers (like Excel's "Columns" area)  
    values: [], // Array of objects with field name and aggregation function (like Excel's "Values" area)
    filters: [], // Array of field names to use as pivot filters (like Excel's "Filters" area)
    calculatedFields: [], // Array of calculated field objects
    
    // Aggregation functions
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
    },
    
    // Display options
    showGrandTotals: true,
    showSubTotals: true,
    showRowTotals: true,
    showColumnTotals: true,
    
    // Formatting options
    numberFormat: 'en-US',
    currency: 'USD',
    precision: 2,
    
    // Data parsing options for complex field names like "2025-04-01__serviceAmount"
    fieldSeparator: '__', // Separator used in field names to split date/category and metric
    dateFieldPattern: /^\d{4}-\d{2}-\d{2}$/, // Pattern to identify date fields
    
    // Custom field parsing functions
    parseFieldName: null, // Custom function to parse complex field names
    formatFieldName: null, // Custom function to format field names for display
    
    // Grouping options
    sortRows: true,
    sortColumns: true,
    sortDirection: 'asc' // 'asc' or 'desc'
  }
}) => {
  // Defer mount until visible to reduce TBT on initial load
  const rootRef = useRef(null);
  const [isVisible, setIsVisible] = useState(!deferRenderUntilVisible);

  useEffect(() => {
    if (!deferRenderUntilVisible) return;
    if (!rootRef.current) return;
    let observer;
    const node = rootRef.current;
    const onIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (deferHydrationMs > 0) {
            setTimeout(() => setIsVisible(true), deferHydrationMs);
          } else {
            setIsVisible(true);
          }
          observer && observer.disconnect();
        }
      });
    };
    observer = new IntersectionObserver(onIntersect, { rootMargin: '200px 0px' });
    observer.observe(node);
    return () => observer && observer.disconnect();
  }, [deferRenderUntilVisible, deferHydrationMs]);
  // Local state
  const [selectedRows, setSelectedRows] = useState([]);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [localCurrentPage, setLocalCurrentPage] = useState(currentPage);
  const [localPageSize, setLocalPageSize] = useState(pageSize);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [columnOrder, setColumnOrder] = useState([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalSrc, setImageModalSrc] = useState("");
  const [imageModalAlt, setImageModalAlt] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(1);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  
  // NEW: Filter mode (native vs custom) and custom row filters state
  const [filterMode, setFilterMode] = useState(defaultFilterMode);
  const [customRowFilters, setCustomRowFilters] = useState({});
  
  // NEW: Local expansion state for row expansion
  const [localExpandedRows, setLocalExpandedRows] = useState(expandedRows || {});
  
  // Common filter state for column grouping
  const [commonFilterField, setCommonFilterField] = useState('');
  const [commonFilterValue, setCommonFilterValue] = useState('');
  
  // Inline editing state
  const [localEditingRows, setLocalEditingRows] = useState(editingRows || {});
  
  // Custom row editor dialog state
  const [showCustomRowEditor, setShowCustomRowEditor] = useState(false);
    const [customRowEditData, setCustomRowEditData] = useState(null);
    const [originalRowData, setOriginalRowData] = useState(null);
    
    // State for card view editing
    const [editingCards, setEditingCards] = useState(new Set());
  
  // Context menu state
  const [localContextMenuSelection, setLocalContextMenuSelection] = useState(contextMenuSelection || null);
  const contextMenuRef = useRef(null);

  // GraphQL data state
  const [graphqlData, setGraphqlData] = useState([]);
  const [graphqlLoading, setGraphqlLoading] = useState(false);
  const [graphqlError, setGraphqlError] = useState(null);

  // Pivot table state
  const [pivotDataCache, setPivotDataCache] = useState(null);
  const [pivotColumnsCache, setPivotColumnsCache] = useState([]);
  
  // NEW: Pivot UI Configuration State
  const [showPivotConfig, setShowPivotConfig] = useState(false);
  const [localPivotConfig, setLocalPivotConfig] = useState({
    enabled: enablePivotTable,
    rows: [],
    columns: [],
    values: [],
    filters: [],
    metaAggregations: [],
    calculatedFields: [],
    showGrandTotals: true,
    showRowTotals: true,
    showColumnTotals: true,
    showSubTotals: true
  });
  
  // NEW: CMS Persistence State
  const [isLoadingPivotConfig, setIsLoadingPivotConfig] = useState(false);
  const [isSavingPivotConfig, setIsSavingPivotConfig] = useState(false);
  const [pivotConfigLoaded, setPivotConfigLoaded] = useState(false);

  // HYDRATION FIX: State to store filtered data for footer totals with safe initialization
  const [filteredDataForTotals, setFilteredDataForTotals] = useState([]);
  
  // NEW: State to store filtered data for grand total calculations
  const [filteredDataForGrandTotal, setFilteredDataForGrandTotal] = useState([]);

  

  // Get user from AuthContext
  const { user } = useAuth();

  // NEW: Direct Plasmic CMS Integration
  const { saveToCMS: directSaveToCMS, loadFromCMS: directLoadFromCMS, listConfigurationsFromCMS, isAdminUser } = usePlasmicCMS(
    plasmicWorkspaceId || process.env.PLASMIC_WORKSPACE_ID || 'uP7RbyUnivSX75FTKL9RLp',
    plasmicTableConfigsId || process.env.PLASMIC_TABLE_CONFIGS_ID || 'o4o5VRFTDgHHmQ31fCfkuz',
    plasmicApiToken || process.env.PLASMIC_API_TOKEN,
    user
  );



  // NEW: Variant helpers
  const isRegisterVariant = useMemo(() => tableVariant === 'register', [tableVariant]);
  const shouldShowRowNumbers = useMemo(
    () => isRegisterVariant || showRowNumbers,
    [isRegisterVariant, showRowNumbers]
  );

  // ROI calculation functions moved to utils/calculationUtils.js
  const { calculateROI, getROIColor, formatROIValue } = useROICalculation(enableROICalculation, roiConfig);

  // Default CMS functions moved to utils/cmsUtils.js - using imported functions

  // Choose between direct CMS integration, callback props, or built-in defaults
  const finalSaveToCMS = useDirectCMSIntegration && directSaveToCMS 
    ? directSaveToCMS 
    : (onSavePivotConfig || defaultSaveToCMS);
  
  const finalLoadFromCMS = useDirectCMSIntegration && directLoadFromCMS 
    ? directLoadFromCMS 
    : (onLoadPivotConfig || defaultLoadFromCMS);

  // Load pivot configuration from CMS on component mount
  useEffect(() => {
    const loadPivotConfig = async () => {
      if (!enablePivotPersistence || !finalLoadFromCMS || pivotConfigLoaded || !pivotConfigKey) return;
      
      setIsLoadingPivotConfig(true);
      try {
        const savedConfig = await finalLoadFromCMS(pivotConfigKey);
        
        if (savedConfig && typeof savedConfig === 'object') {
          
          // Update local pivot config first
          setLocalPivotConfig(prev => ({
            ...prev,
            ...savedConfig
          }));
          
          // If config was enabled, ensure pivot is enabled and force refresh
          if (savedConfig.enabled) {
            // Use setTimeout to ensure state updates are processed
            setTimeout(() => {
              setIsPivotEnabled(true);
            }, 100);
          }
        }
      } catch (error) {
      } finally {
        setIsLoadingPivotConfig(false);
        setPivotConfigLoaded(true);
      }
    };

    loadPivotConfig();
  }, [enablePivotPersistence, finalLoadFromCMS, pivotConfigKey, pivotConfigLoaded]);

  // HIBERNATION FIX: Add cleanup refs and hydration safety
  const isMountedRef = useRef(true);
  const isHydratedRef = useRef(false);
  const saveTimeoutRef = useRef(null);
  
  // HYDRATION FIX: Track hydration completion to prevent setState during SSR/hydration
  useEffect(() => {
    isHydratedRef.current = true;
  }, []);
  
  // HYDRATION FIX: Safe callback wrapper to prevent setState during render
  const safeCallback = useCallback((callback, ...args) => {
    if (typeof callback === 'function' && isMountedRef.current && isHydratedRef.current) {
      // Use setTimeout to defer execution to next tick, avoiding setState during render
      setTimeout(() => {
        if (isMountedRef.current) {
          try {
            callback(...args);
          } catch (error) {
          }
        }
      }, 0);
    }
  }, []);
  
  // Save pivot configuration to CMS when it changes - HIBERNATION FIXED
  useEffect(() => {
    const savePivotConfig = async () => {
      if (!isMountedRef.current || !enablePivotPersistence || !finalSaveToCMS || !autoSavePivotConfig || !pivotConfigLoaded || !isAdminUser() || !pivotConfigKey) return;
      
      setIsSavingPivotConfig(true);
      try {
        await finalSaveToCMS(pivotConfigKey, localPivotConfig);
      } catch (error) {
      } finally {
        if (isMountedRef.current) {
          setIsSavingPivotConfig(false);
        }
      }
    };

    // Clear existing timeout to prevent memory leaks
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save operations to avoid too many CMS calls
    saveTimeoutRef.current = setTimeout(savePivotConfig, 1000);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [localPivotConfig, enablePivotPersistence, finalSaveToCMS, autoSavePivotConfig, pivotConfigKey, pivotConfigLoaded, isAdminUser]);

  // HIBERNATION FIX: Missing GraphQL useEffect with proper cleanup
  useEffect(() => {
    if (!graphqlQuery || !isMountedRef.current) return;
    
    let intervalId = null;
    const activeRequests = new Set();
    
    const executeGraphQLQuery = async () => {
      if (!isMountedRef.current) return;
      
      const abortController = new AbortController();
      activeRequests.add(abortController);
      
      setGraphqlLoading(true);
      setGraphqlError(null);
      
      try {
        // This should be replaced with actual GraphQL client implementation
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: graphqlQuery,
            variables: graphqlVariables
          }),
          signal: abortController.signal
        });
        
        if (!response.ok) {
          throw new Error(`GraphQL request failed: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (isMountedRef.current) {
          if (result.errors) {
            setGraphqlError(result.errors[0]?.message || 'GraphQL error');
          } else {
            setGraphqlData(result.data || []);
            // HYDRATION FIX: Defer callback to next tick to avoid setState during render
            if (onGraphqlData) {
              setTimeout(() => {
                if (isMountedRef.current) {
                  onGraphqlData(result.data);
                }
              }, 0);
            }
          }
        }
      } catch (error) {
        if (isMountedRef.current && error.name !== 'AbortError') {
          setGraphqlError(error.message);
        }
      } finally {
        if (isMountedRef.current) {
          setGraphqlLoading(false);
        }
        activeRequests.delete(abortController);
      }
    };
    
    // Initial query execution
    executeGraphQLQuery();
    
    // Setup refetch interval if specified
    if (refetchInterval > 0) {
      intervalId = setInterval(() => {
        if (isMountedRef.current) {
          executeGraphQLQuery();
        }
      }, refetchInterval);
    }
    
    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      // Cancel all active requests
      activeRequests.forEach(controller => {
        if (!controller.signal.aborted) {
          controller.abort();
        }
      });
      activeRequests.clear();
    };
  }, [graphqlQuery, graphqlVariables, refetchInterval, onGraphqlData]);



  // HIBERNATION FIX: Optimized pivot config with reduced dependencies
  const mergedPivotConfig = useMemo(() => {
    // NEW: If pivot UI is enabled, use local config
    if (enablePivotUI && localPivotConfig) {
      const config = {
        ...pivotConfig.aggregationFunctions && { aggregationFunctions: pivotConfig.aggregationFunctions },
        ...localPivotConfig,
        aggregationFunctions: {
          ...pivotConfig.aggregationFunctions,
          ...pivotAggregationFunctions
        }
      };

      return config;
    }
    
    const hasIndividualProps = pivotRows.length > 0 || pivotColumns.length > 0 || pivotValues.length > 0;
    
    if (hasIndividualProps) {
      // Use individual props (Plasmic interface)
      const config = {
        enabled: enablePivotTable,
        rows: pivotRows,
        columns: pivotColumns,
        values: pivotValues,
        filters: pivotFilters,
        calculatedFields: [], // Add calculated fields support
        showGrandTotals: pivotShowGrandTotals,
        showRowTotals: pivotShowRowTotals,
        showColumnTotals: pivotShowColumnTotals,
        showSubTotals: pivotShowSubTotals,
        numberFormat: pivotNumberFormat,
        currency: pivotCurrency,
        precision: pivotPrecision,
        fieldSeparator: pivotFieldSeparator,
        sortRows: pivotSortRows,
        sortColumns: pivotSortColumns,
        sortDirection: pivotSortDirection,
        aggregationFunctions: {
          ...pivotConfig.aggregationFunctions,
          ...pivotAggregationFunctions
        }
      };
      return config;
    }
    
    // Use pivotConfig object (direct usage)
    const config = {
      ...pivotConfig,
      enabled: enablePivotTable && pivotConfig.enabled
    };
    return config;
  }, [
    // HIBERNATION FIX: Reduced dependency array using JSON.stringify for complex objects
    enablePivotTable, 
    JSON.stringify(pivotRows), 
    JSON.stringify(pivotColumns), 
    JSON.stringify(pivotValues), 
    JSON.stringify(pivotFilters),
    pivotShowGrandTotals, pivotShowRowTotals, pivotShowColumnTotals, pivotShowSubTotals,
    pivotNumberFormat, pivotCurrency, pivotPrecision, pivotFieldSeparator,
    pivotSortRows, pivotSortColumns, pivotSortDirection, 
    JSON.stringify(pivotAggregationFunctions),
    JSON.stringify(pivotConfig), 
    enablePivotUI, 
    JSON.stringify(localPivotConfig)
  ]);

  // HYDRATION FIX: Safe initialization for isPivotEnabled
  const [isPivotEnabled, setIsPivotEnabled] = useState(false);

  // HYDRATION FIX: Update isPivotEnabled when props change with hydration safety
  useEffect(() => {
    if (!isHydratedRef.current) return;
    
    // Don't override if config was loaded from CMS and is enabled
    // Only set based on props if no saved config is loaded or config is explicitly disabled
    if (pivotConfigLoaded && localPivotConfig.enabled) {
      // Config was loaded from CMS and is enabled, keep it enabled
      setIsPivotEnabled(true);
    } else {
      // Use prop-based logic for initial state or when config is disabled
      setIsPivotEnabled(enablePivotTable && mergedPivotConfig.enabled);
    }
  }, [enablePivotTable, mergedPivotConfig.enabled, pivotConfigLoaded, localPivotConfig.enabled]);

  // Compute effective total display settings based on totalDisplayMode
  const effectiveTotalSettings = useMemo(() => {
    const isPivotActive = isPivotEnabled && mergedPivotConfig?.enabled;
    
    // NEW: If fixed footer totals is enabled, always show footer totals regardless of pivot
    if (enableFixedFooterTotals) {
      return {
        showPivotTotals: isPivotActive,
        showFooterTotals: true // Always show footer totals when fixed footer is enabled
      };
    }
    
    switch (totalDisplayMode) {
      case "pivot":
        return {
          showPivotTotals: true,
          showFooterTotals: false
        };
      case "footer":
        return {
          showPivotTotals: false,
          showFooterTotals: true
        };
      case "both":
        return {
          showPivotTotals: true,
          showFooterTotals: true
        };
      case "none":
        return {
          showPivotTotals: false,
          showFooterTotals: false
        };
      case "auto":
      default:
        // Auto mode: prefer pivot totals when pivot is active, footer totals otherwise
        if (isPivotActive) {
          return {
            showPivotTotals: true,
            showFooterTotals: false // Hide footer totals when pivot is active
          };
        } else {
          return {
            showPivotTotals: false,
            showFooterTotals: enableFooterTotals
          };
        }
    }
  }, [totalDisplayMode, isPivotEnabled, mergedPivotConfig?.enabled, enableFooterTotals, enableFixedFooterTotals]);

  // Apply effective total settings to pivot config
  const adjustedPivotConfig = useMemo(() => {
    // Ensure we always have valid formatting defaults
    const defaultConfig = {
      enabled: false,
      rows: [],
      columns: [],
      values: [],
      filters: [],
      calculatedFields: [],
      showGrandTotals: false,
      showRowTotals: false,
      showColumnTotals: false,
      showSubTotals: false,
      numberFormat: 'en-US',
      currency: 'USD',
      precision: 2,
      fieldSeparator: '__',
      sortRows: true,
      sortColumns: true,
      sortDirection: 'asc',
      aggregationFunctions: {}
    };

    if (!mergedPivotConfig) {
      return defaultConfig;
    }

    if (!effectiveTotalSettings.showPivotTotals) {
      // If pivot totals are disabled, turn off all pivot totals but preserve formatting
      return {
        ...defaultConfig,
        ...mergedPivotConfig,
        showGrandTotals: false,
        showRowTotals: false,
        showColumnTotals: false,
        showSubTotals: false
      };
    }

    // Merge with defaults to ensure all formatting properties exist
    return {
      ...defaultConfig,
      ...mergedPivotConfig
    };
  }, [mergedPivotConfig, effectiveTotalSettings.showPivotTotals]);

  // Data processing moved to utils/dataUtils.js
  const processedData = useMemo(() => {
    const rawData = graphqlQuery ? graphqlData : data;
    return processData(
      rawData, 
      graphqlQuery, 
      graphqlData, 
      enableMerge,
      enableROICalculation, 
      calculateROI, 
      roiConfig
    );
  }, [data, graphqlData, graphqlQuery, enableMerge, enableROICalculation, calculateROI, roiConfig]);

  // Use processed data
  const tableData = processedData;
  const isLoading = graphqlQuery ? graphqlLoading : loading;
  const tableError = graphqlQuery ? graphqlError : error;

  // HYDRATION FIX: Initialize filtered data for totals
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (tableData && Array.isArray(tableData)) {
      const validData = tableData.filter(row => row && typeof row === 'object');
      setFilteredDataForTotals(validData);
    } else {
      setFilteredDataForTotals([]);
    }
  }, [tableData]); // Update when tableData changes

  // Pivot data transformation
  const pivotTransformation = useMemo(() => {
    // CRITICAL: Ensure tableData is an array before pivot transformation
    if (!Array.isArray(tableData)) {
      return { 
        pivotData: [], 
        pivotColumns: [], 
        columnValues: [], 
        grandTotalData: null,
        isPivot: false 
      };
    }

    if (!isPivotEnabled || !adjustedPivotConfig.enabled) {
      return { 
        pivotData: tableData, 
        pivotColumns: [], 
        columnValues: [], 
        grandTotalData: null,
        isPivot: false 
      };
    }

    try {
      const result = transformToPivotData(tableData, adjustedPivotConfig);
      
      // CRITICAL: Validate pivot transformation result
      if (!result || !Array.isArray(result.pivotData)) {
        return { 
          pivotData: tableData, 
          pivotColumns: [], 
          columnValues: [], 
          grandTotalData: null,
          isPivot: false 
        };
      }
      
      return {
        ...result,
        isPivot: true
      };
    } catch (error) {
      return { 
        pivotData: Array.isArray(tableData) ? tableData : [], 
        pivotColumns: [], 
        columnValues: [], 
        grandTotalData: null,
        isPivot: false 
      };
    }
  }, [tableData, isPivotEnabled, adjustedPivotConfig]);



  // Final data source - either original data or pivot data
  // CRITICAL: Add final safety check to ensure finalTableData is always an array
  const finalTableData = useMemo(() => {
    let data = pivotTransformation.isPivot ? pivotTransformation.pivotData : tableData;
    
    // CRITICAL: Ensure data is always an array
    if (!Array.isArray(data)) {
      return [];
    }

    // Don't modify data - we'll use PrimeReact's footer functionality instead



    return data;
  }, [pivotTransformation, tableData]);

  // 🔑 Resolve the dataKey with clear precedence (manual > auto-detect > fallback)
  const resolvedDataKey = useMemo(() => {
    // 1) Manual override (highest priority)
    if (dataKey && typeof dataKey === 'string' && dataKey.trim().length > 0) {
      return dataKey.trim();
    }
    // 2) Auto-detect from sample
    const sample = Array.isArray(finalTableData) && finalTableData[0] ? finalTableData[0] : {};
    const keys = Object.keys(sample || {});
    const preferredOrder = [
      'id','EBSCode','Invoice','Invoice No','invoiceNo','code','key','uid','_id'
    ];
    const foundPreferred = preferredOrder.find(k => k in sample);
    if (foundPreferred) return foundPreferred;
    // Regex fallback for any *id / *code / invoice*
    const regexFound = keys.find(k => /id|code|invoice/i.test(k));
    if (regexFound) return regexFound;
    // 3) Last resort
    return 'id';
  }, [dataKey, finalTableData]);

  // 🧷 Ensure every row actually has that key (synthesize if missing)
  useEffect(() => {
    if (!Array.isArray(finalTableData)) return;
    finalTableData.forEach((row, i) => {
      if (row && row[resolvedDataKey] === undefined) {
        row[resolvedDataKey] = `_row_${i}`;
      }
    });
  }, [finalTableData, resolvedDataKey]);

  // 🔍 Auto-detect the nested data key (e.g., 'items', 'invoices', 'orders')
  const detectNestedKey = (data) => {
    if (!Array.isArray(data) || data.length === 0) return 'items';
    
    const sample = data[0];
    if (!sample) return 'items';
    
    // Common nested data keys to check
    const commonKeys = ['items', 'invoices', 'orders', 'products', 'children', 'subItems', 'nestedData'];
    
    // Find the first key that contains an array
    for (const key of commonKeys) {
      if (sample[key] && Array.isArray(sample[key]) && sample[key].length > 0) {
        return key;
      }
    }
    
    // Fallback: look for any array field
    for (const [key, value] of Object.entries(sample)) {
      if (Array.isArray(value) && value.length > 0) {
        return key;
      }
    }
    
    return 'items'; // Default fallback
  };

  // ✅ Build expansion config with shared utils so arrows + buttons work
  const expansionConfig = useMemo(() => {
    if (!enableRowExpansion) return null;

    const detectedKey = detectNestedKey(finalTableData);

    return createRowExpansionConfig({
      data: finalTableData,
      dataKey: resolvedDataKey, // ← single source of truth
      expansionColumnStyle,
      expansionColumnWidth,
      expansionColumnHeader,
      expansionColumnBody,
      expansionColumnPosition,
      showExpandAllButtons: false, // prevent duplicate buttons - we'll render our own
      expandAllLabel,
      collapseAllLabel,
      expansionButtonStyle,
      expansionButtonClassName,
      // Use caller template if provided; else auto-detect nested array
      rowExpansionTemplate:
        rowExpansionTemplate ||
        generateAutoDetectedExpansionTemplate({ 
          nestedKey: detectedKey, 
          ...nestedDataConfig 
        }),
      nestedDataConfig,
      // Keep external callbacks working
      onRowToggle: (e) => {
        setLocalExpandedRows(e.data);
        onRowToggle && onRowToggle(e);
      }
    });
  }, [
    enableRowExpansion,
    finalTableData,
    resolvedDataKey,
    expansionColumnStyle,
    expansionColumnWidth,
    expansionColumnHeader,
    expansionColumnBody,
    expansionColumnPosition,
    showExpandAllButtons,
    expandAllLabel,
    collapseAllLabel,
    expansionButtonStyle,
    expansionButtonClassName,
    rowExpansionTemplate,
    nestedDataConfig,
    onRowToggle
  ]);
  
  // Initialize filtered data for grand total calculations when finalTableData changes
  useEffect(() => {
    if (finalTableData && finalTableData.length > 0) {
      setFilteredDataForGrandTotal(finalTableData);
    }
  }, [finalTableData]);
  
  // NEW: Handle global filter changes for grand total calculation
  useEffect(() => {
    if (!globalFilterValue || globalFilterValue.trim() === '') {
      // No global filter, use all data
      setFilteredDataForGrandTotal(finalTableData);

    } else {
      // Apply global filter manually for grand total calculation - SIMPLE DIRECT APPROACH
      // Based on your data: {brand: 'PREGABRIT', quantity_total: 65244, quantity: 65244}
      // Search in the main visible fields
      const filteredData = finalTableData.filter(row => {
        const searchValue = globalFilterValue.toLowerCase();
        
        // Search in brand field (main field to search)
        const brandValue = row.brand || row.Brand || '';
        if (String(brandValue).toLowerCase().includes(searchValue)) {
          return true;
        }
        
        // Also search in quantity fields if they contain the search term
        const quantityValue = row.quantity || '';
        if (String(quantityValue).toLowerCase().includes(searchValue)) {
          return true;
        }
        
        const quantityTotalValue = row.quantity_total || '';
        if (String(quantityTotalValue).toLowerCase().includes(searchValue)) {
          return true;
        }
        
        return false;
      });
      

      
      setFilteredDataForGrandTotal(filteredData);

    }
  }, [globalFilterValue, finalTableData]);
  
  // NEW: Dynamic grand total calculation based on filtered data
  const dynamicGrandTotal = useMemo(() => {
    if (!pivotTransformation.isPivot || !effectiveTotalSettings.showPivotTotals) {
      return null;
    }
    
    // CRITICAL: Use filtered data if available, otherwise use all data
    const dataToCalculate = filteredDataForGrandTotal.length > 0 ? filteredDataForGrandTotal : finalTableData;
    
    // Don't calculate if no data
    if (!dataToCalculate || dataToCalculate.length === 0) {
      return null;
    }
    

    
    // Get pivot configuration
    const config = adjustedPivotConfig;
    const { values } = config;
    
    if (!values || values.length === 0) {
      return null;
    }
    
    // Calculate grand totals for each value field
    const grandTotalRow = { isGrandTotal: true };
    
    // Set row field values to "Grand Total"
    if (config.rows) {
      config.rows.forEach(rowField => {
        grandTotalRow[rowField] = 'Grand Total';
      });
    }
    
    // Calculate totals for each value configuration
    values.forEach(valueConfig => {
      const fieldName = valueConfig.field;
      const aggregation = valueConfig.aggregation || 'sum';
      const aggregateFunc = config.aggregationFunctions[aggregation];
      
      if (aggregateFunc) {
        // Extract values from the filtered data ONLY
        const allValues = dataToCalculate
          .map(row => row[fieldName])
          .filter(v => v !== null && v !== undefined && typeof v === 'number');
        
        // Calculate the total from ONLY the visible/filtered rows
        const calculatedTotal = allValues.length > 0 ? aggregateFunc(allValues) : 0;
        
        // Store with the same key structure as pivot data
        if (config.showRowTotals) {
          const totalKey = values.filter(v => v.field === fieldName).length > 1 
            ? `${fieldName}_${aggregation}_total` 
            : `${fieldName}_total`;
          grandTotalRow[totalKey] = calculatedTotal;
        }
        
        // For column grouping, calculate totals for each column
        if (config.columns && config.columns.length > 0) {
          // Get unique column values from filtered data
          const columnValues = [];
          config.columns.forEach(colField => {
            const uniqueVals = [...new Set(dataToCalculate.map(row => row[colField]).filter(v => v !== null && v !== undefined))];
            columnValues.push(...uniqueVals);
          });
          const uniqueColumnValues = [...new Set(columnValues)];
          
          uniqueColumnValues.forEach(colValue => {
            const colRows = dataToCalculate.filter(row => {
              return config.columns.some(colField => row[colField] === colValue);
            });
            const colValues = colRows.map(row => row[fieldName]).filter(v => v !== null && v !== undefined && typeof v === 'number');
            const columnKey = `${colValue}_${fieldName}_${aggregation}`;
            grandTotalRow[columnKey] = colValues.length > 0 ? aggregateFunc(colValues) : 0;
          });
        } else {
          // No column grouping, use simple field name
          const valueKey = values.length > 1 && values.filter(v => v.field === fieldName).length > 1 
            ? `${fieldName}_${aggregation}` 
            : fieldName;
          grandTotalRow[valueKey] = calculatedTotal;
        }
        

      }
    });
    
    // ✅ NEW: Calculate grand totals for calculated fields
    const calculatedFields = config.calculatedFields || [];
    if (calculatedFields.length > 0 && dataToCalculate.length > 0) {
      calculatedFields.forEach(calcField => {
        try {
          // Get the calculated field key
          const baseKey = calcField.id || calcField.name.replace(/\s+/g, '_');
          const calcFieldKey = baseKey.startsWith('calc_') ? baseKey : `calc_${baseKey}`;
          
          // Extract calculated field values from all rows
          const calculatedValues = dataToCalculate
            .map(row => row[calcFieldKey])
            .filter(v => typeof v === 'number' && !isNaN(v) && v !== 'Error');
          
          if (calculatedValues.length > 0) {
            // Sum all calculated field values for grand total
            const grandTotalValue = calculatedValues.reduce((sum, val) => sum + val, 0);
            grandTotalRow[calcFieldKey] = grandTotalValue;
            
            // ✅ Round grand total to 2 decimal places
            const roundedGrandTotal = Math.round(grandTotalValue * 100) / 100;
            grandTotalRow[calcFieldKey] = roundedGrandTotal;
          }
        } catch (error) {
        }
      });
    }
    
    return grandTotalRow;
  }, [
    pivotTransformation.isPivot, 
    effectiveTotalSettings.showPivotTotals, 
    filteredDataForGrandTotal, 
    finalTableData, 
    adjustedPivotConfig
  ]);
  
  const hasPivotData = pivotTransformation.isPivot && pivotTransformation.pivotData.length > 0;

  // NEW: Helper functions for pivot configuration UI
  const getAvailableFields = useMemo(() => {
    if (!tableData || tableData.length === 0) return [];
    
    const sampleRow = tableData[0];
    if (!sampleRow || typeof sampleRow !== 'object') return [];
    
    return Object.keys(sampleRow).map(key => ({
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      value: key,
      type: typeof sampleRow[key] === 'number' ? 'number' : 
            typeof sampleRow[key] === 'boolean' ? 'boolean' :
            typeof sampleRow[key] === 'string' && /^\d{4}-\d{2}-\d{2}/.test(sampleRow[key]) ? 'date' : 'text'
    }));
  }, [tableData]);

  const getNumericFields = useMemo(() => {
    return getAvailableFields.filter(field => field.type === 'number');
  }, [getAvailableFields]);

  const getCategoricalFields = useMemo(() => {
    return getAvailableFields.filter(field => field.type !== 'number');
  }, [getAvailableFields]);

  const aggregationOptions = [
    { label: 'Sum', value: 'sum' },
    { label: 'Count', value: 'count' },
    { label: 'Average', value: 'average' },
    { label: 'Min', value: 'min' },
    { label: 'Max', value: 'max' },
    { label: 'First', value: 'first' },
    { label: 'Last', value: 'last' }
  ];

  // Pivot configuration handlers - extracted to utils/pivotConfigUtils.js
  const {
    applyPivotConfig,
    applyAndSavePivotConfig,
    resetPivotConfig,
    savePivotConfigManually
  } = createPivotConfigHandlers({
    enablePivotUI,
    localPivotConfig,
    mergedPivotConfig,
    setIsPivotEnabled,
    setShowPivotConfig,
    enablePivotPersistence,
    finalSaveToCMS,
    isAdminUser,
    setIsSavingPivotConfig,
    pivotConfigKey,
    setLocalPivotConfig
  });


  // HIBERNATION FIX: Comprehensive component unmount cleanup with performance monitoring
  useEffect(() => {
    // Performance monitoring
    const componentMountTime = Date.now();
    
    // Window event handlers for large dataset warnings
    const handleBeforeUnload = (event) => {
      if (tableData && tableData.length > 5000) {
        event.preventDefault();
        event.returnValue = 'Large dataset is being processed. Are you sure you want to leave?';
      }
    };
    
    const handleVisibilityChange = () => {
    };
    
    // Only add event listeners if dealing with large datasets and we're in a proper browser environment
    // Skip in Plasmic Studio to avoid iframe communication issues
    const isValidBrowserEnvironment = typeof window !== 'undefined' && typeof document !== 'undefined' && !window.parent;
    const isPlasmicStudio = typeof window !== 'undefined' && window.location?.hostname?.includes('plasmic');
    
    if (isValidBrowserEnvironment && !isPlasmicStudio && tableData && tableData.length > 5000) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    
    return () => {
      // Clean up event listeners with proper checks (don't clear isMountedRef here as this effect runs on tableData changes)
      if (typeof window !== 'undefined' && !isPlasmicStudio) {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
      if (typeof document !== 'undefined' && !isPlasmicStudio) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [tableData]);

  // Column type detection and filter element functions moved to utils/filterUtils.js and utils/templateUtils.js

  // Advanced, data-driven column type detection (no manual config required)
  const getEffectiveColumnType = useCallback((column) => {
    // 1) Respect explicit type when provided
    if (column && column.type) return column.type;

    const key = column?.key;
    if (!key) return getColumnType(column || {});

    // 1a) Priority keyword-based detection for common categorical columns
    const keyLower = String(key).toLowerCase();
    if (/(team|status|type|category|dept|department|region|zone|state|city|brand|hq)/.test(keyLower)) {
      return 'dropdown';
    }

    // 2) Inspect sample values in data
    let sampleValue = undefined;
    if (Array.isArray(finalTableData) && finalTableData.length > 0) {
      for (let i = 0; i < finalTableData.length; i++) {
        const val = finalTableData[i]?.[key];
        if (val !== null && val !== undefined) { sampleValue = val; break; }
      }
    }

    // 2a) Primitive-based detection
    if (typeof sampleValue === 'number') return 'number';
    if (typeof sampleValue === 'boolean') return 'boolean';

    // 2b) Date-like string detection
    if (typeof sampleValue === 'string') {
      const looksLikeISODateTime = sampleValue.includes('T') && sampleValue.includes('Z');
      const looksLikeYMD = /^\d{4}-\d{2}-\d{2}/.test(sampleValue);
      if (looksLikeISODateTime) return 'datetime';
      if (looksLikeYMD) return 'date';
    }

    // 3) Categorical detection from unique value count (strings, small domains → dropdown)
    const uniques = getUniqueValues(finalTableData || [], key);
    if (Array.isArray(uniques) && uniques.length > 0 && uniques.length <= 200) {
      return 'dropdown';
    }

    // 4) Fallback to key-based heuristics
    return getColumnType(column || {});
  }, [finalTableData, getColumnType]);





  // Enhanced column generation with data type detection
  const defaultColumns = useMemo(() => {
    let cols = [];

    // Use pivot columns if pivot is enabled and available
    if (pivotTransformation.isPivot && pivotTransformation.pivotColumns.length > 0) {
      cols = pivotTransformation.pivotColumns.map(col => ({
        ...col,
        sortable: col.sortable !== false,
        filterable: col.filterable !== false,
        type: col.type || 'text'
      }));
      
      // Add calculated field columns to pivot columns
      if (pivotTransformation.pivotData?.length > 0) {
        const sampleRow = pivotTransformation.pivotData[0];
        const processedCalculatedFields = new Set(); // Track processed field names to prevent duplicates
        
        Object.keys(sampleRow).forEach(key => {
          if (key.startsWith('calc_') && !key.endsWith('_meta')) {
            const meta = sampleRow[`${key}_meta`];
            if (meta) {
              // ✅ Step 1: Prevent duplicate columns with same name
              if (processedCalculatedFields.has(meta.name)) {
                return; // Skip this duplicate
              }
              
              // ✅ Step 2: Create unique key for JSX rendering
              const uniqueKey = `${key}_${meta.name}`;
              processedCalculatedFields.add(meta.name);
              
              // ✅ Step 3: Create descriptive title for duplicate fields
              const existingFieldsWithSameName = cols.filter(col => col.title === meta.name);
              const title = existingFieldsWithSameName.length > 0 
                ? `${meta.name} (${existingFieldsWithSameName.length + 1})` 
                : meta.name;
              
              const calculatedFieldColumn = {
                key: key, // Keep original key for internal use
                uniqueKey: uniqueKey, // ✅ Unique key for JSX rendering
                title: title,
                sortable: true,
                filterable: true,
                type: 'number',
                isPivotCalculatedField: true,
                calculatedField: meta,
                // Custom body template for calculated fields
                body: (rowData) => {
                  const value = rowData[key];
                  if (value === 'Error') {
                    return <span style={{ color: 'red' }}>Error</span>;
                  }
                  
                  // ✅ Force 2 decimal places for calculated field values
                  if (typeof value === 'number') {
                    try {
                      return new Intl.NumberFormat(
                        adjustedPivotConfig.numberFormat || 'en-US',
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }
                      ).format(value);
                    } catch (error) {
                      // Fallback to simple 2 decimal formatting
                      return value.toFixed(2);
                    }
                  }
                  
                  // Fallback to original formatting for non-numeric values
                  return formatCalculatedValue(value, meta.format || 'number', {
                    currency: adjustedPivotConfig.currency,
                    locale: adjustedPivotConfig.numberFormat,
                    precision: 2 // ✅ Force 2 decimal places
                  });
                }
              };
              
              // ✅ Deduplication guard - prevent duplicate calculated field columns
              const alreadyExists = cols.some(col => col.key === key);
              const duplicateTitle = cols.some(col => col.title === title && col.key !== key);
              
              if (!alreadyExists) {
                // Add calculated field column to the pivot columns
                cols.push(calculatedFieldColumn);
              }
            }
          }
        });
      }
    } else if (columns.length > 0) {
      // ✅ Normalize keys from field/header if missing
      const normalizedColumns = columns.map(col => {
        const key = col.key || col.field || col.header || col.name;
        return {
          key,
          title: col.title || col.header || key,
          sortable: col.sortable !== false,
          filterable: col.filterable !== false, // FIXED: Ensure filterable is explicitly set
          type: col.type || 'text',
          ...col,
          key // override or re-add key to make sure it's set
        };
      });

      const orderedColumns = columnOrder.length > 0 
        ? columnOrder.map(key => normalizedColumns.find(col => col.key === key)).filter(Boolean)
        : normalizedColumns;

      cols = orderedColumns.filter(col => !hiddenColumns.includes(col.key));
    } else if (finalTableData.length > 0) {
      const sampleRow = finalTableData[0];
      const autoColumns = Object.keys(sampleRow).map(key => {
        const value = sampleRow[key];
        let type = 'text';
        if (typeof value === 'number') type = 'number';
        else if (typeof value === 'boolean') type = 'boolean';
        else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) type = 'date';
        else if (typeof value === 'string' && value.includes('T') && value.includes('Z')) type = 'datetime';

        return {
          key,
          title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          sortable: true,
          filterable: true, // FIXED: Ensure auto-generated columns are filterable
          type
        };
      });

      const orderedColumns = columnOrder.length > 0 
        ? columnOrder.map(key => autoColumns.find(col => col.key === key)).filter(Boolean)
        : autoColumns;

      cols = orderedColumns.filter(col => !hiddenColumns.includes(col.key));
    }

    if (fields && Array.isArray(fields) && fields.length > 0) {
      cols = cols.filter(col => {
        // Always include calculated field columns (they start with 'calc_')
        if (col.key && col.key.startsWith('calc_')) {
          return true;
        }
        // For other columns, check if they're in the fields array
        return fields.includes(col.key);
      });
    }

    // NEW: Add ROI column if ROI calculation is enabled
    if (enableROICalculation && roiConfig?.showROIColumn) {
      const roiColumn = {
        key: roiConfig.roiColumnKey,
        title: roiConfig.roiColumnTitle,
        sortable: true,
        filterable: true,
        type: 'roi',
        isROIColumn: true
      };
      
      // Add ROI column to the end of the columns
      cols.push(roiColumn);
    }
    
    return cols;
  }, [columns, finalTableData, hiddenColumns, columnOrder, fields, pivotTransformation.isPivot, pivotTransformation.pivotColumns, enableROICalculation, roiConfig]);

  // Auto-detect column grouping patterns
  const autoDetectedColumnGroups = useMemo(() => {
    if (!enableAutoColumnGrouping || !tableData.length) {
      return { groups: [], ungroupedColumns: defaultColumns };
    }

    const { groupSeparator, ungroupedColumns, totalColumns, groupingPatterns, customGroupMappings } = groupConfig;
    const groups = [];
    const processedColumns = new Set();
    const remainingColumns = [];

    // Step 1: Handle explicitly ungrouped columns
    const explicitlyUngroupedColumns = defaultColumns.filter(col => 
      ungroupedColumns.includes(col.key)
    );
    explicitlyUngroupedColumns.forEach(col => processedColumns.add(col.key));

    // Step 2: Post-merge column grouping based on keywords
    // This groups columns after merging based on their names containing keywords like "service", "support", etc.
    const keywordGroups = {};
    
    // Auto-detect group keywords from column names
    const detectGroupKeywords = () => {
      const allColumnKeys = defaultColumns.map(col => col.key.toLowerCase());
      const detectedGroups = new Map();
      
      // Find common prefixes/suffixes in column names
      allColumnKeys.forEach(colKey => {
        // Skip columns that are explicitly ungrouped
        if (ungroupedColumns.includes(colKey)) return;
        
        // Look for patterns like: serviceAmount, serviceId, supportValue, etc.
        // Extract the first word (before camelCase or underscore)
        const match = colKey.match(/^([a-zA-Z]+)/);
        if (match) {
          const prefix = match[1];
          
          // Skip common shared field prefixes
          const sharedPrefixes = ['dr', 'date', 'id', 'name', 'team', 'hq', 'location', 'code','salesTeam'];
          if (sharedPrefixes.includes(prefix)) return;
          
          // Count how many columns start with this prefix
          const count = allColumnKeys.filter(key => key.startsWith(prefix)).length;
          
          // If multiple columns share this prefix, it's likely a group
          if (count > 1) {
            const groupName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
            if (!detectedGroups.has(groupName)) {
              detectedGroups.set(groupName, []);
            }
            detectedGroups.get(groupName).push(prefix);
          }
        }
      });
      
      return detectedGroups;
    };
    
    // Get auto-detected groups
    const autoDetectedGroups = detectGroupKeywords();
    
    defaultColumns.forEach(col => {
      if (processedColumns.has(col.key)) return;
      
      const colKey = col.key.toLowerCase();
      
      // Explicitly exclude salesTeam from any grouping
      if (colKey.includes('salesteam') || col.key === 'salesTeam') return;
      
      let assignedGroup = null;
      
      // Check for keyword-based grouping (post-merge logic)
      if (customGroupMappings && Object.keys(customGroupMappings).length > 0) {
        for (const [keyword, groupName] of Object.entries(customGroupMappings)) {
          if (colKey.includes(keyword.toLowerCase())) {
            assignedGroup = groupName;
            break;
          }
        }
      }
      
      // Auto-detect group based on column prefix
      if (!assignedGroup) {
        for (const [groupName, prefixes] of autoDetectedGroups) {
          if (prefixes.some(prefix => colKey.startsWith(prefix))) {
            assignedGroup = groupName;
            break;
          }
        }
      }
      
      // Fallback to hardcoded keywords if no auto-detection
      if (!assignedGroup) {
        if (colKey.includes('service')) {
          assignedGroup = 'Service';
        } else if (colKey.includes('support')) {
          assignedGroup = 'Support';
        } else if (colKey.includes('inventory')) {
          assignedGroup = 'Inventory';
        } else if (colKey.includes('empVisit')) {
          assignedGroup = 'EmpVisit';
        } else if (colKey.includes('drVisit')) {
          assignedGroup = 'DrVisit';
        }
      }
      
      if (assignedGroup) {
        if (!keywordGroups[assignedGroup]) {
          keywordGroups[assignedGroup] = [];
        }
        keywordGroups[assignedGroup].push({
          ...col,
          originalKey: col.key,
          subHeader: col.title,
          groupName: assignedGroup
        });
        processedColumns.add(col.key);
      }
    });

    // Step 3: Detect groups by separator pattern (e.g., "2025-04-01__serviceAmount")
    const separatorGroups = {};
    defaultColumns.forEach(col => {
      if (processedColumns.has(col.key)) return;
      
      if (col.key.includes(groupSeparator)) {
        const parts = col.key.split(groupSeparator);
        if (parts.length >= 2) {
          const prefix = parts[0]; // e.g., "2025-04-01"
          const suffix = parts.slice(1).join(groupSeparator); // e.g., "serviceAmount"
          let groupName = suffix;
          const suffixLower = suffix.toLowerCase();
          
          // Check custom group mappings first
          if (customGroupMappings && Object.keys(customGroupMappings).length > 0) {
            for (const [keyword, groupNameMapping] of Object.entries(customGroupMappings)) {
              if (suffixLower.includes(keyword.toLowerCase())) {
                groupName = groupNameMapping;
                break;
              }
            }
          }
          
          if (!separatorGroups[groupName]) {
            separatorGroups[groupName] = [];
          }
          separatorGroups[groupName].push({
            ...col,
            originalKey: col.key,
            groupPrefix: prefix,
            groupSuffix: suffix,
            subHeader: suffix.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
          });
          processedColumns.add(col.key);
        }
      }
    });

    // Step 4: Handle custom grouping patterns
    groupingPatterns.forEach(pattern => {
      const regex = new RegExp(pattern.regex);
      defaultColumns.forEach(col => {
        if (processedColumns.has(col.key)) return;
        if (regex.test(col.key)) {
          const match = col.key.match(regex);
          const groupName = pattern.groupName || match[1] || 'Group';
          if (!separatorGroups[groupName]) {
            separatorGroups[groupName] = [];
          }
          separatorGroups[groupName].push({
            ...col,
            originalKey: col.key,
            subHeader: pattern.subHeaderExtractor ? pattern.subHeaderExtractor(col.key) : col.title
          });
          processedColumns.add(col.key);
        }
      });
    });

    // Step 5: Convert keyword groups to column groups (post-merge grouping takes priority)
    Object.entries(keywordGroups).forEach(([groupName, groupColumns]) => {
      if (groupColumns.length > 0) {
        groups.push({
          header: groupName,
          columns: groupColumns.sort((a, b) => a.title.localeCompare(b.title))
        });
      }
    });

    // Step 6: Convert separator groups to column groups
    Object.entries(separatorGroups).forEach(([groupName, groupColumns]) => {
      if (groupColumns.length > 0) {
        groups.push({
          header: groupName,
          columns: groupColumns.sort((a, b) => {
            // Sort by prefix first, then by suffix
            const prefixCompare = (a.groupPrefix || '').localeCompare(b.groupPrefix || '');
            if (prefixCompare !== 0) return prefixCompare;
            return (a.groupSuffix || '').localeCompare(b.groupSuffix || '');
          })
        });
      }
    });

    // Step 7: Handle total columns - try to group them with their parent groups
    const totalCols = defaultColumns.filter(col => 
      !processedColumns.has(col.key) && (
        totalColumns.includes(col.key) || 
        col.key.toLowerCase().includes('total') ||
        col.title.toLowerCase().includes('total')
      )
    );
    totalCols.forEach(col => {
      let matched = false;
      const colLower = col.key.toLowerCase();
      groups.forEach(group => {
        const groupNameLower = group.header.toLowerCase();
        if (colLower.includes(groupNameLower)) {
          group.columns.push({
            ...col,
            originalKey: col.key,
            subHeader: col.title,
            isTotal: true
          });
          matched = true;
          processedColumns.add(col.key);
        }
      });
      if (!matched) {
        remainingColumns.push(col);
        processedColumns.add(col.key);
      }
    });

    // Step 8: Remaining ungrouped columns
    defaultColumns.forEach(col => {
      if (!processedColumns.has(col.key)) {
        remainingColumns.push(col);
      }
    });

    return {
      groups,
      ungroupedColumns: [...explicitlyUngroupedColumns, ...remainingColumns]
    };
  }, [enableAutoColumnGrouping, defaultColumns, tableData, groupConfig]);

  // Final column structure with grouping
  const finalColumnStructure = useMemo(() => {
    if (!enableColumnGrouping) {
      return { columns: defaultColumns, hasGroups: false };
    }

    if (enableAutoColumnGrouping) {
      return {
        columns: defaultColumns,
        hasGroups: autoDetectedColumnGroups.groups.length > 0,
        groups: autoDetectedColumnGroups.groups,
        ungroupedColumns: autoDetectedColumnGroups.ungroupedColumns
      };
    }

    // Use manual column groups
    return {
      columns: defaultColumns,
      hasGroups: columnGroups.length > 0,
      groups: columnGroups,
      ungroupedColumns: defaultColumns
    };
  }, [enableColumnGrouping, enableAutoColumnGrouping, defaultColumns, autoDetectedColumnGroups, columnGroups]);


  // NEW: Whether native row filters are active in the table
  const isNativeRowFilterActive = useMemo(() => {
    return enableColumnFilter && filterMode === 'native';
  }, [enableColumnFilter, filterMode]);


  // HIBERNATION FIX: Initialize filters based on columns with debounced global filter
  const initializeFilters = useCallback(() => {
    const initialFilters = {
      global: { value: globalFilterValue, matchMode: FilterMatchMode.CONTAINS }
    };
    
    // Initialize filters for all columns that should be filterable
    defaultColumns.forEach(col => {
      // FIXED: Check filterable property properly - if not explicitly false and enableColumnFilter is true
      const isFilterable = (col.filterable !== false) && enableColumnFilter;
      
      if (isFilterable) {
        // FIXED: Determine appropriate match mode based on column type
        const columnType = getEffectiveColumnType(col);
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
        
        // Use advanced filter structure for all columns to match official PrimeReact design
        initialFilters[col.key] = { 
          operator: FilterOperator.AND, 
          constraints: [{ value: null, matchMode }] 
        };
      }
    });
    
    setFilters(initialFilters);
  }, [defaultColumns, enableColumnFilter, globalFilterValue, getEffectiveColumnType]);

  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        initializeFilters();
      }
    }, 100); // Debounce filter initialization
    
    return () => clearTimeout(timeoutId);
  }, [initializeFilters]);

  // Parse customFormatters from strings to functions using useMemo
  const parsedCustomFormatters = useMemo(() => {
    const parsedFormatters = {};
    
    // Safety check - ensure customFormatters is an object
    if (!customFormatters || typeof customFormatters !== 'object') {
      return parsedFormatters;
    }
    
    Object.keys(customFormatters).forEach(key => {
      const formatter = customFormatters[key];
      
      if (typeof formatter === 'function') {
        // Already a function, use as is
        parsedFormatters[key] = formatter;
      } else if (typeof formatter === 'string') {
        // String function, try to parse it
        try {
          // Handle different function formats
          let functionBody, paramNames;
          
          if (formatter.includes('function(')) {
            // Standard function format: function(value, rowData) { return ... }
            functionBody = formatter.replace(/^function\s*\([^)]*\)\s*\{/, '').replace(/\}$/, '');
            const params = formatter.match(/function\s*\(([^)]*)\)/);
            paramNames = params ? params[1].split(',').map(p => p.trim()) : ['value', 'rowData'];
          } else if (formatter.includes('=>')) {
            // Arrow function format: (value, rowData) => ...
            const arrowMatch = formatter.match(/\(([^)]*)\)\s*=>\s*(.+)/);
            if (arrowMatch) {
              paramNames = arrowMatch[1].split(',').map(p => p.trim());
              functionBody = `return ${arrowMatch[2]}`;
            } else {
              // Simple arrow function: value => ...
              paramNames = ['value'];
              functionBody = `return ${formatter.replace(/^[^=]*=>\s*/, '')}`;
            }
          } else {
            // Simple expression, treat as value => expression
            paramNames = ['value'];
            functionBody = `return ${formatter}`;
          }
          
          // Create the function
          const func = new Function(...paramNames, functionBody);
          parsedFormatters[key] = func;
        } catch (error) {
          console.warn(`Failed to parse customFormatter for ${key}:`, error);
          // Fallback to simple string return
          parsedFormatters[key] = (value) => String(value || '');
        }
      } else {
        // Fallback for other types
        parsedFormatters[key] = (value) => String(value || '');
      }
    });
    
    return parsedFormatters;
  }, [customFormatters]);



  // Event handlers - extracted to utils/eventHandlers.js
  const {
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
  } = createEventHandlers({
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
  });



  // Custom cell renderers moved to utils/templateUtils.js
  const imageBodyTemplate = createImageBodyTemplate(popupImageFields, setImageModalSrc, setImageModalAlt, setShowImageModal);
  const roiBodyTemplate = createROIBodyTemplate(formatROIValue, getROIColor);

  // Row expansion: keep local state in sync when a single row is toggled
  const handleRowToggle = useCallback((e) => {
    // e.data is the expandedRows map from PrimeReact
    setLocalExpandedRows(e.data || {});
    // If the parent passed in its own onRowToggle prop, forward the event
    if (typeof onRowToggle === 'function') onRowToggle(e);
  }, [onRowToggle]);

  // Pivot table and action templates moved to utils/templateUtils.js
  const pivotValueBodyTemplate = createPivotValueBodyTemplate(adjustedPivotConfig, currencyColumns);
  const actionsBodyTemplate = createActionsBodyTemplate(rowActions);

  // Advanced filter components


  // Filter templates moved to utils/templateUtils.js
  const filterClearTemplate = createFilterClearTemplate(enableFilterClear);
  const filterApplyTemplate = createFilterApplyTemplate(enableFilterApply);
  const filterFooterTemplate = createFilterFooterTemplate(enableFilterFooter);



  // Filter functions moved to utils/filterUtils.js - using imported functions

  // HIBERNATION FIX: Update filtered data when filters or tableData change with optimized dependencies
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    // Apply current filters to get filtered data for totals
    const filteredData = applyFiltersToData(tableData, filters);
    // Ensure filtered data contains only valid objects
    const validFilteredData = filteredData.filter(row => row && typeof row === 'object');
    
    // Only update if data actually changed to prevent unnecessary re-renders
    setFilteredDataForTotals(prevData => {
      if (prevData.length !== validFilteredData.length) {
        return validFilteredData;
      }
      
      // Simple shallow comparison for performance
      const hasChanged = prevData.some((row, index) => row !== validFilteredData[index]);
      return hasChanged ? validFilteredData : prevData;
    });
  }, [tableData, JSON.stringify(filters)]);  // HIBERNATION FIX: Use JSON.stringify for filters to avoid function dependency

  // Footer totals calculation moved to utils/calculationUtils.js
  const footerTotalsCalculation = useMemo(() => {
    return calculateFooterTotals(filteredDataForTotals, footerTotalsConfig);
  }, [filteredDataForTotals, footerTotalsConfig]);



  // Filter options generation moved to utils/filterUtils.js

  // Footer template moved to utils/templateUtils.js
  const footerTemplate = createFooterTemplate(
    effectiveTotalSettings,
    currencyColumns,
    footerTotalsCalculation,
    footerTotalsConfig,
    tableData
  );

  // Toolbar components moved to utils/templateUtils.js
  const leftToolbarTemplate = createLeftToolbarTemplate(
    enableSearch,
    enableGlobalFilter,
    globalFilterPlaceholder,
    globalFilterValue,
    handleSearch,
    clearAllFilters,
    // Row expansion buttons
    enableRowExpansion,
    showExpandAllButtons,
    expandAllLabel,
    collapseAllLabel,
    expansionButtonClassName,
    expansionButtonStyle,
    // Expand all handler
    () => {
      const allExpanded = {};
      if (Array.isArray(finalTableData)) {
        finalTableData.forEach(row => {
          const rowKey = row[expansionConfig?.dataKey];
          if (rowKey !== undefined) {
            allExpanded[rowKey] = true;
          }
        });
      }
      setLocalExpandedRows(allExpanded);
      // Call external callback if provided
      if (onRowToggle) {
        onRowToggle({ data: allExpanded });
      }
    },
    // Collapse all handler
    () => {
      setLocalExpandedRows({});
      // Call external callback if provided
      if (onRowToggle) {
        onRowToggle({ data: {} });
      }
    },
    // Size control
    leftToolbarSize || toolbarSize
  );

  const rightToolbarTemplate = createRightToolbarTemplate(
    selectedRows,
    enableBulkActions,
    bulkActions,
    handleBulkAction,
    enablePivotUI,
    isLoadingPivotConfig,
    isPivotEnabled,
    setShowPivotConfig,
    showPivotConfig,
    enableColumnManagement,
    setShowColumnManager,
    showColumnManager,
    enableColumnFilter,
    clearAllFilters,
    enableExport,
    handleExport,
    enableRefresh,
    handleRefresh,
    isRefreshing,
    // NEW: Filter mode toggle
    enableFilterModeToggle,
    filterMode,
    (mode) => setFilterMode(mode),
    // Size control
    rightToolbarSize || toolbarSize
  );

  // Universal row edit completion handler - works with any dataset dynamically
  const handleRowEditComplete = useCallback((event) => {
    // Force blur before processing the save
    if (document.activeElement) {
      document.activeElement.blur();
    }

    const { newData, index } = event;
    if (!Array.isArray(data)) return;

    // Clone the current dataset
    const updated = [...data];

    // Dynamically merge all editable fields, keeping old values if not edited
    updated[index] = {
      ...updated[index],
      ...Object.entries(newData || {}).reduce((acc, [key, val]) => {
        acc[key] = val !== undefined ? val : updated[index][key];
        return acc;
      }, {})
    };

    // Notify Plasmic / parent callback with the full updated dataset
    onRowEditSave?.({
      ...event,
      data: updated
    });
  }, [data, onRowEditSave]);

  // Universal field update handler for card views and inline editing
  const handleFieldUpdate = useCallback((item, fieldKey, newValue) => {
    if (!Array.isArray(data)) return;

    // Find the item index in the data array
    const itemIndex = data.findIndex(row => {
      if (resolvedDataKey) {
        return row[resolvedDataKey] === item[resolvedDataKey];
      }
      return row === item;
    });

    if (itemIndex === -1) return;

    // Create updated data with the new field value
    const updatedData = [...data];
    updatedData[itemIndex] = {
      ...updatedData[itemIndex],
      [fieldKey]: newValue
    };

    // Notify parent (Plasmic) or callback
    if (typeof onRowEditSave === 'function') {
      onRowEditSave({
        newData: updatedData[itemIndex],
        data: item,
        index: itemIndex
      });
    }
  }, [data, onRowEditSave, resolvedDataKey]);

  // Auto-create editors for editable columns based on data type
  const createAutoEditor = useCallback((column) => {
    const columnType = getEffectiveColumnType(column);
    
    if (columnType === 'number') {
      // Check if it's likely a currency/value field
      const isCurrency = column.key.toLowerCase().includes('value') || 
                        column.key.toLowerCase().includes('amount') || 
                        column.key.toLowerCase().includes('price');
      
      return (options) => (
        <InputNumber 
          value={options.value} 
          onValueChange={(e) => options.editorCallback(e.value)}
          onBlur={(e) => options.editorCallback(e.value)} // ensures last edit is saved
          mode="decimal"
          minFractionDigits={isCurrency ? 2 : 0}
          maxFractionDigits={isCurrency ? 2 : 0}
          useGrouping={true}
          style={{ width: "100%" }}
        />
      );
    }
    
    if (columnType === 'date' || columnType === 'datetime') {
      return (options) => (
        <Calendar 
          value={options.value ? new Date(options.value) : null} 
          onChange={(e) => options.editorCallback(e.value)} 
          dateFormat="yy-mm-dd" 
          showIcon 
        />
      );
    }
    
    if (columnType === 'boolean') {
      return (options) => (
        <Checkbox 
          checked={!!options.value} 
          onChange={(e) => options.editorCallback(!!e.checked)} 
        />
      );
    }
    
    if (columnType === 'dropdown' || columnType === 'select' || column.isCategorical) {
      const opts = getUniqueValues(finalTableData, column.key).map(v => ({ label: String(v), value: v }));
      return (options) => (
        <Dropdown 
          value={options.value} 
          options={opts} 
          onChange={(e) => options.editorCallback(e.value)} 
          placeholder="Select..."
        />
      );
    }
    
    // Default to text input with onBlur for better UX
    return (options) => (
      <InputText 
        type={typeof options.value === "number" ? "number" : "text"}
        value={options.value ?? ''} 
        onChange={(e) => options.editorCallback(e.target.value)}
        onBlur={(e) => options.editorCallback(e.target.value)} // ensures last edit is saved
        style={{ width: "100%" }}
      />
    );
  }, [getEffectiveColumnType, finalTableData, getUniqueValues]);

  // Custom row editor functions
  const openCustomRowEditor = useCallback((rowData) => {
    setOriginalRowData({ ...rowData });
    setCustomRowEditData({ ...rowData });
    setShowCustomRowEditor(true);
  }, []);

  const handleCustomRowSave = useCallback(() => {
    if (!customRowEditData || !originalRowData) return;
    
    // Call the same handler as native row editing
    if (typeof onRowEditSave === 'function') {
      const mockEvent = {
        newData: customRowEditData,
        data: originalRowData,
        index: finalTableData.findIndex(row => row[resolvedDataKey] === originalRowData[resolvedDataKey])
      };
      onRowEditSave(mockEvent);
    }
    
    // Close dialog
    setShowCustomRowEditor(false);
    setCustomRowEditData(null);
    setOriginalRowData(null);
  }, [customRowEditData, originalRowData, onRowEditSave, finalTableData, resolvedDataKey]);

  const handleCustomRowCancel = useCallback(() => {
    setShowCustomRowEditor(false);
    setCustomRowEditData(null);
    setOriginalRowData(null);
  }, []);
  
  // Card editing functions
  const handleCardEdit = useCallback((item) => {
    const itemKey = item[resolvedDataKey] || JSON.stringify(item);
    setEditingCards(prev => new Set([...prev, itemKey]));
  }, [resolvedDataKey]);

  const handleCardCancel = useCallback((item) => {
    const itemKey = item[resolvedDataKey] || JSON.stringify(item);
    setEditingCards(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemKey);
      return newSet;
    });
  }, [resolvedDataKey]);

  // Generate editable fields for custom editor
  const customEditorFields = useMemo(() => {
    if (!customRowEditData) return [];
    
    return defaultColumns
      .filter(col => editableColumns.includes(col.key) || col.editable === true)
      .map(col => ({
        key: col.key,
        title: col.title || col.key,
        type: getEffectiveColumnType(col),
        value: customRowEditData[col.key]
      }));
  }, [customRowEditData, defaultColumns, editableColumns, getEffectiveColumnType]);

  // Render Cards View
  const renderCardsView = () => {
    const allData = Array.isArray(finalTableData) ? finalTableData : [];
    // Apply pagination for cards
    const startIndex = (localCurrentPage - 1) * localPageSize;
    const endIndex = startIndex + localPageSize;
    const displayData = enablePagination ? allData.slice(startIndex, endIndex) : allData;
    
    return (
      <div className="cards-container" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1rem', 
        padding: '1rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <style jsx>{`
          @media (max-width: 768px) {
            .cards-container {
              grid-template-columns: 1fr !important;
              padding: 0.25rem !important;
              gap: 0.5rem !important;
              max-width: 100% !important;
            }
            .card-item {
              padding: 0.75rem !important;
              margin: 0 !important;
              max-width: 100% !important;
            }
            .card-item h3 {
              font-size: 0.875rem !important;
              margin-bottom: 0.5rem !important;
            }
            .card-item label {
              font-size: 0.7rem !important;
            }
            .card-item .card-content div {
              font-size: 0.7rem !important;
              padding: 0.125rem 0.25rem !important;
            }
            .card-item button {
              padding: 0.5rem 1rem !important;
              font-size: 0.75rem !important;
            }
          }
          @media (min-width: 769px) and (max-width: 1024px) {
            .cards-container {
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
            }
          }
          @media (min-width: 1025px) {
            .cards-container {
              grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
            }
          }
        `}</style>
        {displayData.map((item, index) => (
          <div 
            key={item[resolvedDataKey] || index} 
            className="card-item" 
            style={{ 
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px', 
              padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden',
              maxWidth: '100%',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)';
            }}
          >
            {/* Card Header - Professional Design */}
            <div style={{ 
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              position: 'relative'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '1.1rem', 
                  fontWeight: '600', 
                  color: '#1f2937',
                  lineHeight: '1.3',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  marginRight: '1rem'
                }}>
                  {item[defaultColumns[0]?.key] || `Record ${startIndex + index + 1}`}
                </h3>
                
                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                   {/* Edit/Done Button - only show when editMode is row */}
                   {editMode === 'row' && (
                     <Button
                       icon={editingCards.has(item[resolvedDataKey] || JSON.stringify(item)) ? "pi pi-check" : "pi pi-pencil"}
                       className="p-button-text p-button-sm"
                       onClick={(e) => {
                         e.stopPropagation();
                         if (editingCards.has(item[resolvedDataKey] || JSON.stringify(item))) {
                           handleCardCancel(item);
                         } else {
                           handleCardEdit(item);
                         }
                       }}
                       tooltip={editingCards.has(item[resolvedDataKey] || JSON.stringify(item)) ? "Done Editing" : "Edit Record"}
                       style={{ 
                         color: editingCards.has(item[resolvedDataKey] || JSON.stringify(item)) ? '#059669' : '#3b82f6',
                         padding: '0.5rem',
                         borderRadius: '6px',
                         width: '2.5rem',
                         height: '2.5rem',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         transition: 'all 0.2s ease',
                         backgroundColor: 'transparent',
                         border: editingCards.has(item[resolvedDataKey] || JSON.stringify(item)) ? '1px solid #a7f3d0' : '1px solid #dbeafe'
                       }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.backgroundColor = editingCards.has(item[resolvedDataKey] || JSON.stringify(item)) ? '#ecfdf5' : '#eff6ff';
                         e.currentTarget.style.borderColor = editingCards.has(item[resolvedDataKey] || JSON.stringify(item)) ? '#6ee7b7' : '#93c5fd';
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.backgroundColor = 'transparent';
                         e.currentTarget.style.borderColor = editingCards.has(item[resolvedDataKey] || JSON.stringify(item)) ? '#a7f3d0' : '#dbeafe';
                       }}
                     />
                   )}
                   
                   
                   {/* Delete Button - only show when not editing */}
                   {!editingCards.has(item[resolvedDataKey] || JSON.stringify(item)) && (
                     <Button
                       icon="pi pi-trash"
                       className="p-button-text p-button-sm"
                       onClick={(e) => {
                         e.stopPropagation();
                         // Handle delete action
                         if (onRowDelete) {
                           onRowDelete({ data: item });
                         }
                       }}
                       tooltip="Delete Record"
                       style={{ 
                         color: '#dc2626',
                         padding: '0.5rem',
                         borderRadius: '6px',
                         width: '2.5rem',
                         height: '2.5rem',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         transition: 'all 0.2s ease',
                         backgroundColor: 'transparent',
                         border: '1px solid #fecaca'
                       }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.backgroundColor = '#fef2f2';
                         e.currentTarget.style.borderColor = '#fca5a5';
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.backgroundColor = 'transparent';
                         e.currentTarget.style.borderColor = '#fecaca';
                       }}
                     />
                   )}
                 </div>
              </div>
            </div>
            
            {/* Card Content - 2x2 Grid Layout with Inline Editing */}
            <div className="card-content" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              {/* Row 1 - CONSUMED */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textAlign: 'center',
                  padding: '0.5rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0'
                }}>
                  CONSUMED
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem'
                }}>
                  {defaultColumns.slice(1, 3).map((column) => {
                const value = item[column.key];
                const isNumber = typeof value === 'number';
                const isHighValue = isNumber && value > 1000;
                const itemKey = item[resolvedDataKey] || JSON.stringify(item);
                const isCardEditing = editingCards.has(itemKey);
                const isEditable = editMode === 'row' && editableColumns.includes(column.key) && isCardEditing;
                const columnType = getEffectiveColumnType(column);
                
                return (
                  <div key={column.key} style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0.75rem',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    minHeight: '70px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                  }}>
                    <label style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: '600', 
                      color: '#6b7280',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.025em',
                      textAlign: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%'
                    }}>
                      {column.title}
                    </label>
                    
                    {/* Inline Editor */}
                    {isEditable ? (
                      <div style={{ flex: 1 }}>
                        {columnType === 'number' ? (
                            <InputNumber
                             value={value || 0}
                             onValueChange={(e) => {
                               // Use universal field update handler
                               handleFieldUpdate(item, column.key, e.value);
                             }}
                            style={{
                              width: '100%',
                              textAlign: 'center',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              fontFamily: 'monospace'
                            }}
                            inputStyle={{
                              textAlign: 'center',
                              padding: '0.375rem',
                              backgroundColor: isHighValue ? '#dbeafe' : '#ffffff',
                              border: isHighValue ? '2px solid #3b82f6' : '1px solid #d1d5db',
                              borderRadius: '6px',
                              boxShadow: isHighValue ? '0 2px 4px rgba(59, 130, 246, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
                              fontSize: '0.8rem',
                              minHeight: '2rem',
                              maxWidth: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          />
                        ) : columnType === 'date' ? (
                          <Calendar
                            value={value ? new Date(value) : null}
                            onChange={(e) => {
                              // Use universal field update handler
                              handleFieldUpdate(item, column.key, e.value);
                            }}
                            style={{
                              width: '100%'
                            }}
                            inputStyle={{
                              textAlign: 'center',
                              padding: '0.375rem',
                              backgroundColor: isHighValue ? '#dbeafe' : '#ffffff',
                              border: isHighValue ? '2px solid #3b82f6' : '1px solid #d1d5db',
                              borderRadius: '6px',
                              boxShadow: isHighValue ? '0 2px 4px rgba(59, 130, 246, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
                              fontSize: '0.8rem',
                              minHeight: '2rem',
                              maxWidth: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          />
                        ) : columnType === 'boolean' ? (
                          <Checkbox
                            checked={!!value}
                            onChange={(e) => {
                              // Use universal field update handler
                              handleFieldUpdate(item, column.key, e.checked);
                            }}
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              height: '100%'
                            }}
                          />
                        ) : (
                          <InputText
                            value={safeCell(value)}
                            onChange={(e) => {
                              // Use universal field update handler
                              handleFieldUpdate(item, column.key, e.target.value);
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'center',
                              fontSize: '0.8rem',
                              fontWeight: '500',
                              padding: '0.375rem',
                              backgroundColor: isHighValue ? '#dbeafe' : '#ffffff',
                              border: isHighValue ? '2px solid #3b82f6' : '1px solid #d1d5db',
                              borderRadius: '6px',
                              boxShadow: isHighValue ? '0 2px 4px rgba(59, 130, 246, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
                              minHeight: '2rem',
                              maxWidth: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      /* Read-only display */
                      <div style={{ 
                        fontSize: '0.8rem',
                        fontWeight: isNumber ? '700' : '500',
                        color: isNumber ? '#1e293b' : '#374151',
                        padding: '0.375rem',
                        backgroundColor: isHighValue ? '#dbeafe' : '#ffffff',
                        borderRadius: '6px',
                        border: isHighValue ? '2px solid #3b82f6' : '1px solid #d1d5db',
                        fontFamily: isNumber ? 'monospace' : 'inherit',
                        textAlign: 'center',
                        boxShadow: isHighValue ? '0 2px 4px rgba(59, 130, 246, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%',
                        minHeight: '2rem'
                      }}>
                        {isNumber && value > 1000 ? value.toLocaleString() : safeCell(value)}
                      </div>
                    )}
                  </div>
                );
              })}
                </div>
              </div>
              
              {/* Row 2 - CLOSING */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textAlign: 'center',
                  padding: '0.5rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0'
                }}>
                  CLOSING
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem'
                }}>
                  {defaultColumns.slice(3, 5).map((column) => {
                    const value = item[column.key];
                    const isNumber = typeof value === 'number';
                    const isHighValue = isNumber && value > 1000;
                    const itemKey = item[resolvedDataKey] || JSON.stringify(item);
                    const isCardEditing = editingCards.has(itemKey);
                    const isEditable = editMode === 'row' && editableColumns.includes(column.key) && isCardEditing;
                    const columnType = getEffectiveColumnType(column);
                    
                    return (
                      <div key={column.key} style={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '0.75rem',
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        minHeight: '70px',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                      }}>
                        <label style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: '600', 
                          color: '#6b7280',
                          marginBottom: '0.5rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.025em',
                          textAlign: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%'
                        }}>
                          {column.title}
                        </label>
                        
                        {/* Inline Editor */}
                        {isEditable ? (
                          <div style={{ flex: 1 }}>
                            {columnType === 'number' ? (
                              <InputNumber
                                value={value || 0}
                                onValueChange={(e) => {
                                  // Use universal field update handler
                                  handleFieldUpdate(item, column.key, e.value);
                                }}
                                style={{
                                  width: '100%',
                                  textAlign: 'center',
                                  fontSize: '0.8rem',
                                  fontWeight: '700',
                                  fontFamily: 'monospace'
                                }}
                                inputStyle={{
                                  textAlign: 'center',
                                  padding: '0.375rem',
                                  backgroundColor: isHighValue ? '#dbeafe' : '#ffffff',
                                  border: isHighValue ? '2px solid #3b82f6' : '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  boxShadow: isHighValue ? '0 2px 4px rgba(59, 130, 246, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
                                  fontSize: '0.8rem',
                                  minHeight: '2rem',
                                  maxWidth: '100%',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              />
                            ) : (
                                <InputText
                                 value={value || ''}
                                 onChange={(e) => {
                                   // Use universal field update handler
                                   handleFieldUpdate(item, column.key, e.target.value);
                                 }}
                                style={{
                                  width: '100%',
                                  textAlign: 'center',
                                  padding: '0.375rem',
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  fontSize: '0.8rem',
                                  minHeight: '2rem',
                                  maxWidth: '100%',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              />
                            )}
                          </div>
                        ) : (
                          <div style={{ 
                            fontSize: '0.8rem',
                            fontWeight: isNumber ? '700' : '500',
                            color: isNumber ? '#1e293b' : '#374151',
                            padding: '0.375rem',
                            backgroundColor: isHighValue ? '#dbeafe' : '#ffffff',
                            borderRadius: '6px',
                            border: isHighValue ? '2px solid #3b82f6' : '1px solid #d1d5db',
                            fontFamily: isNumber ? 'monospace' : 'inherit',
                            textAlign: 'center',
                            boxShadow: isHighValue ? '0 2px 4px rgba(59, 130, 246, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%',
                            minHeight: '2rem'
                          }}>
                            {isNumber && value > 1000 ? value.toLocaleString() : safeCell(value)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
          </div>
        ))}
      </div>
    );
  };

  // Render Form View (like your second image - clean forms)
  const renderFormView = () => {
    const allData = Array.isArray(finalTableData) ? finalTableData : [];
    // Apply pagination for forms
    const startIndex = (localCurrentPage - 1) * localPageSize;
    const endIndex = startIndex + localPageSize;
    const displayData = enablePagination ? allData.slice(startIndex, endIndex) : allData;
    
    return (
      <div className="forms-container" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1rem', 
        padding: '1rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <style jsx>{`
          @media (max-width: 768px) {
            .forms-container {
              grid-template-columns: 1fr !important;
              padding: 0.25rem !important;
              gap: 0.5rem !important;
              max-width: 100% !important;
            }
            .form-item {
              padding: 0.5rem !important;
              margin: 0 !important;
              max-width: 100% !important;
              width: 95% !important;
            }
            .form-item .form-fields-grid {
              grid-template-columns: 1fr !important;
              gap: 0.25rem !important;
            }
            .form-item h4 {
              font-size: 0.8rem !important;
              margin-bottom: 0.375rem !important;
              padding-bottom: 0.5rem !important;
            }
            .form-field label {
              font-size: 0.65rem !important;
              margin-bottom: 0.125rem !important;
            }
            .form-field div {
              padding: 0.35rem 0.375rem !important;
              font-size: 0.65rem !important;
              min-height: 1.8rem !important;
            }
            .form-item button {
              padding: 0.375rem 0.75rem !important;
              font-size: 0.85rem !important;
            }
          }
          @media (min-width: 769px) and (max-width: 1024px) {
            .forms-container {
              grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)) !important;
            }
            .form-item .form-fields-grid {
              grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)) !important;
            }
          }
          @media (min-width: 1025px) {
            .forms-container {
              grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
            }
            .form-item .form-fields-grid {
              grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) !important;
            }
          }
        `}</style>
        {displayData.map((item, index) => (
          <div 
            key={item[resolvedDataKey] || index} 
            className="form-item" 
            style={{ 
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0', 
              borderRadius: '8px', 
              padding: '1rem',
              boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s ease',
              position: 'relative',
              maxWidth: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
          >
            {/* Form Header */}
            <div style={{ 
              borderBottom: '2px solid #3b82f6', 
              paddingBottom: '0.75rem', 
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h4 style={{ 
                margin: 0, 
                fontSize: '1rem', 
                fontWeight: '700', 
                color: '#1e293b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                marginRight: '0.5rem'
              }}>
                {item[defaultColumns[0]?.key] || `Record ${startIndex + index + 1}`}
              </h4>
              
              <Button
                icon="pi pi-trash"
                className="p-button-text p-button-sm p-button-rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle delete action
                  if (onRowDelete) {
                    onRowDelete({ data: item });
                  }
                }}
                tooltip="Delete Record"
                style={{ 
                  color: '#dc2626',
                  padding: '0.5rem'
                }}
              />
            </div>
            
            {/* Form Fields Grid - 2x2 Layout with Inline Editing */}
            <div className="form-fields-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              {defaultColumns.slice(1, 5).map((column) => {
                const value = item[column.key];
                const isNumber = typeof value === 'number';
                const isHighValue = isNumber && value > 1000;
                const itemKey = item[resolvedDataKey] || JSON.stringify(item);
                const isCardEditing = editingCards.has(itemKey);
                const isEditable = editMode === 'row' && editableColumns.includes(column.key) && isCardEditing;
                const columnType = getEffectiveColumnType(column);
                
                return (
                  <div key={column.key} className="form-field" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0.75rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease',
                    minHeight: '80px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                  }}>
                    <label style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: '600', 
                      color: '#6b7280',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.025em',
                      textAlign: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%'
                    }}>
                      {column.title}
                    </label>
                    
                    {/* Inline Editor */}
                    {isEditable ? (
                      <div style={{ flex: 1 }}>
                        {columnType === 'number' ? (
                          <InputNumber
                            value={value || 0}
                            onValueChange={(e) => {
                              // Use universal field update handler
                              handleFieldUpdate(item, column.key, e.value);
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'center',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              fontFamily: 'monospace'
                            }}
                            inputStyle={{
                              textAlign: 'center',
                              padding: '0.375rem',
                              backgroundColor: isHighValue ? '#dbeafe' : '#ffffff',
                              border: isHighValue ? '2px solid #3b82f6' : '1px solid #d1d5db',
                              borderRadius: '6px',
                              boxShadow: isHighValue ? '0 2px 4px rgba(59, 130, 246, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
                              fontSize: '0.8rem',
                              minHeight: '2rem',
                              maxWidth: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          />
                        ) : columnType === 'date' ? (
                          <Calendar
                            value={value ? new Date(value) : null}
                            onChange={(e) => {
                              // Use universal field update handler
                              handleFieldUpdate(item, column.key, e.value);
                            }}
                            style={{
                              width: '100%'
                            }}
                            inputStyle={{
                              textAlign: 'center',
                              padding: '0.375rem',
                              backgroundColor: isHighValue ? '#dbeafe' : '#ffffff',
                              border: isHighValue ? '2px solid #3b82f6' : '1px solid #d1d5db',
                              borderRadius: '6px',
                              boxShadow: isHighValue ? '0 2px 4px rgba(59, 130, 246, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
                              fontSize: '0.8rem',
                              minHeight: '2rem',
                              maxWidth: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          />
                        ) : columnType === 'boolean' ? (
                          <Checkbox
                            checked={!!value}
                            onChange={(e) => {
                              // Use universal field update handler
                              handleFieldUpdate(item, column.key, e.checked);
                            }}
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              height: '100%'
                            }}
                          />
                        ) : (
                          <InputText
                            value={safeCell(value)}
                            onChange={(e) => {
                              // Use universal field update handler
                              handleFieldUpdate(item, column.key, e.target.value);
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'center',
                              fontSize: '0.8rem',
                              fontWeight: '500',
                              padding: '0.375rem',
                              backgroundColor: isHighValue ? '#dbeafe' : '#ffffff',
                              border: isHighValue ? '2px solid #3b82f6' : '1px solid #d1d5db',
                              borderRadius: '6px',
                              boxShadow: isHighValue ? '0 2px 4px rgba(59, 130, 246, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
                              minHeight: '2rem',
                              maxWidth: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      /* Read-only display */
                      <div style={{ 
                        padding: '0.375rem',
                        border: '1px solid #d1d5db', 
                        borderRadius: '6px',
                        backgroundColor: isHighValue ? '#dbeafe' : '#ffffff',
                        minHeight: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: isNumber ? '700' : '500',
                        color: isNumber ? '#1e293b' : '#374151',
                        fontFamily: isNumber ? 'monospace' : 'inherit',
                        borderLeft: isHighValue ? '3px solid #3b82f6' : '3px solid transparent',
                        transition: 'all 0.2s ease',
                        boxShadow: isHighValue ? '0 2px 4px rgba(59, 130, 246, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%'
                      }}>
                        {isNumber && value > 1000 ? value.toLocaleString() : safeCell(value)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
          </div>
        ))}
      </div>
    );
  };


  // Common filter toolbar for column grouping
  const commonFilterToolbarTemplate = useCallback(() => {
    if (!enableColumnGrouping || !finalColumnStructure.hasGroups || !enableColumnFilter) {
      return null;
    }

    // Get all available columns for filtering
    const availableColumns = defaultColumns.filter(col => col.filterable !== false);
    const fieldOptions = [
      { label: 'Select field to filter...', value: '' },
      ...availableColumns.map(col => ({
        label: col.title,
        value: col.key
      }))
    ];

    // Handle common filter field change
    const handleCommonFilterFieldChange = (selectedField) => {
      setCommonFilterField(selectedField);
      setCommonFilterValue('');
      
      // Clear any existing filter for this field
      if (selectedField) {
        const newFilters = { ...filters };
        delete newFilters[selectedField];
        
        // Apply filters and trigger the filtering mechanism
        setFilters(newFilters);
        
        // Manually trigger the filter event to ensure DataTable processes the filter
        const filterEvent = {
          filters: newFilters,
          filteredValue: applyFiltersToData(finalTableData, newFilters)
        };
        
        // Update filtered data for totals calculation
        if (enableFooterTotals) {
          const validFilteredRows = filterEvent.filteredValue.filter(row => row && typeof row === 'object');
          setFilteredDataForTotals(validFilteredRows);
        }
        
        // Call onFilterChange if provided
        if (onFilterChange) {
          onFilterChange(newFilters);
        }
      }
    };

    // Handle common filter value change and apply filter
    const handleCommonFilterValueChange = (value) => {
      setCommonFilterValue(value);
      
      if (commonFilterField) {
        const selectedColumn = defaultColumns.find(col => col.key === commonFilterField);
        if (selectedColumn) {
          const newFilters = { ...filters };
          
          if (value === null || value === '' || value === undefined) {
            // Clear filter
            delete newFilters[commonFilterField];
          } else {
            // Set filter based on column type
            const columnType = getColumnType(selectedColumn);
            let matchMode = FilterMatchMode.CONTAINS;
            
            if (['dropdown', 'select', 'categorical'].includes(columnType)) {
              matchMode = FilterMatchMode.EQUALS;
            } else if (['date', 'datetime'].includes(columnType)) {
              matchMode = FilterMatchMode.BETWEEN;
            } else if (columnType === 'number') {
              matchMode = FilterMatchMode.EQUALS;
            } else if (columnType === 'boolean') {
              matchMode = FilterMatchMode.EQUALS;
            }
            
            newFilters[commonFilterField] = {
              operator: FilterOperator.AND,
              constraints: [{ value: value, matchMode: matchMode }]
            };
          }
          
          // Apply filters and trigger the filtering mechanism
          setFilters(newFilters);
          
          // Manually trigger the filter event to ensure DataTable processes the filter
          const filterEvent = {
            filters: newFilters,
            filteredValue: applyFiltersToData(finalTableData, newFilters)
          };
          
          // Update filtered data for totals calculation
          if (enableFooterTotals) {
            const validFilteredRows = filterEvent.filteredValue.filter(row => row && typeof row === 'object');
            setFilteredDataForTotals(validFilteredRows);
          }
          
          // Call onFilterChange if provided
          if (onFilterChange) {
            onFilterChange(newFilters);
          }
        }
      }
    };

    // Clear common filter
    const clearCommonFilter = () => {
      if (commonFilterField) {
        const newFilters = { ...filters };
        delete newFilters[commonFilterField];
        
        // Apply filters and trigger the filtering mechanism
        setFilters(newFilters);
        
        // Manually trigger the filter event to ensure DataTable processes the filter
        const filterEvent = {
          filters: newFilters,
          filteredValue: applyFiltersToData(finalTableData, newFilters)
        };
        
        // Update filtered data for totals calculation
        if (enableFooterTotals) {
          const validFilteredRows = filterEvent.filteredValue.filter(row => row && typeof row === 'object');
          setFilteredDataForTotals(validFilteredRows);
        }
        
        // Call onFilterChange if provided
        if (onFilterChange) {
          onFilterChange(newFilters);
        }
      }
      setCommonFilterField('');
      setCommonFilterValue('');
    };

    // Get the appropriate filter element for the selected field
      const getCommonFilterElement = () => {
      if (!commonFilterField) return null;
      
      const selectedColumn = defaultColumns.find(col => col.key === commonFilterField);
      if (!selectedColumn) return null;

        const columnType = getEffectiveColumnType(selectedColumn);
        const filterOptions = getFilterOptions(finalTableData, selectedColumn.key, customFilterOptions);
        return createFilterElement(columnType, commonFilterValue, handleCommonFilterValueChange, selectedColumn, filterOptions);
    };

    return (
      <div 
        className="flex align-items-center gap-3 p-3 border-round surface-50 mb-3"
        style={{}}
      >
        <i className="pi pi-filter text-primary"></i>
        <span 
          className="font-semibold text-primary"
          style={{}}
        >
          Common Filter:
        </span>
        
        <Dropdown
          value={commonFilterField}
          options={fieldOptions}
          onChange={(e) => handleCommonFilterFieldChange(e.value)}
          placeholder="Select field to filter..."
          className="w-12rem"
          showClear={false}
          style={{}}
        />
        
        {commonFilterField && (
          <div className="flex align-items-center gap-2">
            {getCommonFilterElement()}
            <Button
              icon="pi pi-times"
              onClick={clearCommonFilter}
              className="p-button-text p-button-sm p-button-danger"
              tooltip="Clear this filter"
              tooltipOptions={{ position: 'top' }}
              style={{}}
            />
          </div>
        )}
      </div>
    );
  }, [
    enableColumnGrouping, 
    finalColumnStructure.hasGroups, 
    enableColumnFilter, 
    defaultColumns, 
    commonFilterField, 
    commonFilterValue, 
    filters, 
    finalTableData, 
    enableFooterTotals, 
    onFilterChange, 
    getColumnType, 
    getColumnFilterElement, 
    applyFiltersToData, 
    setFilteredDataForTotals
  ]);

  // NEW: Custom Row Filters (external UI aligned like a row of inputs)
  const applyCustomRowFilter = useCallback((selectedColumn, value) => {
    if (!selectedColumn) return;
    const columnKey = selectedColumn.key;

    setCustomRowFilters(prev => ({ ...prev, [columnKey]: value }));

    // Build/clear filter entry for this column
    const columnType = getEffectiveColumnType(selectedColumn);
    let matchMode = FilterMatchMode.CONTAINS;
    if (['dropdown', 'select', 'categorical', 'boolean'].includes(columnType)) matchMode = FilterMatchMode.EQUALS;
    else if (columnType === 'number') matchMode = FilterMatchMode.EQUALS;
    else if (columnType === 'date' || columnType === 'datetime') matchMode = FilterMatchMode.DATE_IS;

    const newFilters = { ...filters };
    if (value === undefined || value === null || value === '') {
      delete newFilters[columnKey];
    } else {
      newFilters[columnKey] = {
        operator: FilterOperator.AND,
        constraints: [{ value, matchMode }]
      };
    }

    setFilters(newFilters);

    // Also update totals cache immediately
    const filteredRows = applyFiltersToData(finalTableData, newFilters).filter(r => r && typeof r === 'object');
    setFilteredDataForTotals(filteredRows);
  }, [filters, setFilters, getEffectiveColumnType, finalTableData, applyFiltersToData, setFilteredDataForTotals]);

  const customRowFiltersToolbar = useCallback(() => {
    if (!(enableFilterModeToggle && filterMode === 'custom')) return null;

    // Choose which columns to show in custom row filter
    let targetColumns = [];
    if (Array.isArray(customRowFilterColumns) && customRowFilterColumns.length > 0) {
      const keys = new Set(customRowFilterColumns);
      targetColumns = defaultColumns.filter(c => keys.has(c.key));
    } else {
      targetColumns = defaultColumns.filter(c => c.filterable !== false);
    }

    if (targetColumns.length === 0) return null;

    return (
      <div className="p-3 surface-50 border-round mb-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
        {targetColumns.map((col) => {
          const columnType = getEffectiveColumnType(col);
          const filterOptions = getFilterOptions(finalTableData, col.key, customFilterOptions);
          const value = customRowFilters[col.key];
          return (
            <div key={col.key} className="flex flex-column gap-1">
              <label className="text-xs text-600" style={{ fontWeight: 600 }}>{col.title}</label>
              {createFilterElement(
                columnType,
                value,
                (val) => applyCustomRowFilter(col, val),
                col,
                filterOptions
              )}
            </div>
          );
        })}
      </div>
    );
  }, [enableFilterModeToggle, filterMode, customRowFilterColumns, defaultColumns, getEffectiveColumnType, finalTableData, customFilterOptions, customRowFilters, applyCustomRowFilter, getFilterOptions]);

  // Column grouping handlers - extracted to utils/columnGroupingUtils.js
  const {
    generateColumnGroups,
    generateFooterGroups,
    createColumnGroup
  } = createColumnGroupingHandlers({
    enableColumnGrouping,
    finalColumnStructure,
    enableSorting,
    enableColumnFilter,
    getColumnFilterElement,
    defaultColumns,
    groupConfig,
    footerColumnGroup,
    effectiveTotalSettings,
    footerTemplate
  });
  
  // Row expansion is now handled by the expansionConfig utility function above
  
  // Performance gate: avoid mounting heavy table until it is in/near viewport
  if (deferRenderUntilVisible && !isVisible) {
    return (
      <div ref={rootRef} className={className} style={{ minHeight: minPlaceholderHeight, ...style }} />
    );
  }

  // Loading and error states
  if (isLoading) {
    return (
      <div className={className} style={style}>
        <div>
          <RefreshCw size={24} className="animate-spin" />
          Loading data...
        </div>
      </div>
    );
  }

  if (tableError) {
    return (
      <div className={className} style={style}>
        <div>
          <X size={24} />
          Error: {tableError}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={className} 
      style={style}
    >

      

      
      {/* Custom Toolbar Sizing CSS */}
        <style jsx>{`
        /* Small Size */
        .toolbar-small .p-inputtext {
          padding: 0.25rem 0.5rem !important;
          font-size: 0.75rem !important;
          height: 2rem !important;
        }
        .toolbar-small .p-button {
          padding: 0.25rem 0.5rem !important;
          font-size: 0.75rem !important;
          height: 2rem !important;
        }
        .toolbar-small .p-button-icon {
          font-size: 0.75rem !important;
        }
        .toolbar-small .p-button-label {
          font-size: 0.75rem !important;
        }
        
        /* Normal Size */
        .toolbar-normal .p-inputtext {
          padding: 0.5rem 0.75rem !important;
          font-size: 0.875rem !important;
          height: 2.5rem !important;
        }
        .toolbar-normal .p-button {
          padding: 0.5rem 0.75rem !important;
          font-size: 0.875rem !important;
          height: 2.5rem !important;
        }
        .toolbar-normal .p-button-icon {
          font-size: 0.875rem !important;
        }
        .toolbar-normal .p-button-label {
          font-size: 0.875rem !important;
        }
        
        /* Large Size */
        .toolbar-large .p-inputtext {
          padding: 0.75rem 1rem !important;
          font-size: 1rem !important;
          height: 3rem !important;
        }
        .toolbar-large .p-button {
          padding: 0.75rem 1rem !important;
          font-size: 1rem !important;
          height: 3rem !important;
        }
        .toolbar-large .p-button-icon {
          font-size: 1rem !important;
        }
        .toolbar-large .p-button-label {
          font-size: 1rem !important;
        }
        
        /* Edit Mode Overflow Handling */
        .p-datatable-overflow-hidden {
          overflow: hidden !important;
        }
        
        .p-datatable-overflow-hidden .p-datatable-tbody > tr > td {
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
          max-width: 200px !important;
        }
        
        .p-datatable-overflow-hidden .p-datatable-tbody > tr.p-row-editor > td {
          overflow: visible !important;
          white-space: normal !important;
          max-width: none !important;
        }
        
        .p-datatable-overflow-hidden .p-datatable-tbody > tr.p-row-editor > td .p-inputtext,
        .p-datatable-overflow-hidden .p-datatable-tbody > tr.p-row-editor > td .p-inputnumber,
        .p-datatable-overflow-hidden .p-datatable-tbody > tr.p-row-editor > td .p-calendar,
        .p-datatable-overflow-hidden .p-datatable-tbody > tr.p-row-editor > td .p-dropdown {
              width: 100% !important;
          min-width: 120px !important;
          max-width: 250px !important;
        }
        
      `}</style>

      {/* Conditional Toolbar based on viewMode */}
      {viewMode === 'table' ? (
        <>
          {/* Full Toolbar for Table View */}
      <Toolbar
        left={leftToolbarTemplate}
        right={rightToolbarTemplate}
        className={`mb-4 toolbar-${leftToolbarSize || toolbarSize}`}
            style={{}}
      />
      {/* Common Filter Toolbar for Column Grouping */}
      {commonFilterToolbarTemplate()}
      {/* NEW: Custom Row Filters Toolbar */}
      {customRowFiltersToolbar()}
        </>
      ) : enableToolbarInCardForm ? (
        <>
          {/* Full Toolbar for Card/Form Views (when enabled) */}
      <Toolbar
        left={leftToolbarTemplate}
        right={rightToolbarTemplate}
        className={`mb-4 toolbar-${leftToolbarSize || toolbarSize}`}
            style={{}}
      />
      {/* Common Filter Toolbar for Column Grouping */}
      {commonFilterToolbarTemplate()}
      {/* NEW: Custom Row Filters Toolbar */}
      {customRowFiltersToolbar()}
        </>
      ) : null}

      {/* Conditional Content based on viewMode */}
      {viewMode === 'cards' && (
        <>
          {renderCardsView()}
          {enablePagination && (
            <Paginator
              first={(localCurrentPage - 1) * localPageSize}
              rows={localPageSize}
              totalRecords={Array.isArray(finalTableData) ? finalTableData.length : 0}
              rowsPerPageOptions={pageSizeOptions}
              onPageChange={handlePageChange}
              className="mt-4"
            />
          )}
        </>
      )}
      {viewMode === 'form' && (
        <>
          {renderFormView()}
          {enablePagination && (
            <Paginator
              first={(localCurrentPage - 1) * localPageSize}
              rows={localPageSize}
              totalRecords={Array.isArray(finalTableData) ? finalTableData.length : 0}
              rowsPerPageOptions={pageSizeOptions}
              onPageChange={handlePageChange}
              className="mt-4"
            />
          )}
        </>
      )}
      
      {/* Mobile Responsive CSS - Removed, using PrimeReact native responsiveLayout */}
      

      {/* Small-size density tweaks - Disabled, using native PrimeReact size prop */}
      
      


      
      {/* DataTable - Only render for table view */}
      {viewMode === 'table' && (
      <DataTable
        key={`datatable-${Array.isArray(finalTableData) ? finalTableData.length : 0}-${isPivotEnabled ? 'pivot' : 'normal'}`} // HYDRATION FIX: Force re-render on data structure changes
        value={Array.isArray(finalTableData) ? finalTableData : []} // CRITICAL: Final safety check before DataTable
        loading={isLoading}
        editMode={editMode}
        dataKey={resolvedDataKey} // REQUIRED for cell/row editing to work
        filters={filters}
        filterDisplay={
          isNativeRowFilterActive
            ? (enableColumnGrouping && finalColumnStructure.hasGroups && !forceFilterDisplayWithGrouping
                ? "row"
                : filterDisplay)
            : "menu"
        }
        globalFilterFields={(() => {
          const fields = globalFilterFields.length > 0 ? globalFilterFields : defaultColumns.map(col => col.key);

          return fields;
        })()}
        globalFilter={globalFilterValue}
        emptyMessage="No data found matching the filter criteria"
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        onFilter={(e) => {
          // Update filters first
          handleFilter(e);
          

          
          // Update filtered data for totals calculation
          if (enableFooterTotals || (pivotTransformation.isPivot && effectiveTotalSettings.showPivotTotals)) {
            // Get the filtered data from PrimeReact event
            let filteredRows = finalTableData;
            
            // Try to get filtered data from various event properties
            if (e.filteredValue && Array.isArray(e.filteredValue)) {
              filteredRows = e.filteredValue;
            } else if (e.value && Array.isArray(e.value)) {
              filteredRows = e.value;
            } else if (e.data && Array.isArray(e.data)) {
              filteredRows = e.data;
            } else {
              // Apply filters manually using the updated filters
              filteredRows = applyFiltersToData(finalTableData, e.filters);
            }
            
            // Ensure filtered rows are valid objects
            const validFilteredRows = filteredRows.filter(row => row && typeof row === 'object');
            setFilteredDataForTotals(validFilteredRows);
            
            // CRITICAL FIX: Don't override global filter for grand total!
            // Only update grand total if there's no global filter active
            if (!globalFilterValue || globalFilterValue.trim() === '') {
              setFilteredDataForGrandTotal(validFilteredRows);
            }
          }
        }}
        onRowClick={onRowClick ? (e) => onRowClick(e.data, e.index) : undefined}
        selection={enableRowSelection ? selectedRows : null}
        onSelectionChange={enableRowSelection ? handleRowSelect : undefined}
        // ✅ expansion wiring
        {...(() => {
          // When row grouping is enabled, PrimeReact expects expandedRows to be an ARRAY (group keys),
          // but for row expansion with dataKey it expects an OBJECT map. Passing the wrong shape causes
          // `(e || []).findIndex is not a function`. Guard based on grouping state.
          const isRowGroupingActive = !!enableRowGrouping;
          if (isRowGroupingActive) {
            // Row grouping expansion uses an ARRAY of group keys
            return { expandedRows: [] };
          }

          // Only wire row expansion props when explicitly enabled
          if (enableRowExpansion && expansionConfig) {
            return {
              dataKey: expansionConfig?.dataKey,
              expandedRows: localExpandedRows || {},
              onRowToggle: handleRowToggle,
              rowExpansionTemplate: expansionConfig?.rowExpansionTemplate
            };
          }

          // Neither grouping nor expansion is active; don't pass expansion props
          return {};
        })()}
        paginator={enablePagination}
        rows={localPageSize}
        rowsPerPageOptions={pageSizeOptions}
        onPage={handlePageChange}
        first={(localCurrentPage - 1) * localPageSize}
        totalRecords={Array.isArray(finalTableData) ? finalTableData.length : 0}
        showGridlines={enableGridLines}
        stripedRows={enableStripedRows}
        size={tableSize}
        responsiveLayout={responsiveLayout}
        showFirstLastIcon={showFirstLastIcon}
        showPageLinks={showPageLinks}
        showCurrentPageReport={showCurrentPageReport}
        currentPageReportTemplate={currentPageReportTemplate}
        filterDelay={filterDelay}
        globalFilterPlaceholder={globalFilterPlaceholder}
        filterLocale={filterLocale}
        editingRows={editMode ? localEditingRows : undefined}
        onRowEditComplete={editMode ? handleRowEditComplete : undefined}
        onRowEditSave={editMode ? handleRowEditSave : undefined}
        onRowEditCancel={editMode ? handleRowEditCancel : undefined}
        onRowEditInit={editMode ? handleRowEditInit : undefined}
        onEditingRowsChange={editMode ? handleEditingRowsChange : undefined}
        contextMenu={enableContextMenu ? contextMenu : undefined}
        contextMenuSelection={enableContextMenu ? localContextMenuSelection : undefined}
        onContextMenuSelectionChange={enableContextMenu ? handleContextMenuSelectionChange : undefined}
        onContextMenu={enableContextMenu ? handleContextMenu : undefined}
        selectionMode={enableRowSelection ? selectionMode : undefined}
        metaKeySelection={enableRowSelection ? metaKeySelection : undefined}
        selectOnEdit={enableRowSelection ? selectOnEdit : undefined}
        resizableColumns={enableResizableColumns}
        reorderableColumns={enableReorderableColumns}
        virtualScrollerOptions={
          enableVirtualScrolling || (Array.isArray(finalTableData) && finalTableData.length > 1000) ? 
          { 
            itemSize: 46,
            numToleratedItems: (Array.isArray(finalTableData) && finalTableData.length > 5000) ? 10 : 5,
            delay: (Array.isArray(finalTableData) && finalTableData.length > 10000) ? 150 : 0
          } : undefined
        }
        lazy={enableLazyLoading || (Array.isArray(finalTableData) && finalTableData.length > 2000)}
        rowGroupMode={enableRowGrouping ? 'subheader' : undefined}
        expandableRowGroups={enableRowGrouping}
        frozenColumns={enableFrozenColumns ? 1 : undefined}
        frozenRows={enableFrozenRows ? 1 : undefined}
        showFilterMatchModes={showFilterMatchModes}
        headerColumnGroup={enableColumnGrouping ? (headerColumnGroup || generateColumnGroups()) : undefined}
        footerColumnGroup={enableColumnGrouping ? (footerColumnGroup || generateFooterGroups()) : undefined}
        style={{
          overflow: 'hidden'
        }}
        className="p-datatable-overflow-hidden"

      >
        {enableRowSelection && (
          <Column
            selectionMode="multiple"
            frozen={enableFrozenColumns}
          />
        )}

        {/* NEW: Row number column for register-style layouts */}
        {shouldShowRowNumbers && (
          <Column
            header={rowNumberColumnHeader}
            body={(rowData, options) => (options.rowIndex + 1)}
            style={{ width: rowNumberColumnWidth, textAlign: 'right' }}
          />
        )}
        




        {/* ✅ Expander arrow column (must be first visible column) */}
        {enableRowExpansion && expansionConfig && <Column {...expansionConfig.expansionColumn} />}

        {(() => {
          // Generate columns in the correct order for grouping
          const columnsToRender = [];
          
          if (enableColumnGrouping && finalColumnStructure.hasGroups) {
            const { groups, ungroupedColumns } = finalColumnStructure;
            
            // First, add ungrouped columns
            ungroupedColumns.forEach(column => {
              columnsToRender.push(column);
            });
            
            // Then, add grouped columns in order
            groups.forEach(group => {
              group.columns.forEach(groupedColumn => {
                // Find the original column definition
                const originalColumn = defaultColumns.find(col => 
                  col.key === (groupedColumn.originalKey || groupedColumn.key)
                );
                if (originalColumn) {
                  columnsToRender.push({
                    ...originalColumn,
                    key: groupedColumn.originalKey || groupedColumn.key,
                    isGrouped: true,
                    groupName: group.header
                  });
                }
              });
            });
          } else {
            // No grouping, use default columns
            columnsToRender.push(...defaultColumns);
          }



          // Ensure calculated field columns are not filtered out
          const finalColumnsToRender = columnsToRender.filter(col => {
            if (col.key && col.key.startsWith('calc_')) {
              return true; // Always include calculated fields
            }
            return !hiddenColumns.includes(col.key);
          });

          // Helper function to generate filter options for columns
          const generateFilterOptions = (column) => {
            return getFilterOptions(finalTableData, column.key, customFilterOptions);
          };

          return finalColumnsToRender.map(column => {
            const isImageField = imageFields && Array.isArray(imageFields) && imageFields.includes(column.key);
            const columnKey = column.key;
            const columnType = getEffectiveColumnType(column);
            
            // Enhanced categorical detection including explicit configuration
            const uniqueValues = getUniqueValues(finalTableData, columnKey);
            const isCategorical = (
              dropdownFilterColumns.includes(columnKey) ||
              (uniqueValues.length > 0 && uniqueValues.length <= 30) ||
              column.type === 'dropdown' ||
              column.type === 'select' ||
              column.isCategorical
            );

            // Dynamic editor logic - automatically attach editor if column is in editableColumns
            const isEditable = editMode && (
              column.editable === true || 
              editableColumns.includes(column.key) || 
              column.editor
            );

            return (
              <Column
                key={column.uniqueKey || column.key}
                field={column.key}
                header={column.title} // Keep headers for filters even with grouping
                sortable={column.sortable !== false && enableSorting}
                filter={column.filterable !== false && isNativeRowFilterActive}
                filterField={column.key}  // FIXED: Explicitly set filterField to ensure DataTable knows which field to filter
                editable={isEditable}
                editor={isEditable ? (column.editor || createAutoEditor(column)) : undefined}
                filterElement={
                  // Use custom filter elements for supported types; otherwise fall back to default
                  (column.filterable !== false && isNativeRowFilterActive && 
                   ['dropdown', 'select', 'categorical', 'boolean', 'date', 'datetime', 'number'].includes(columnType)) ? 
                  (options) => {
                    const filterValue = options.value;
                    const filterCallback = options.filterCallback;
                    const onChange = (newValue) => filterCallback(newValue);
                    const filterOptions = generateFilterOptions(column);
                    return createFilterElement(columnType, filterValue, onChange, column, filterOptions);
                  } : undefined
                }
                filterPlaceholder={`Filter ${column.title}...`}
                filterClear={enableFilterClear ? filterClearTemplate : undefined}
                filterApply={enableFilterApply ? filterApplyTemplate : undefined}
                filterFooter={enableFilterFooter ? () => filterFooterTemplate(column) : undefined}

                showFilterMatchModes={
                  enableFilterMatchModes && 
                  !['dropdown', 'select', 'categorical', 'date', 'datetime', 'number', 'boolean'].includes(columnType)
                }
                filterMatchMode={
                  column.filterMatchMode || (
                    ['dropdown', 'select', 'categorical'].includes(columnType)
                      ? FilterMatchMode.EQUALS
                      : ['date', 'datetime'].includes(columnType)
                      ? FilterMatchMode.DATE_IS  // FIXED: Use DATE_IS instead of BETWEEN for compatibility
                      : columnType === 'number'
                      ? FilterMatchMode.EQUALS
                      : columnType === 'boolean'
                      ? FilterMatchMode.EQUALS
                      : FilterMatchMode.CONTAINS
                  )
                }

                filterMaxLength={column.filterMaxLength}
                filterMinLength={column.filterMinLength}
                filterOptions={generateFilterOptions(column)}
                filterOptionLabel={column.filterOptionLabel || 'label'}
                filterOptionValue={column.filterOptionValue || 'value'}
                filterShowClear={enableFilterClear}
                filterShowApply={enableFilterApply}
                filterShowMenu={enableFilterMenu}
                filterShowMatchModes={enableFilterMatchModes}

                footer={(() => {
                  // Priority 1: Show DYNAMIC grand total in footer for pivot tables
                  if (pivotTransformation.isPivot && 
                      dynamicGrandTotal && 
                      effectiveTotalSettings.showPivotTotals) {
                    
                    const grandTotalValue = dynamicGrandTotal[column.key];
                    
                    // First column shows "Grand Total" label with row count
                    if (defaultColumns.indexOf(column) === 0) {
                      const dataCount = filteredDataForGrandTotal.length > 0 ? filteredDataForGrandTotal.length : finalTableData.length;
                      return (
                        <div style={{ 
                          fontWeight: 'bold', 
                          color: '#28a745',
                          fontSize: '14px',
                          padding: '8px 0'
                        }}>
                          📊 Grand Total ({dataCount} rows)
                        </div>
                      );
                    }
                    
                    // Other columns show formatted values
                    if (grandTotalValue !== null && grandTotalValue !== undefined && typeof grandTotalValue === 'number') {
                      try {
                        const formattedValue = new Intl.NumberFormat(
                          adjustedPivotConfig.numberFormat || 'en-US',
                          {
                            minimumFractionDigits: adjustedPivotConfig.precision || 2,
                            maximumFractionDigits: adjustedPivotConfig.precision || 2
                          }
                        ).format(grandTotalValue);
                        
                        return (
                          <div style={{ 
                            fontWeight: 'bold', 
                            color: '#28a745',
                            fontSize: '14px',
                            textAlign: 'right',
                            padding: '8px 0'
                          }}>
                            {formattedValue}
                          </div>
                        );
                      } catch (error) {
                        return (
                          <div style={{ 
                            fontWeight: 'bold', 
                            color: '#28a745',
                            fontSize: '14px',
                            textAlign: 'right',
                            padding: '8px 0'
                          }}>
                            {grandTotalValue.toLocaleString()}
                          </div>
                        );
                      }
                    }
                    
                    return null;
                  }
                  
                  // Priority 2: Show regular footer totals when not in pivot mode
                  if (effectiveTotalSettings.showFooterTotals) {
                    return footerTemplate(column);
                  }
                  
                  return null;
                })()}

                body={
                  // Pivot table specific templates
                  pivotTransformation.isPivot && column.isPivotCalculatedField ? (rowData) => {
                    const value = rowData[column.key];
                    if (value === 'Error') {
                      return <span style={{ color: 'red' }}>Error</span>;
                    }
                    // Use the custom body template from calculated field column
                    if (column.calculatedField && column.calculatedField.body) {
                      return column.calculatedField.body(rowData);
                    }
                    // ✅ Fallback formatting with forced 2 decimal places for calculated fields
                    return formatCalculatedValue(value, column.format || 'number', {
                      currency: adjustedPivotConfig.currency,
                      locale: adjustedPivotConfig.numberFormat,
                      precision: 2 // ✅ Force 2 decimal places for calculated fields
                    });
                  } :
                  pivotTransformation.isPivot && column.isPivotValue ? (rowData) => pivotValueBodyTemplate(rowData, column) :
                  pivotTransformation.isPivot && column.isPivotTotal ? (rowData) => pivotValueBodyTemplate(rowData, column) :
                  pivotTransformation.isPivot && column.isPivotRow ? (rowData) => pivotRowBodyTemplate(rowData, column) :
                  
                  // Regular templates
                  isImageField ? (rowData) => imageBodyTemplate(rowData, column) :
                  columnType === 'date' || columnType === 'datetime' ? (rowData) => dateBodyTemplate(rowData, column) :
                  columnType === 'number' ? (rowData) => numberBodyTemplate(rowData, column) :
                  columnType === 'boolean' ? (rowData) => booleanBodyTemplate(rowData, column) :
                  columnType === 'roi' || column.isROIColumn ? (rowData) => roiBodyTemplate(rowData, column) :
                  parsedCustomFormatters[column.key] ? (rowData) => parsedCustomFormatters[column.key](rowData[column.key], rowData) :
                  customTemplates[column.key] ? (rowData) => customTemplates[column.key](rowData, column) :
                  column.render ? (rowData) => column.render(rowData[column.key], rowData) : 
                  // ✅ SAFETY: Use safeCell for any column without a custom template to prevent React #31 crashes
                  (rowData) => safeCell(rowData[column.key])
                }

                frozen={enableFrozenColumns && column.key === defaultColumns[0]?.key}
              />
            );
          });
        })()}

        {/* Row Editor Column - Native or Custom */}
        {editMode === 'row' && !useCustomRowEditor && (
          <Column
            rowEditor
            header="Actions"
            headerStyle={{ width: '10rem', textAlign: 'center' }}
            bodyStyle={{ textAlign: 'center' }}
          />
        )}
        
        {/* Custom Row Editor Column */}
        {editMode === 'row' && useCustomRowEditor && (
          <Column
            header="Actions"
            headerStyle={{ width: '10rem', textAlign: 'center' }}
            bodyStyle={{ textAlign: 'center' }}
            body={(rowData) => (
              <Button
                icon="pi pi-pencil"
                className="p-button-text p-button-sm"
                onClick={() => openCustomRowEditor(rowData)}
                tooltip="Edit Row"
              />
            )}
          />
        )}

        {enableRowActions && rowActions.length > 0 && (
          <Column
            body={actionsBodyTemplate}
            header="Actions"

            frozen={enableFrozenColumns ? "right" : undefined}
          />
        )}
      </DataTable>
      )}



      {/* Image Modal */}
      <Dialog
        visible={showImageModal}
        onHide={() => setShowImageModal(false)}
        header={imageModalAlt}
        style={{}}
        modal
        className="p-fluid"
      >
        <Image
          src={imageModalSrc}
          alt={imageModalAlt}
          width={800}
          height={600}
          style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
        />
      </Dialog>

      {/* Custom Row Editor Dialog */}
      {useCustomRowEditor && (
        <Dialog
          visible={showCustomRowEditor}
          onHide={handleCustomRowCancel}
          header="Edit Row"
          style={{ width: '600px' }}
          modal
          className="p-fluid"
        >
          {customRowEditData && (
            <div className="formgrid grid">
              {customEditorFields.map((field) => {
                const value = customRowEditData[field.key];
                const onValueChange = (newValue) => {
                  setCustomRowEditData(prev => ({ ...prev, [field.key]: newValue }));
                };

                return (
                  <div key={field.key} className="field col-12 md:col-6">
                    <label className="font-medium mb-2 block">{field.title}</label>
                    {field.type === 'number' ? (
                      <InputNumber 
                        value={value} 
                        onValueChange={(e) => onValueChange(e.value)}
                        mode="decimal"
                        minFractionDigits={field.key.toLowerCase().includes('value') ? 2 : 0}
                        maxFractionDigits={field.key.toLowerCase().includes('value') ? 2 : 0}
                        useGrouping={true}
                      />
                    ) : field.type === 'date' || field.type === 'datetime' ? (
                      <Calendar 
                        value={value ? new Date(value) : null} 
                        onChange={(e) => onValueChange(e.value)} 
                        dateFormat="yy-mm-dd" 
                        showIcon 
                      />
                    ) : field.type === 'boolean' ? (
                      <Checkbox 
                        checked={!!value} 
                        onChange={(e) => onValueChange(!!e.checked)} 
                      />
                    ) : field.type === 'dropdown' || field.type === 'select' ? (
                      <Dropdown 
                        value={value} 
                        options={getUniqueValues(finalTableData, field.key).map(v => ({ label: String(v), value: v }))} 
                        onChange={(e) => onValueChange(e.value)} 
                        placeholder="Select..."
                      />
                    ) : (
                      <InputText 
                        value={value ?? ''} 
                        onChange={(e) => onValueChange(e.target.value)} 
                      />
                    )}
                  </div>
                );
              })}
              
              <div className="col-12 flex gap-2 justify-content-end mt-4">
                <Button 
                  label="Cancel" 
                  className="p-button-text" 
                  onClick={handleCustomRowCancel} 
                />
                <Button 
                  label="Save" 
                  icon="pi pi-check" 
                  onClick={handleCustomRowSave} 
                />
              </div>
            </div>
          )}
        </Dialog>
      )}

      {/* Column Manager Dialog */}
      <Dialog
        visible={showColumnManager}
        onHide={() => setShowColumnManager(false)}
        header="Manage Columns"
        style={{}}
        modal
        className=""
      >
        <div>
          {defaultColumns.map(column => (
            <div key={column.key}>
              <Checkbox
                checked={!hiddenColumns.includes(column.key)}
                onChange={(e) => {
                  if (e.checked) {
                    setHiddenColumns(prev => prev.filter(col => col !== column.key));
                  } else {
                    setHiddenColumns(prev => [...prev, column.key]);
                  }
                }}
              />
              <span>{column.title}</span>
            </div>
          ))}
        </div>
      </Dialog>

      {/* NEW: Pivot Configuration Dialog */}
      <Dialog
        visible={showPivotConfig}
        onHide={() => setShowPivotConfig(false)}
        header="Configure Pivot Table"
        style={{ 
          width: '90vw', 
          maxWidth: '800px'
        }}
        modal
        closable
        draggable={false}
        resizable={false}
        className="pivot-config-dialog"
      >
        <div className="pivot-config-content">
          {/* Pivot Table Enable/Disable */}
          <div className="pivot-enable-section">
            <div className="field-checkbox">
              <Checkbox
                inputId="enablePivot"
                checked={localPivotConfig.enabled}
                onChange={(e) => setLocalPivotConfig(prev => ({ ...prev, enabled: e.checked }))}
              />
              <label htmlFor="enablePivot" className="ml-2">Enable Pivot Table</label>
            </div>
          </div>

          {localPivotConfig.enabled && (
            <div className="pivot-config-grid">
              {/* Rows Configuration */}
              <div className="pivot-section">
                <div className="pivot-section-header rows-header">
                  <i className="pi pi-bars"></i>
                  <span className="pivot-section-label">Rows (Group By)</span>
                </div>
                <Dropdown
                  value={null}
                  options={getCategoricalFields}
                  onChange={(e) => {
                    if (e.value && !localPivotConfig.rows.includes(e.value)) {
                      setLocalPivotConfig(prev => ({
                        ...prev,
                        rows: [...prev.rows, e.value]
                      }));
                    }
                  }}
                  placeholder="Add row grouping..."
                  className="w-full"
                />
                <div className="pivot-selected-items">
                  {localPivotConfig.rows.length === 0 ? (
                    <div className="pivot-empty-state">
                      <i className="pi pi-plus"></i>
                      <div>No row grouping selected</div>
                    </div>
                  ) : (
                    localPivotConfig.rows.map((row, index) => (
                      <div key={index} className="pivot-selected-item rows-item">
                        <span className="pivot-selected-item-label">
                          {getCategoricalFields.find(f => f.value === row)?.label || row}
                        </span>
                        <Button
                          icon="pi pi-times"
                          className="p-button-text p-button-sm p-button-danger"
                          onClick={() => {
                            setLocalPivotConfig(prev => ({
                              ...prev,
                              rows: prev.rows.filter((_, i) => i !== index)
                            }));
                          }}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Columns Configuration */}
              <div className="pivot-section">
                <div className="pivot-section-header columns-header">
                  <i className="pi pi-table"></i>
                  <span className="pivot-section-label">Columns (Pivot By)</span>
                </div>
                <Dropdown
                  value={null}
                  options={getCategoricalFields}
                  onChange={(e) => {
                    if (e.value && !localPivotConfig.columns.includes(e.value)) {
                      setLocalPivotConfig(prev => ({
                        ...prev,
                        columns: [...prev.columns, e.value]
                      }));
                    }
                  }}
                  placeholder="Add column grouping..."
                  className="w-full"
                />
                <div className="pivot-selected-items">
                  {localPivotConfig.columns.length === 0 ? (
                    <div className="pivot-empty-state">
                      <i className="pi pi-plus"></i>
                      <div>No column grouping selected</div>
                    </div>
                  ) : (
                    localPivotConfig.columns.map((col, index) => (
                      <div key={index} className="pivot-selected-item columns-item">
                        <span className="pivot-selected-item-label">
                          {getCategoricalFields.find(f => f.value === col)?.label || col}
                        </span>
                        <Button
                          icon="pi pi-times"
                          className="p-button-text p-button-sm p-button-danger"
                          onClick={() => {
                            setLocalPivotConfig(prev => ({
                              ...prev,
                              columns: prev.columns.filter((_, i) => i !== index)
                            }));
                          }}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Values Configuration */}
              <div className="pivot-section pivot-values-section">
                <div className="pivot-section-header values-header">
                  <i className="pi pi-calculator"></i>
                  <span className="pivot-section-label">Values (Aggregations)</span>
                </div>
                <Dropdown
                  value={null}
                  options={getNumericFields}
                  onChange={(e) => {
                    if (e.value && !localPivotConfig.values.find(v => v.field === e.value)) {
                      setLocalPivotConfig(prev => ({
                        ...prev,
                        values: [...prev.values, { field: e.value, aggregation: 'sum' }]
                      }));
                    }
                  }}
                  placeholder="Add value field..."
                  className="w-full"
                />
                <div className="pivot-selected-items">
                  {localPivotConfig.values.length === 0 ? (
                    <div className="pivot-empty-state">
                      <i className="pi pi-plus"></i>
                      <div>No value fields selected</div>
                    </div>
                  ) : (
                    localPivotConfig.values.map((value, index) => (
                      <div key={index} className="pivot-value-item">
                        <div className="pivot-value-item-header">
                          <span className="pivot-value-item-label">
                            {getNumericFields.find(f => f.value === value.field)?.label || value.field}
                          </span>
                          <Button
                            icon="pi pi-times"
                            className="p-button-text p-button-sm p-button-danger"
                            onClick={() => {
                              setLocalPivotConfig(prev => ({
                                ...prev,
                                values: prev.values.filter((_, i) => i !== index)
                              }));
                            }}
                          />
                        </div>
                        <Dropdown
                          value={value.aggregation}
                          options={aggregationOptions}
                          onChange={(e) => {
                            setLocalPivotConfig(prev => ({
                              ...prev,
                              values: prev.values.map((v, i) => 
                                i === index ? { ...v, aggregation: e.value } : v
                              )
                            }));
                          }}
                          className="w-full"
                          placeholder="Select aggregation..."
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Value Aggregations (Meta-Aggregations) */}
              <div className="pivot-section pivot-meta-aggregations-section">
                <div className="pivot-section-header meta-aggregations-header">
                  <i className="pi pi-chart-bar"></i>
                  <span className="pivot-section-label">Value Aggregations</span>
                  <span className="pivot-section-subtitle" style={{ fontSize: '11px', color: '#6c757d', marginLeft: '8px' }}>
                    Aggregate the already-aggregated values
                  </span>
                </div>
                
                {/* Available Value Aggregations Dropdown */}
                {localPivotConfig.values.length > 0 && (
                  <Dropdown
                    value={null}
                    options={localPivotConfig.values.map(v => ({
                      label: `${getNumericFields.find(f => f.value === v.field)?.label || v.field} (${v.aggregation})`,
                      value: `${v.field}_${v.aggregation}`
                    }))}
                    onChange={(e) => {
                      if (e.value && !localPivotConfig.metaAggregations?.find(ma => ma.sourceKey === e.value)) {
                        const [field, aggregation] = e.value.split('_');
                        setLocalPivotConfig(prev => ({
                          ...prev,
                          metaAggregations: [
                            ...(prev.metaAggregations || []),
                            { 
                              sourceKey: e.value,
                              field: field,
                              sourceAggregation: aggregation,
                              metaAggregation: 'max'
                            }
                          ]
                        }));
                      }
                    }}
                    placeholder="Add aggregation for value..."
                    className="w-full"
                  />
                )}
                
                <div className="pivot-selected-items">
                  {(!localPivotConfig.metaAggregations || localPivotConfig.metaAggregations.length === 0) ? (
                    <div className="pivot-empty-state">
                      <i className="pi pi-plus"></i>
                      <div>
                        {localPivotConfig.values.length === 0 
                          ? "Add value fields first to enable value aggregations"
                          : "No value aggregations selected"
                        }
                      </div>
                    </div>
                  ) : (
                    localPivotConfig.metaAggregations.map((metaAgg, index) => (
                      <div key={index} className="pivot-value-item">
                        <div className="pivot-value-item-header">
                          <span className="pivot-value-item-label">
                            {getNumericFields.find(f => f.value === metaAgg.field)?.label || metaAgg.field} ({metaAgg.sourceAggregation})
                          </span>
                          <Button
                            icon="pi pi-times"
                            className="p-button-text p-button-sm p-button-danger"
                            onClick={() => {
                              setLocalPivotConfig(prev => ({
                                ...prev,
                                metaAggregations: prev.metaAggregations.filter((_, i) => i !== index)
                              }));
                            }}
                          />
                        </div>
                        <Dropdown
                          value={metaAgg.metaAggregation}
                          options={aggregationOptions}
                          onChange={(e) => {
                            setLocalPivotConfig(prev => ({
                              ...prev,
                              metaAggregations: prev.metaAggregations.map((ma, i) => 
                                i === index ? { ...ma, metaAggregation: e.value } : ma
                              )
                            }));
                          }}
                          className="w-full"
                          placeholder="Select meta-aggregation..."
                        />
                        <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '4px' }}>
                          {metaAgg.metaAggregation?.toUpperCase()} of {getNumericFields.find(f => f.value === metaAgg.field)?.label || metaAgg.field} {metaAgg.sourceAggregation?.toUpperCase()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Calculated Fields */}
              <div className="pivot-section pivot-calculated-fields-section">
                <CalculatedFieldsManager 
                  calculatedFields={localPivotConfig.calculatedFields || []}
                  onCalculatedFieldsChange={(calculatedFields) => {
                    setLocalPivotConfig(prev => ({
                      ...prev,
                      calculatedFields
                    }));
                  }}
                  availableFields={[
                    // Add aggregated value fields that can be used in calculated fields
                    ...localPivotConfig.values.map(value => ({
                      key: localPivotConfig.showRowTotals 
                        ? (localPivotConfig.values.filter(v => v.field === value.field).length > 1 
                          ? `${value.field}_${value.aggregation || 'sum'}_total` 
                          : `${value.field}_total`)
                        : (localPivotConfig.values.length > 1 && localPivotConfig.values.filter(v => v.field === value.field).length > 1 
                          ? `${value.field}_${value.aggregation || 'sum'}` 
                          : value.field),
                      field: value.field,
                      aggregation: value.aggregation || 'sum',
                      type: 'number',
                      title: `${getNumericFields.find(f => f.value === value.field)?.label || value.field} (${value.aggregation || 'sum'})`
                    })),
                    // Add column-specific value fields if columns are configured
                    ...(localPivotConfig.columns.length > 0 && localPivotConfig.values.length > 0 
                      ? localPivotConfig.columns.flatMap(colField => {
                          // Get unique values for this column from the data
                          const columnValues = finalTableData 
                            ? [...new Set(finalTableData.map(row => row[colField]).filter(v => v !== null && v !== undefined))]
                            : [];
                          
                          return columnValues.slice(0, 5).flatMap(colValue => // Limit to first 5 values for performance
                            localPivotConfig.values.map(value => ({
                              key: `${colValue}_${value.field}_${value.aggregation || 'sum'}`,
                              field: value.field,
                              aggregation: value.aggregation || 'sum',
                              type: 'number',
                              title: `${colValue} - ${getNumericFields.find(f => f.value === value.field)?.label || value.field} (${value.aggregation || 'sum'})`,
                              pivotColumn: colValue
                            }))
                          );
                        })
                      : [])
                  ]}
                  sampleData={finalTableData?.slice(0, 1) || []}
                />
              </div>

              {/* Display Options */}
              <div className="pivot-display-section">
                <div className="pivot-display-header">
                  <i className="pi pi-cog"></i>
                  <span className="pivot-section-label">Display Options</span>
                </div>
                <div className="pivot-display-options">
                  <div className="pivot-display-option">
                    <Checkbox
                      inputId="showGrandTotals"
                      checked={localPivotConfig.showGrandTotals}
                      onChange={(e) => setLocalPivotConfig(prev => ({ ...prev, showGrandTotals: e.checked }))}
                    />
                    <label htmlFor="showGrandTotals">Grand Totals</label>
                  </div>
                  <div className="pivot-display-option">
                    <Checkbox
                      inputId="showRowTotals"
                      checked={localPivotConfig.showRowTotals}
                      onChange={(e) => setLocalPivotConfig(prev => ({ ...prev, showRowTotals: e.checked }))}
                    />
                    <label htmlFor="showRowTotals">Row Totals</label>
                  </div>
                  <div className="pivot-display-option">
                    <Checkbox
                      inputId="showColumnTotals"
                      checked={localPivotConfig.showColumnTotals}
                      onChange={(e) => setLocalPivotConfig(prev => ({ ...prev, showColumnTotals: e.checked }))}
                    />
                    <label htmlFor="showColumnTotals">Column Totals</label>
                  </div>
                  <div className="pivot-display-option">
                    <Checkbox
                      inputId="showSubTotals"
                      checked={localPivotConfig.showSubTotals}
                      onChange={(e) => setLocalPivotConfig(prev => ({ ...prev, showSubTotals: e.checked }))}
                    />
                    <label htmlFor="showSubTotals">Sub Totals</label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pivot-actions">
            <Button
              label="Reset"
              icon="pi pi-refresh"
              className="p-button-outlined p-button-secondary"
              onClick={resetPivotConfig}
              disabled={isSavingPivotConfig}
              style={{}}
            />
            
            {/* Manual Save Button - only show if auto-save is disabled */}
            {enablePivotPersistence && finalSaveToCMS && !autoSavePivotConfig && (
              <Button
                label={isSavingPivotConfig ? "Saving..." : "Save"}
                icon={isSavingPivotConfig ? "pi pi-spin pi-spinner" : "pi pi-save"}
                className="p-button-outlined p-button-info"
                onClick={savePivotConfigManually}
                disabled={isSavingPivotConfig}
                style={{}}
              />
            )}
            
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-outlined"
              onClick={() => setShowPivotConfig(false)}
              disabled={isSavingPivotConfig}
              style={{}}
            />
            
            {/* Apply (Temporary UI Only) */}
            <Button
              label="Apply"
              icon="pi pi-eye"
              className="p-button-outlined p-button-info"
              onClick={applyPivotConfig}
              disabled={
                localPivotConfig.enabled && (localPivotConfig.rows.length === 0 || localPivotConfig.values.length === 0)
              }
              tooltip="Apply temporarily (not saved to CMS)"
              tooltipOptions={{ position: 'top' }}
              style={{}}
            />
            
            {/* Apply & Save (Persistent) */}
            {enablePivotPersistence && finalSaveToCMS && (
              <Button
                label={isSavingPivotConfig ? "Applying & Saving..." : "Apply & Save"}
                icon={isSavingPivotConfig ? "pi pi-spin pi-spinner" : "pi pi-check"}
                className="p-button-success"
                onClick={applyAndSavePivotConfig}
                disabled={
                  isSavingPivotConfig || 
                  (localPivotConfig.enabled && (localPivotConfig.rows.length === 0 || localPivotConfig.values.length === 0))
                }
                tooltip="Apply and save to CMS for persistence"
                tooltipOptions={{ position: 'top' }}
                style={{}}
              />
            )}
          </div>
      </Dialog>
            </div>
  );
};

export default PrimeDataTable; 