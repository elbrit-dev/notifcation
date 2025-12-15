import React from 'react';
import Image from 'next/image';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { classNames } from 'primereact/utils';

// Custom cell renderers
export const createImageBodyTemplate = (popupImageFields, setImageModalSrc, setImageModalAlt, setShowImageModal) => {
  return (rowData, column) => {
    const value = rowData[column.key];
    if (!value) return '-';
    
    const isPopup = popupImageFields && Array.isArray(popupImageFields) && popupImageFields.includes(column.key);
    
    return (
      <Image
        src={value}
        alt={column.key}
        width={50}
        height={50}
        style={{ objectFit: 'cover', cursor: isPopup ? 'pointer' : 'default' }}
        onClick={isPopup ? () => { 
          setImageModalSrc(value); 
          setImageModalAlt(column.key); 
          setShowImageModal(true); 
        } : undefined}
      />
    );
  };
};

export const dateBodyTemplate = (rowData, column) => {
  const value = rowData[column.key];
  if (!value) return '-';
  
  if (column.type === 'date') {
    return new Date(value).toLocaleDateString();
  } else if (column.type === 'datetime') {
    return new Date(value).toLocaleString();
  }
  return value;
};

export const numberBodyTemplate = (rowData, column) => {
  const value = rowData[column.key];
  if (value === null || value === undefined) return '-';
  return Number(value).toLocaleString();
};

export const booleanBodyTemplate = (rowData, column) => {
  const value = rowData[column.key];
  return (
    <i className={classNames('pi', { 
      'text-green-500 pi-check-circle': value, 
      'text-red-500 pi-times-circle': !value 
    })}></i>
  );
};

// ROI Body Template
export const createROIBodyTemplate = (formatROIValue, getROIColor) => {
  return (rowData, column) => {
    const roiValue = rowData[column.key];
    
    if (roiValue === null || roiValue === undefined) {
      return <span>N/A</span>;
    }

    const formattedValue = formatROIValue(roiValue);
    const color = getROIColor(roiValue);

    return (
      <span style={{ 
        color: color || 'inherit',
        fontWeight: 'bold'
      }}>
        {formattedValue}
      </span>
    );
  };
};

// Pivot table specific formatters
export const createPivotValueBodyTemplate = (adjustedPivotConfig, currencyColumns) => {
  return (rowData, column) => {
    const value = rowData[column.key];
    if (value === null || value === undefined) return '-';
    
    // Check if this row is a grand total (supports both original and paginated grand total rows)
    const isGrandTotal = rowData.isGrandTotal || rowData._isGrandTotalRow;
    
    // ✅ Check if this is a calculated field column
    const isCalculatedField = column.isPivotCalculatedField || (column.key && column.key.startsWith('calc_'));
    
    // Format number based on pivot config with safe fallbacks
    let formattedValue;
    
    const isCurrencyColumn = currencyColumns.includes(column.key) || (column.pivotField && currencyColumns.includes(column.pivotField));
    const currency = adjustedPivotConfig.currency || 'USD';
    const numberFormat = adjustedPivotConfig.numberFormat || 'en-US';
    
    // ✅ Force 2 decimal places for calculated fields
    const precision = isCalculatedField ? 2 : (adjustedPivotConfig.precision || 2);
    
    try {
      if (isCurrencyColumn && currency) {
        formattedValue = new Intl.NumberFormat(numberFormat, {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: precision,
          maximumFractionDigits: precision
        }).format(value);
      } else {
        formattedValue = new Intl.NumberFormat(numberFormat, {
          minimumFractionDigits: precision,
          maximumFractionDigits: precision
        }).format(value);
      }
    } catch (error) {
      console.warn('Pivot value formatting error:', error, { currency, numberFormat, precision });
      // Fallback to simple number formatting with 2 decimal places for calculated fields
      formattedValue = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: isCalculatedField ? 2 : precision,
        maximumFractionDigits: isCalculatedField ? 2 : precision
      }).format(value);
    }
    
    // Apply special styling for totals
    const className = classNames({
      'font-bold': isGrandTotal || column.isPivotTotal,
      'text-blue-600': column.isPivotTotal && !isGrandTotal,
      'text-green-600 font-semibold': isGrandTotal,
      'bg-blue-50': column.isPivotTotal && !isGrandTotal,
      'bg-green-50': isGrandTotal
    });
    
    return (
      <span className={className}>
        {formattedValue}
      </span>
    );
  };
};

export const pivotRowBodyTemplate = (rowData, column) => {
  const value = rowData[column.key];
  const isGrandTotal = rowData.isGrandTotal || rowData._isGrandTotalRow;
  
  const className = classNames({
    'font-bold text-green-600': isGrandTotal,
    'font-medium': !isGrandTotal
  });
  
  return (
    <span className={className}>
      {value || '-'}
    </span>
  );
};

export const createActionsBodyTemplate = (rowActions) => {
  return (rowData) => {
    return (
      <div>
        {rowActions.map((action, actionIndex) => (
          <Button
            key={actionIndex}
            icon={action.icon}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick(rowData);
            }}
            tooltip={action.title}
            tooltipOptions={{ position: 'top' }}
            className="p-button-text p-button-sm"
          />
        ))}
      </div>
    );
  };
};

// Filter templates
export const createFilterClearTemplate = (enableFilterClear) => {
  return (options) => {
    if (!enableFilterClear) return null;
    return (
      <Button
        type="button"
        icon="pi pi-times"
        onClick={options.filterClearCallback}
        className="p-button-text p-button-sm"
        tooltip="Clear filter"
        tooltipOptions={{ position: 'top' }}
      />
    );
  };
};

export const createFilterApplyTemplate = (enableFilterApply) => {
  return (options) => {
    if (!enableFilterApply) return null;
    return (
      <Button
        type="button"
        icon="pi pi-check"
        onClick={options.filterApplyCallback}
        className="p-button-text p-button-sm"
        tooltip="Apply filter"
        tooltipOptions={{ position: 'top' }}
      />
    );
  };
};

export const createFilterFooterTemplate = (enableFilterFooter) => {
  return (column) => {
    if (!enableFilterFooter) return null;
    return (
      <div className="p-column-filter-footer">
        Filter by {column.title}
      </div>
    );
  };
};

// Footer template for column totals
export const createFooterTemplate = (
  effectiveTotalSettings, 
  currencyColumns, 
  calculateFooterTotals, 
  footerTotalsConfig,
  tableData
) => {
  return (column) => {
    if (!effectiveTotalSettings.showFooterTotals) return null;
    
    // Dynamic numeric column detection
    const isNumericColumn = (() => {
      // Check if column type is explicitly set to 'number'
      if (column.type === 'number') return true;
      
      // ✅ Check if this is a calculated field column
      if (column.isPivotCalculatedField || (column.key && column.key.startsWith('calc_'))) return true;
      
      // Check if column key is in currencyColumns
      if (currencyColumns.includes(column.key)) return true;
      
      // Check if column key contains numeric indicators
      if (column.key && typeof column.key === 'string') {
        const key = column.key.toLowerCase();
        if (key.includes('amount') || 
            key.includes('total') || 
            key.includes('sum') ||
            key.includes('revenue') ||
            key.includes('cost') ||
            key.includes('profit') ||
            key.includes('price') ||
            key.includes('value') ||
            key.includes('service') ||
            key.includes('emi') ||
            key.includes('cheque')) {
          return true;
        }
      }
      
      // Check if column data contains numeric values
      if (Array.isArray(tableData) && tableData.length > 0) {
        const sampleValues = tableData.slice(0, 10).map(row => row[column.key]);
        const hasNumericValues = sampleValues.some(val => 
          typeof val === 'number' && !isNaN(val)
        );
        if (hasNumericValues) return true;
      }
      
      return false;
    })();
    
    if (!isNumericColumn) return null;
    
    const { totals, averages, counts } = calculateFooterTotals;
    const total = totals[column.key];
    const average = averages[column.key];
    const count = counts[column.key];
    
    if (total === undefined && average === undefined && count === undefined) return null;
    
    const formatNumber = (value, column) => {
      if (typeof value !== 'number') return '';

      const currency = footerTotalsConfig.currency || 'USD';
      const numberFormat = footerTotalsConfig.numberFormat || 'en-US';
      const precision = footerTotalsConfig.precision || 2;

      try {
        if (currencyColumns.includes(column.key) && currency) {
          return new Intl.NumberFormat(numberFormat, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: precision,
            maximumFractionDigits: precision
          }).format(value);
        }

        return new Intl.NumberFormat(numberFormat, {
          minimumFractionDigits: precision,
          maximumFractionDigits: precision
        }).format(value);
      } catch (error) {
        console.warn('Footer formatting error:', error, { currency, numberFormat, precision });
        // Fallback to simple formatting
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value);
      }
    };

    return (
      <div>
        {footerTotalsConfig.showTotals && total !== undefined && (
          <div>Total: {formatNumber(total, column)}</div>
        )}
        {footerTotalsConfig.showAverages && average !== undefined && (
          <div>Avg: {formatNumber(average, column)}</div>
        )}
        {footerTotalsConfig.showCounts && count !== undefined && (
          <div>Count: {count}</div>
        )}
      </div>
    );
  };
};

// Toolbar components
export const createLeftToolbarTemplate = (
  enableSearch, 
  enableGlobalFilter, 
  globalFilterPlaceholder, 
  globalFilterValue, 
  handleSearch, 
  clearAllFilters,
  // Row expansion buttons
  enableRowExpansion = false,
  showExpandAllButtons = false,
  expandAllLabel = "Expand All",
  collapseAllLabel = "Collapse All",
  expansionButtonClassName = "",
  expansionButtonStyle = {},
  onExpandAll = null,
  onCollapseAll = null
) => {
  return () => (
    <div className="flex align-items-center gap-3">
      {(enableSearch || enableGlobalFilter) && (
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            placeholder={globalFilterPlaceholder}
            value={globalFilterValue}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </IconField>
      )}

      {globalFilterValue && (
        <Button
          icon="pi pi-filter-slash"
          label="Clear"
          onClick={clearAllFilters}
          className="p-button-outlined p-button-danger p-button-sm"
        />
      )}

      {/* Row Expansion Buttons */}
      {enableRowExpansion && showExpandAllButtons && (
        <>
          <Button
            label={expandAllLabel}
            icon="pi pi-plus"
            onClick={onExpandAll}
            className={`p-button-outlined p-button-sm ${expansionButtonClassName}`}
            style={expansionButtonStyle}
          />
          <Button
            label={collapseAllLabel}
            icon="pi pi-minus"
            onClick={onCollapseAll}
            className={`p-button-outlined p-button-sm ${expansionButtonClassName}`}
            style={expansionButtonStyle}
          />
        </>
      )}
    </div>
  );
};

export const createRightToolbarTemplate = (
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
  // NEW: Filter mode toggle (native vs custom)
  enableFilterModeToggle = false,
  filterMode = 'native',
  onToggleFilterMode = null,

) => {
  return () => (
    <div>
      {selectedRows.length > 0 && enableBulkActions && bulkActions.length > 0 && (
        <div>
          <span>
            {selectedRows.length} selected
          </span>
          {bulkActions.map((action, index) => (
            <Button
              key={index}
              label={action.title}
              onClick={() => handleBulkAction(action)}
              className="p-button-sm"
            />
          ))}
        </div>
      )}

      {enablePivotUI && (
        <Button
          icon={isLoadingPivotConfig ? "pi pi-spin pi-spinner" : "pi pi-chart-bar"}
          label={isLoadingPivotConfig ? "Loading..." : "Pivot"}
          onClick={() => setShowPivotConfig(!showPivotConfig)}
          className={`p-button-outlined p-button-sm ${isPivotEnabled ? 'p-button-success' : ''}`}
          tooltip={isLoadingPivotConfig ? "Loading pivot configuration..." : "Configure pivot table"}
          tooltipOptions={{ position: 'top' }}
          disabled={isLoadingPivotConfig}
        />
      )}

      {enableColumnManagement && (
        <Button
          icon="pi pi-columns"
          label="Columns"
          onClick={() => setShowColumnManager(!showColumnManager)}
          className="p-button-outlined p-button-sm"
        />
      )}

      {enableColumnFilter && (
        <Button
          icon="pi pi-filter-slash"
          label="Clear Filters"
          onClick={clearAllFilters}
          className="p-button-outlined p-button-warning p-button-sm"
          tooltip="Clear all column filters and search"
          tooltipOptions={{ position: 'top' }}
        />
      )}

      {/* NEW: Filter Mode Toggle */}
      {enableFilterModeToggle && (
        <span className="p-buttonset ml-2">
          <Button
            label="Native"
            className={`p-button-sm ${filterMode === 'native' ? 'p-button-info' : 'p-button-outlined'}`}
            onClick={() => onToggleFilterMode && onToggleFilterMode('native')}
          />
          <Button
            label="Custom"
            className={`p-button-sm ${filterMode === 'custom' ? 'p-button-info' : 'p-button-outlined'}`}
            onClick={() => onToggleFilterMode && onToggleFilterMode('custom')}
          />
        </span>
      )}

      {enableExport && (
        <Button
          icon="pi pi-download"
          label="Export"
          onClick={handleExport}
          className="p-button-outlined p-button-sm"
        />
      )}

      {enableRefresh && (
        <Button
          icon="pi pi-refresh"
          label="Refresh"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-button-outlined p-button-sm"
          loading={isRefreshing}
        />
      )}


    </div>
  );
};

// Filter element factory
export const createFilterElement = (columnType, value, onChange, column, filterOptions) => {
  switch (columnType) {
    case 'dropdown':
    case 'select':
      return (
        <Dropdown
          value={value}
          options={filterOptions || []}
          onChange={(e) => onChange(e.value)}
          placeholder={`Select ${column.title}`}
          className="p-column-filter"
          showClear
        />
      );
    
    case 'date':
    case 'datetime':
      return (
        <Calendar
          value={value}
          onChange={(e) => onChange(e.value)}
          placeholder={`Select ${column.title}`}
          className="p-column-filter"
          showIcon
        />
      );
    
    case 'number':
      return (
        <InputNumber
          value={value}
          onChange={(e) => onChange(e.value)}
          placeholder={`Filter ${column.title}`}
          className="p-column-filter"
        />
      );
    
    case 'boolean':
      return (
        <Dropdown
          value={value}
          options={[
            { label: 'All', value: null },
            { label: 'True', value: true },
            { label: 'False', value: false }
          ]}
          onChange={(e) => onChange(e.value)}
          placeholder="Select"
          className="p-column-filter"
          showClear
        />
      );
    
    case 'text':
    default:
      return (
        <InputText
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Filter ${column.title}`}
          className="p-column-filter"
        />
      );
  }
};