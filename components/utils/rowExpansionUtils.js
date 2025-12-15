/**
 * Row Expansion Utilities for PrimeReact DataTable
 * 
 * Provides utility functions for managing row expansion functionality including:
 * - Expansion state management
 * - Row expansion validation
 * - Auto-detection of expandable rows
 * - Expansion template generation
 * - Expand/collapse all functionality
 */

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

// Utility: human header from key
const toHeader = (k) =>
  String(k)
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^\w/, (c) => c.toUpperCase());

/**
 * Check if a row can be expanded based on data structure
 * @param {Object} rowData - The row data to check
 * @param {Function} customValidator - Custom validation function
 * @param {Function} allowExpansion - Custom expansion condition function
 * @returns {boolean} - Whether the row can be expanded
 */
export const canExpandRow = (rowData, customValidator = null, allowExpansion = null) => {
  try {
    // Safety check for empty or invalid row data
    if (!rowData || typeof rowData !== 'object') {
      return false;
    }
    
    if (customValidator) {
      return customValidator(rowData);
    }
    
    if (allowExpansion) {
      return allowExpansion(rowData);
    }
    
    // Auto-detect nested data patterns - prioritize items, invoices, orders, etc.
    const hasNestedData = rowData.items || rowData.invoices || rowData.orders || rowData.children || rowData.subItems || rowData.nestedData;
    const canExpand = hasNestedData && Array.isArray(hasNestedData) && hasNestedData.length > 0;
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 canExpandRow check:', {
        rowData: rowData?.Invoice || rowData?.id,
        hasItems: !!rowData?.items,
        itemsLength: rowData?.items?.length,
        canExpand
      });
    }
    
    return canExpand;
  } catch (error) {
    console.warn('Error checking if row can be expanded:', error);
    return false;
  }
};

/**
 * Generate expansion column configuration for PrimeReact DataTable
 * @param {Object} options - Configuration options
 * @returns {Object} - Expansion column configuration
 */
export const generateExpansionColumn = ({
  canExpandRowFn = canExpandRow,
  style = { width: '5rem' },
  header = null,
  body = null,
  position = 'left', // 'left' or 'right'
  width = '5rem'
} = {}) => {
  return {
    // PrimeReact expects <Column expander />. These props are
    // spread into <Column {...expansionColumn} /> in the table.
    expander: true,
    style: { ...style, width },
    header,
    body,
    frozen: position === 'left',
    alignFrozen: position === 'right' ? 'right' : undefined,
    sortable: false,
    filter: false
  };
};


/**
 * Get nested data label based on data structure
 * @param {Array} nestedData - The nested data array
 * @returns {string} - Human-readable label for the nested data
 */
export const getNestedDataLabel = (nestedData) => {
  if (!nestedData || nestedData.length === 0) return 'Items';
  
  const sampleRow = nestedData[0];
  if (!sampleRow) return 'Items';
  
  // Auto-detect based on common field names
  if (sampleRow.Invoice || sampleRow.invoice) return 'Invoices';
  if (sampleRow.Order || sampleRow.order) return 'Orders';
  if (sampleRow.Product || sampleRow.product) return 'Products';
  if (sampleRow.Item || sampleRow.item) return 'Items';
  if (sampleRow.Transaction || sampleRow.transaction) return 'Transactions';
  if (sampleRow.Record || sampleRow.record) return 'Records';
  
  return 'Items';
};

/**
 * Generate auto-detected expansion template
 * @param {Object} options - Configuration options
 * @returns {Function} - Expansion template function that returns valid JSX
 */
export const generateAutoDetectedExpansionTemplate = ({
  nestedKey = 'invoices',     // or detect dynamically
  enableNestedSorting = true,
  enableNestedFiltering = false,
} = {}) => {
  return (parentRow) => {
    const nested = parentRow?.[nestedKey];

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Expansion template:', {
        parentRow: parentRow?.Invoice || parentRow?.id,
        nestedKey,
        nested: nested?.length || 0,
        hasNested: !!nested
      });
    }

    // Nothing to show
    if (!Array.isArray(nested) || nested.length === 0) {
      return <div className="p-3 text-sm text-gray-500">No data.</div>;
    }

    // Ensure array of plain objects
    const rows = nested.filter((x) => x && typeof x === 'object' && !Array.isArray(x));
    if (rows.length === 0) {
      return <div className="p-3 text-sm text-gray-500">No items to display.</div>;
    }

    // Build columns dynamically from first row
    const sample = rows[0];
    const keys = Object.keys(sample);

    return (
      <div className="p-3">
        <h5 className="text-base font-semibold mb-2">
          {rows.length} {nestedKey} for {parentRow?.Customer ?? parentRow?.id ?? 'row'}
        </h5>

        <DataTable
          value={rows}
          size="small"
          stripedRows
          tableStyle={{ minWidth: '600px' }}
        >
          {keys.map((k) => (
            <Column
              key={k}
              field={k}
              header={toHeader(k)}
              sortable={enableNestedSorting}
              filter={enableNestedFiltering}
              body={(r) => {
                const v = r?.[k];
                if (v == null) return '';
                if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
                if (Array.isArray(v)) return v.join(', ');
                try {
                  const s = JSON.stringify(v);
                  return s.length > 120 ? s.slice(0, 117) + '...' : s;
                } catch {
                  return '[object]';
                }
              }}
            />
          ))}
        </DataTable>
      </div>
    );
  };
};

/**
 * Generate expand/collapse all buttons
 * @param {Object} options - Configuration options
 * @returns {JSX.Element} - React component with expand/collapse buttons
 */
export const generateExpansionButtons = ({
  onExpandAll,
  onCollapseAll,
  expandAllLabel = "Expand All",
  collapseAllLabel = "Collapse All",
  buttonClassName = "",
  buttonStyle = {}
} = {}) => {
  return (
    <div className="flex flex-wrap justify-end gap-2 my-2">
      <button className={`p-button p-button-text ${buttonClassName}`} onClick={onExpandAll} style={buttonStyle}>
        <i className="pi pi-plus" /> <span className="ml-2">{expandAllLabel}</span>
      </button>
      <button className={`p-button p-button-text ${buttonClassName}`} onClick={onCollapseAll} style={buttonStyle}>
        <i className="pi pi-minus" /> <span className="ml-2">{collapseAllLabel}</span>
      </button>
    </div>
  );
};

/**
 * Expand all rows in the data
 * @param {Array} data - The data array
 * @param {string} dataKey - The unique identifier field
 * @param {Function} canExpandRowFn - Function to check if row can be expanded
 * @returns {Object} - Object with expanded row keys
 */
export const expandAllRows = (data, dataKey = 'id', canExpandRowFn = canExpandRow) => {
  const newExpandedRows = {};
  
  data.forEach((row) => {
    const rowKey = row[dataKey];
    if (rowKey !== undefined && canExpandRowFn(row)) {
      newExpandedRows[rowKey] = true;
    }
  });
  
  return newExpandedRows;
};

/**
 * Collapse all rows
 * @returns {Object} - Empty object representing no expanded rows
 */
export const collapseAllRows = () => {
  return {};
};

/**
 * Create row expansion configuration object for PrimeReact DataTable
 * @param {Object} options - Configuration options
 * @returns {Object} - Complete row expansion configuration
 */
export const createRowExpansionConfig = ({
  // Data and validation
  data = [],
  dataKey = 'id',
  canExpandRowFn = canExpandRow,
  customValidator = null,
  
  // Expansion column configuration
  expansionColumnStyle = { width: '5rem' },
  expansionColumnWidth = '5rem',
  expansionColumnHeader = null,
  expansionColumnBody = null,
  expansionColumnPosition = 'left',
  
  // Expansion template
  rowExpansionTemplate = null,
  nestedDataConfig = {
    enableNestedSorting: true,
    enableNestedFiltering: true,
    enableNestedPagination: false,
    nestedPageSize: 10
  },
  
  // UI customization
  showExpandAllButtons = true,
  expandAllLabel = "Expand All",
  collapseAllLabel = "Collapse All",
  expansionButtonClassName = "",
  expansionButtonStyle = {},
  
  // Callbacks
  onRowToggle = null,
  onRowExpand = null,
  onRowCollapse = null,
  toastRef = null
} = {}) => {
  
  // Use custom validator if provided, otherwise use canExpandRowFn
  const validateExpansion = customValidator || canExpandRowFn;
  
  // Generate expansion column
  const expansionColumn = generateExpansionColumn({
    canExpandRowFn: validateExpansion,
    style: expansionColumnStyle,
    header: expansionColumnHeader,
    body: expansionColumnBody,
    position: expansionColumnPosition,
    width: expansionColumnWidth
  });
  
  // Generate expansion template
  const expansionTemplate =
    rowExpansionTemplate || generateAutoDetectedExpansionTemplate(nestedDataConfig);
  
  // Generate expansion buttons if enabled
  const expansionButtons = showExpandAllButtons ? 
    generateExpansionButtons({
      onExpandAll: () => {
        const newExpandedRows = expandAllRows(data, dataKey, validateExpansion);
        if (onRowToggle) {
          onRowToggle({ data: newExpandedRows });
        }
        
        // Show toast notification if available
        if (toastRef?.current) {
          toastRef.current.show({ 
            severity: 'info', 
            summary: 'All Rows Expanded', 
            detail: `${Object.keys(newExpandedRows).length} rows expanded`, 
            life: 3000 
          });
        }
      },
      onCollapseAll: () => {
        if (onRowToggle) {
          onRowToggle({ data: {} });
        }
        
        // Show toast notification if available
        if (toastRef?.current) {
          toastRef.current.show({ 
            severity: 'success', 
            summary: 'All Rows Collapsed', 
            detail: 'All rows collapsed', 
            life: 3000 
          });
        }
      },
      expandAllLabel,
      collapseAllLabel,
      buttonClassName: expansionButtonClassName,
      buttonStyle: expansionButtonStyle
    }) : null;
  
  return {
    // Expansion column configuration
    expansionColumn,
    
    // Expansion template
    rowExpansionTemplate: expansionTemplate,
    
    // Expansion buttons
    expansionButtons,
    
    // Utility functions
    canExpandRow: validateExpansion,
    expandAllRows: () => expandAllRows(data, dataKey, validateExpansion),
    collapseAllRows,
    
    // Configuration
    dataKey,
    nestedDataConfig
  };
};

/**
 * Handle row expansion with toast notification
 * @param {Object} event - Row expansion event
 * @param {Function} onRowExpand - Custom row expand callback
 * @param {Object} toastRef - Reference to toast component
 */
export const handleRowExpand = (event, onRowExpand = null, toastRef = null) => {
  if (onRowExpand) {
    onRowExpand(event);
  }
  
  // Show toast notification if available
  if (toastRef?.current) {
    const rowData = event.data;
    const rowName = rowData.name || rowData.title || rowData.id || 'Row';
    toastRef.current.show({ 
      severity: 'info', 
      summary: 'Row Expanded', 
      detail: `${rowName} expanded`, 
      life: 3000 
    });
  }
};

/**
 * Handle row collapse with toast notification
 * @param {Object} event - Row collapse event
 * @param {Function} onRowCollapse - Custom row collapse callback
 * @param {Object} toastRef - Reference to toast component
 */
export const handleRowCollapse = (event, onRowCollapse = null, toastRef = null) => {
  if (onRowCollapse) {
    onRowCollapse(event);
  }
  
  // Show toast notification if available
  if (toastRef?.current) {
    const rowData = event.data;
    const rowName = rowData.name || rowData.title || rowData.id || 'Row';
    toastRef.current.show({ 
      severity: 'success', 
      summary: 'Row Collapsed', 
      detail: `${rowName} collapsed`, 
      life: 3000 
    });
  }
};
