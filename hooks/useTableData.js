import { useState, useMemo, useEffect } from 'react';
import { processDataWithMerge, generateColumnsFromData } from '../utils/tableUtils';
import { transformToPivotData, mergePivotConfig } from '../utils/pivotUtils';

export const useTableData = ({
  data = [],
  columns = [],
  fields = [],
  hiddenColumns = [],
  columnOrder = [],
  enableAutoMerge = false,
  mergeConfig = {},
  enablePivotTable = false,
  pivotConfig = {},
  // Individual pivot props
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
  // Pivot UI state
  enablePivotUI = false,
  localPivotConfig = null,
  // GraphQL data
  graphqlQuery = null,
  graphqlData = [],
  loading = false,
  error = null,
  graphqlLoading = false,
  graphqlError = null
}) => {
  // Process data - handle merging if needed
  const processedData = useMemo(() => {
    let rawData = graphqlQuery ? graphqlData : data;
    return processDataWithMerge(rawData, enableAutoMerge, mergeConfig);
  }, [data, graphqlData, graphqlQuery, enableAutoMerge, mergeConfig]);

  // Use processed data
  const tableData = processedData;
  const isLoading = graphqlQuery ? graphqlLoading : loading;
  const tableError = graphqlQuery ? graphqlError : error;

  // Generate default columns from data
  const defaultColumns = useMemo(() => {
    if (columns.length > 0) {
      // Normalize keys from field/header if missing
      const normalizedColumns = columns.map(col => {
        const key = col.key || col.field || col.header || col.name;
        return {
          key,
          title: col.title || col.header || key,
          sortable: col.sortable !== false,
          filterable: col.filterable !== false,
          type: col.type || 'text',
          ...col,
          key // override or re-add key to make sure it's set
        };
      });

      const orderedColumns = columnOrder.length > 0 
        ? columnOrder.map(key => normalizedColumns.find(col => col.key === key)).filter(Boolean)
        : normalizedColumns;

      return orderedColumns.filter(col => !hiddenColumns.includes(col.key));
    } else if (tableData.length > 0) {
      return generateColumnsFromData(tableData, fields, hiddenColumns, columnOrder);
    }
    return [];
  }, [columns, tableData, hiddenColumns, columnOrder, fields]);

  // Merge individual pivot props with pivotConfig object
  const mergedPivotConfig = useMemo(() => {
    const individualProps = {
      pivotRows,
      pivotColumns,
      pivotValues,
      pivotFilters,
      pivotShowGrandTotals,
      pivotShowRowTotals,
      pivotShowColumnTotals,
      pivotShowSubTotals,
      pivotNumberFormat,
      pivotCurrency,
      pivotPrecision,
      pivotFieldSeparator,
      pivotSortRows,
      pivotSortColumns,
      pivotSortDirection,
      pivotAggregationFunctions
    };

    return mergePivotConfig(enablePivotTable, pivotConfig, individualProps, localPivotConfig, enablePivotUI);
  }, [
    enablePivotTable, pivotRows, pivotColumns, pivotValues, pivotFilters,
    pivotShowGrandTotals, pivotShowRowTotals, pivotShowColumnTotals, pivotShowSubTotals,
    pivotNumberFormat, pivotCurrency, pivotPrecision, pivotFieldSeparator,
    pivotSortRows, pivotSortColumns, pivotSortDirection, pivotAggregationFunctions,
    pivotConfig, enablePivotUI, localPivotConfig
  ]);

  const [isPivotEnabled, setIsPivotEnabled] = useState(enablePivotTable && mergedPivotConfig.enabled);

  // Update isPivotEnabled when props change
  useEffect(() => {
    setIsPivotEnabled(enablePivotTable && mergedPivotConfig.enabled);
  }, [enablePivotTable, mergedPivotConfig.enabled]);

  // Pivot data transformation
  const pivotTransformation = useMemo(() => {
    if (!isPivotEnabled || !mergedPivotConfig.enabled) {
      return { 
        pivotData: tableData, 
        pivotColumns: [], 
        columnValues: [], 
        isPivot: false 
      };
    }

    try {
      const result = transformToPivotData(tableData, mergedPivotConfig);
      return {
        ...result,
        isPivot: true
      };
    } catch (error) {
      console.error('Error transforming data to pivot:', error);
      return { 
        pivotData: tableData, 
        pivotColumns: [], 
        columnValues: [], 
        isPivot: false 
      };
    }
  }, [tableData, isPivotEnabled, mergedPivotConfig]);

  // Final data source - either original data or pivot data
  const finalTableData = pivotTransformation.isPivot ? pivotTransformation.pivotData : tableData;
  const hasPivotData = pivotTransformation.isPivot && pivotTransformation.pivotData.length > 0;

  // Use pivot columns if pivot is enabled and available
  const finalColumns = useMemo(() => {
    if (pivotTransformation.isPivot && pivotTransformation.pivotColumns.length > 0) {
      return pivotTransformation.pivotColumns.map(col => ({
        ...col,
        sortable: col.sortable !== false,
        filterable: col.filterable !== false,
        type: col.type || 'text'
      }));
    }
    return defaultColumns;
  }, [pivotTransformation.isPivot, pivotTransformation.pivotColumns, defaultColumns]);

  return {
    // Processed data
    tableData,
    finalTableData,
    finalColumns,
    defaultColumns,
    
    // Loading states
    isLoading,
    tableError,
    
    // Pivot data
    pivotTransformation,
    hasPivotData,
    isPivotEnabled,
    setIsPivotEnabled,
    mergedPivotConfig
  };
}; 