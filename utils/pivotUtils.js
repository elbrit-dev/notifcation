import { getUniqueValues } from './dataUtils.js';
import { executeCalculatedField, validateFormula, formatCalculatedValue } from './calculatedFieldsUtils.js';

// Pivot Table Helper Functions
export const parsePivotFieldName = (fieldName, config) => {
  if (config.parseFieldName && typeof config.parseFieldName === 'function') {
    return config.parseFieldName(fieldName);
  }
  
  // Default parsing logic for fields like "2025-04-01__serviceAmount"
  if (fieldName.includes(config.fieldSeparator)) {
    const parts = fieldName.split(config.fieldSeparator);
    return {
      prefix: parts[0], // e.g., "2025-04-01"
      suffix: parts.slice(1).join(config.fieldSeparator), // e.g., "serviceAmount"
      isDateField: config.dateFieldPattern.test(parts[0]),
      originalField: fieldName
    };
  }
  
  return {
    prefix: null,
    suffix: fieldName,
    isDateField: false,
    originalField: fieldName
  };
};

// Group data by specified fields
export const groupDataBy = (data, groupFields) => {
  const groups = {};
  
  data.forEach(row => {
    if (!row || typeof row !== 'object') return;
    
    // Create a key based on the grouping fields
    const key = groupFields.map(field => row[field] || '').join('|');
    
    if (!groups[key]) {
      groups[key] = {
        key,
        groupValues: {},
        rows: []
      };
      
      // Store the group values for easy access
      groupFields.forEach(field => {
        groups[key].groupValues[field] = row[field];
      });
    }
    
    groups[key].rows.push(row);
  });
  
  return Object.values(groups);
};

// Transform data into pivot structure
export const transformToPivotData = (data, config) => {
  // CRITICAL: Ensure data is an array
  if (!Array.isArray(data)) {
    console.error('transformToPivotData: data is not an array, returning empty result');
    return { pivotData: [], pivotColumns: [], columnValues: [] };
  }
  
  // CRITICAL: Ensure config is valid
  if (!config || typeof config !== 'object') {
    console.error('transformToPivotData: invalid config, returning original data');
    return { pivotData: data, pivotColumns: [], columnValues: [] };
  }
  
  if (!config.enabled || !data.length) {
    return { pivotData: data, pivotColumns: [], columnValues: [] };
  }
  
  const { rows, columns, values, filters } = config;
  
  // Step 1: Apply pivot filters if any
  let filteredData = data;
  if (filters && filters.length > 0) {
    // For now, we'll handle filters through the existing filter system
    // Could be enhanced to have specific pivot filter logic
  }
  
  // Step 2: If no pivot configuration, return original data
  if (rows.length === 0 && columns.length === 0 && values.length === 0) {
    return { pivotData: filteredData, pivotColumns: [] };
  }
  
  // Step 3: Group data by row fields
  const rowGroups = rows.length > 0 ? groupDataBy(filteredData, rows) : [{ key: 'all', groupValues: {}, rows: filteredData }];
  
  // Step 4: Get unique column values
  let columnValues = [];
  if (columns.length > 0) {
    columns.forEach(colField => {
      const uniqueVals = getUniqueValues(filteredData, colField);
      columnValues = [...columnValues, ...uniqueVals];
    });
    columnValues = [...new Set(columnValues)];
    
    if (config.sortColumns) {
      columnValues.sort((a, b) => {
        if (config.sortDirection === 'desc') {
          return String(b).localeCompare(String(a));
        }
        return String(a).localeCompare(String(b));
      });
    }
  }
  
  // Step 5: Create pivot structure
  const pivotData = [];
  
  rowGroups.forEach(rowGroup => {
    const pivotRow = { ...rowGroup.groupValues };
    
    // Store row-specific aggregated column values for meta-aggregation
    const rowMetaAggregationValues = {};
    
    // Add row totals
    if (config.showRowTotals && values.length > 0) {
      values.forEach(valueConfig => {
        const fieldName = valueConfig.field;
        const aggregation = valueConfig.aggregation || 'sum';
        const aggregateFunc = config.aggregationFunctions[aggregation];
        
        if (aggregateFunc) {
          const allValues = rowGroup.rows.map(row => row[fieldName]).filter(v => v !== null && v !== undefined);
          // Include aggregation type in key to support multiple aggregations for same field
          const totalKey = values.filter(v => v.field === fieldName).length > 1 
            ? `${fieldName}_${aggregation}_total` 
            : `${fieldName}_total`;
          const aggregatedValue = aggregateFunc(allValues);
          pivotRow[totalKey] = aggregatedValue;
          
          // Store for meta-aggregation
          if (!rowMetaAggregationValues[fieldName]) {
            rowMetaAggregationValues[fieldName] = {};
          }
          rowMetaAggregationValues[fieldName][aggregation] = aggregatedValue;
        }
      });
    }
    
    // Add column-specific values
    if (columns.length > 0) {
      columnValues.forEach(colValue => {
        // Get rows that match this column value
        const colRows = rowGroup.rows.filter(row => {
          return columns.some(colField => row[colField] === colValue);
        });
        
        // Calculate aggregated values for this column
        values.forEach(valueConfig => {
          const fieldName = valueConfig.field;
          const aggregation = valueConfig.aggregation || 'sum';
          const aggregateFunc = config.aggregationFunctions[aggregation];
          
          if (aggregateFunc) {
            const colValues = colRows.map(row => row[fieldName]).filter(v => v !== null && v !== undefined);
            // Include aggregation type in key to support multiple aggregations for same field
            const columnKey = `${colValue}_${fieldName}_${aggregation}`;
            const aggregatedValue = colValues.length > 0 ? aggregateFunc(colValues) : 0;
            pivotRow[columnKey] = aggregatedValue;
            
            // Store column value for meta-aggregation
            if (!rowMetaAggregationValues[fieldName]) {
              rowMetaAggregationValues[fieldName] = {};
            }
            if (!rowMetaAggregationValues[fieldName][`${aggregation}_columns`]) {
              rowMetaAggregationValues[fieldName][`${aggregation}_columns`] = [];
            }
            rowMetaAggregationValues[fieldName][`${aggregation}_columns`].push(aggregatedValue);
          }
        });
      });
    } else {
      // No column grouping, just add value fields directly
      values.forEach(valueConfig => {
        const fieldName = valueConfig.field;
        const aggregation = valueConfig.aggregation || 'sum';
        const aggregateFunc = config.aggregationFunctions[aggregation];
        
        if (aggregateFunc) {
          const allValues = rowGroup.rows.map(row => row[fieldName]).filter(v => v !== null && v !== undefined);
          // Include aggregation type in key to support multiple aggregations for same field
          const valueKey = values.length > 1 && values.filter(v => v.field === fieldName).length > 1 
            ? `${fieldName}_${aggregation}` 
            : fieldName;
          pivotRow[valueKey] = aggregateFunc(allValues);
        }
      });
    }
    
    // Add meta-aggregation columns
    const metaAggregations = config.metaAggregations || [];
    metaAggregations.forEach(metaAgg => {
      const { field, sourceAggregation, metaAggregation } = metaAgg;
      const metaKey = `${field}_${sourceAggregation}_${metaAggregation}`;
      
      if (rowMetaAggregationValues[field] && rowMetaAggregationValues[field][`${sourceAggregation}_columns`]) {
        const columnValues = rowMetaAggregationValues[field][`${sourceAggregation}_columns`];
        const aggregateFunc = config.aggregationFunctions[metaAggregation];
        
        if (aggregateFunc) {
          pivotRow[metaKey] = aggregateFunc(columnValues);
        }
      }
    });
    
    pivotData.push(pivotRow);
  });
  
  // Step 6: Process calculated fields
  const calculatedFields = config.calculatedFields || [];
  
  console.log('🧮 CALCULATED FIELDS DEBUG:', {
    calculatedFieldsCount: calculatedFields.length,
    calculatedFields: calculatedFields.map(cf => ({ name: cf.name, formula: cf.formula })),
    configHasCalculatedFields: !!config.calculatedFields
  });
  
  if (calculatedFields.length > 0) {
    // Get all available fields that can be used in calculated field formulas
    const availableFields = [];
    
    console.log('📊 AVAILABLE FIELDS DEBUG:', {
      values: values.map(v => ({ field: v.field, aggregation: v.aggregation })),
      columns: columns,
      showRowTotals: config.showRowTotals,
      showColumnTotals: config.showColumnTotals
    });
    
    // Add value fields
    values.forEach(valueConfig => {
      const fieldName = valueConfig.field;
      const aggregation = valueConfig.aggregation || 'sum';
      
      // Row totals
      if (config.showRowTotals) {
        const totalKey = values.filter(v => v.field === fieldName).length > 1 
          ? `${fieldName}_${aggregation}_total` 
          : `${fieldName}_total`;
        availableFields.push({
          key: totalKey,
          field: fieldName,
          aggregation: aggregation,
          type: 'number',
          title: `${fieldName} Total (${aggregation})`
        });
      }
      
      // Column-specific values
      if (columns.length > 0) {
        columnValues.forEach(colValue => {
          const columnKey = `${colValue}_${fieldName}_${aggregation}`;
          availableFields.push({
            key: columnKey,
            field: fieldName,
            aggregation: aggregation,
            type: 'number',
            title: `${colValue} - ${fieldName} (${aggregation})`,
            pivotColumn: colValue
          });
        });
      } else {
        // No column grouping
        const valueKey = values.length > 1 && values.filter(v => v.field === fieldName).length > 1 
          ? `${fieldName}_${aggregation}` 
          : fieldName;
        availableFields.push({
          key: valueKey,
          field: fieldName,
          aggregation: aggregation,
          type: 'number',
          title: `${fieldName} (${aggregation})`
        });
            }
    });
    
    console.log('🔧 FINAL AVAILABLE FIELDS:', availableFields.map(f => ({ 
      key: f.key, 
      field: f.field, 
      title: f.title 
    })));
  
  // Process each calculated field for each pivot row
  pivotData.forEach(pivotRow => {
    calculatedFields.forEach(calcField => {
      try {
        // Create a mapping of field names to actual pivot row keys
        const fieldMapping = {};
        availableFields.forEach(field => {
          // Map the field name to the actual key in pivotRow
          fieldMapping[field.key] = field.key;
          // Also map the field name without aggregation suffix
          const baseFieldName = field.field || field.name;
          fieldMapping[baseFieldName] = field.key;
          
          // Map common field name patterns
          // For fields like "MRP_total", also map "MRP" and "MRP_total"
          if (field.key.includes('_total')) {
            const baseName = field.key.replace('_total', '');
            fieldMapping[baseName] = field.key;
            fieldMapping[`${baseName}_total`] = field.key;
          }
          
          // For fields like "field_aggregation", map both "field" and "field_aggregation"
          if (field.key.includes('_')) {
            const parts = field.key.split('_');
            if (parts.length >= 2) {
              const baseName = parts[0];
              fieldMapping[baseName] = field.key;
            }
          }
        });
        
            console.log('🔍 FIELD MAPPING DEBUG:', {
      calcFieldName: calcField.name,
      formula: calcField.formula,
      availableFields: availableFields.map(f => ({ key: f.key, field: f.field, title: f.title })),
      fieldMapping: fieldMapping,
      pivotRowKeys: Object.keys(pivotRow).filter(k => typeof pivotRow[k] === 'number'),
      pivotRowData: Object.keys(pivotRow).reduce((acc, key) => {
        if (typeof pivotRow[key] === 'number') {
          acc[key] = pivotRow[key];
        }
        return acc;
      }, {})
    });
          

          
          // Validate formula against available fields
          const validation = validateFormula(calcField.formula, availableFields);
          if (validation.isValid) {
            // Execute the calculated field with field mapping
            const result = executeCalculatedField(calcField.formula, pivotRow, availableFields, fieldMapping);
            
            // Store the calculated value
            const baseKey = calcField.id || calcField.name.replace(/\s+/g, '_');
            const calcFieldKey = baseKey.startsWith('calc_') ? baseKey : `calc_${baseKey}`;
            pivotRow[calcFieldKey] = result;
            
            // Debug logging to track calculated field key generation
            console.log('🔍 CALCULATED FIELD KEY GENERATION:', {
              originalId: calcField.id,
              originalName: calcField.name,
              baseKey: baseKey,
              finalKey: calcFieldKey,
              hasCalcPrefix: baseKey.startsWith('calc_'),
              result: result
            });
            

            
            // Store metadata for column generation
            pivotRow[`${calcFieldKey}_meta`] = {
              name: calcField.name,
              formula: calcField.formula,
              format: calcField.format || 'number',
              description: calcField.description
            };
          } else {
            console.warn(`Calculated field '${calcField.name}' validation failed:`, validation.errors);
            // Store error value
            const baseKey = calcField.id || calcField.name.replace(/\s+/g, '_');
            const calcFieldKey = baseKey.startsWith('calc_') ? baseKey : `calc_${baseKey}`;
            pivotRow[calcFieldKey] = 'Error';
          }
        } catch (error) {
          console.error(`Error calculating field '${calcField.name}':`, error);
          const baseKey = calcField.id || calcField.name.replace(/\s+/g, '_');
          const calcFieldKey = baseKey.startsWith('calc_') ? baseKey : `calc_${baseKey}`;
          pivotRow[calcFieldKey] = 'Error';
        }
      });
    });
  }

  // Step 7: Calculate grand totals separately (don't add to pivotData)
  let grandTotalData = null;
  if (config.showGrandTotals && pivotData.length > 0) {
    const grandTotalRow = { isGrandTotal: true };
    
    // Set row field values to "Grand Total"
    rows.forEach(rowField => {
      grandTotalRow[rowField] = 'Grand Total';
    });
    
    // Calculate grand totals for each value
    values.forEach(valueConfig => {
      const fieldName = valueConfig.field;
      const aggregation = valueConfig.aggregation || 'sum';
      const aggregateFunc = config.aggregationFunctions[aggregation];
      
      if (aggregateFunc) {
        const allValues = filteredData.map(row => row[fieldName]).filter(v => v !== null && v !== undefined);
        
        if (config.showRowTotals) {
          // Include aggregation type in key to support multiple aggregations for same field
          const totalKey = values.filter(v => v.field === fieldName).length > 1 
            ? `${fieldName}_${aggregation}_total` 
            : `${fieldName}_total`;
          grandTotalRow[totalKey] = aggregateFunc(allValues);
        }
        
        if (columns.length > 0) {
          columnValues.forEach(colValue => {
            const colRows = filteredData.filter(row => {
              return columns.some(colField => row[colField] === colValue);
            });
            const colValues = colRows.map(row => row[fieldName]).filter(v => v !== null && v !== undefined);
            // Include aggregation type in key to support multiple aggregations for same field
            const columnKey = `${colValue}_${fieldName}_${aggregation}`;
            grandTotalRow[columnKey] = colValues.length > 0 ? aggregateFunc(colValues) : 0;
        });
      } else {
          // Include aggregation type in key to support multiple aggregations for same field
          const valueKey = values.length > 1 && values.filter(v => v.field === fieldName).length > 1 
            ? `${fieldName}_${aggregation}` 
            : fieldName;
          grandTotalRow[valueKey] = aggregateFunc(allValues);
        }
      }
    });
    
    // Calculate grand totals for calculated fields
    const calculatedFields = config.calculatedFields || [];
    if (calculatedFields.length > 0 && pivotData.length > 0) {
      // Use the first pivot row as a template for available fields
      const templateRow = pivotData[0];
      const availableFields = [];
      
      // Add all numeric fields that can be aggregated
      Object.keys(templateRow).forEach(key => {
        if (typeof templateRow[key] === 'number' && !key.includes('_meta')) {
          availableFields.push({
            key: key,
            type: 'number',
            title: key
          });
        }
      });
      
      calculatedFields.forEach(calcField => {
        try {
          const validation = validateFormula(calcField.formula, availableFields);
          if (validation.isValid) {
            // For grand totals, we need to aggregate the calculated values from all rows
            const baseKey = calcField.id || calcField.name.replace(/\s+/g, '_');
            const calcFieldKey = baseKey.startsWith('calc_') ? baseKey : `calc_${baseKey}`;
            const calculatedValues = pivotData
              .map(row => row[calcFieldKey])
              .filter(v => typeof v === 'number' && !isNaN(v));
            
            if (calculatedValues.length > 0) {
              // Use sum aggregation for grand total of calculated fields
              // This could be made configurable in the future
              grandTotalRow[calcFieldKey] = calculatedValues.reduce((sum, val) => sum + val, 0);
            }
          }
        } catch (error) {
          console.error(`Error calculating grand total for calculated field '${calcField.name}':`, error);
        }
      });
    }
    
    // Store grand total data separately instead of adding to pivotData
    grandTotalData = grandTotalRow;
  }
  
  // Step 8: Generate pivot columns
  const pivotColumns = generatePivotColumns(config, columnValues);
  
  // CRITICAL: Check for duplicate keys in pivot data to prevent hydration errors
  if (pivotData.length > 0) {
    const sampleRow = pivotData[0];
    const allKeys = Object.keys(sampleRow);
    const duplicateKeys = allKeys.filter((key, index) => allKeys.indexOf(key) !== index);
    
    if (duplicateKeys.length > 0) {
      console.error('❌ DUPLICATE KEYS DETECTED IN PIVOT DATA:', {
        duplicateKeys: duplicateKeys,
        allKeys: allKeys,
        sampleRow: sampleRow
      });
    } else {
      console.log('✅ NO DUPLICATE KEYS FOUND IN PIVOT DATA');
    }
  }
  
  return { pivotData, pivotColumns, columnValues, grandTotalData };
};

// Generate columns for pivot table
export const generatePivotColumns = (config, columnValues) => {
  const { rows, columns, values } = config;
  const pivotColumns = [];
  
  // Add row grouping columns
  rows.forEach(rowField => {
    pivotColumns.push({
      key: rowField,
      title: rowField.charAt(0).toUpperCase() + rowField.slice(1).replace(/([A-Z])/g, ' $1'),
      sortable: true,
      filterable: true,
      type: 'text',
      isPivotRow: true
          });
        });
  
  // Add value columns (when no column grouping)
  if (columns.length === 0) {
    values.forEach(valueConfig => {
      const fieldName = valueConfig.field;
      const aggregation = valueConfig.aggregation || 'sum';
      
      // Include aggregation type in key to support multiple aggregations for same field
      const valueKey = values.length > 1 && values.filter(v => v.field === fieldName).length > 1 
        ? `${fieldName}_${aggregation}` 
        : fieldName;
      
      pivotColumns.push({
        key: valueKey,
        title: `${fieldName} (${aggregation})`,
        sortable: true,
        filterable: true,
        type: 'number',
        isPivotValue: true
      });
    });
  } else {
    // Add column-grouped value columns
    columnValues.forEach(colValue => {
      values.forEach(valueConfig => {
        const fieldName = valueConfig.field;
        const aggregation = valueConfig.aggregation || 'sum';
        // Include aggregation type in key to support multiple aggregations for same field
        const columnKey = `${colValue}_${fieldName}_${aggregation}`;
        
        pivotColumns.push({
          key: columnKey,
          title: `${colValue} - ${fieldName} (${aggregation})`,
          sortable: true,
          filterable: true,
          type: 'number',
          isPivotValue: true,
          pivotColumn: colValue,
          pivotField: fieldName,
          pivotAggregation: aggregation
        });
      });
    });
  }
  
  // Add row total columns
  if (config.showRowTotals && values.length > 0) {
    values.forEach(valueConfig => {
      const fieldName = valueConfig.field;
      const aggregation = valueConfig.aggregation || 'sum';
      
      // Include aggregation type in key to support multiple aggregations for same field
      const totalKey = values.filter(v => v.field === fieldName).length > 1 
        ? `${fieldName}_${aggregation}_total` 
        : `${fieldName}_total`;
      
      pivotColumns.push({
        key: totalKey,
        title: `${fieldName} Total (${aggregation})`,
        sortable: true,
        filterable: true,
        type: 'number',
        isPivotTotal: true
      });
    });
  }
  
  // Add meta-aggregation columns
  const metaAggregations = config.metaAggregations || [];
  metaAggregations.forEach(metaAgg => {
    const metaKey = `${metaAgg.field}_${metaAgg.sourceAggregation}_${metaAgg.metaAggregation}`;
    
    pivotColumns.push({
      key: metaKey,
      title: `${metaAgg.metaAggregation.toUpperCase()} of ${metaAgg.field} (${metaAgg.sourceAggregation})`,
      sortable: true,
      filterable: true,
      type: 'number',
      isPivotMetaAggregation: true,
      metaAggregation: metaAgg.metaAggregation,
      primaryField: metaAgg.field,
      primaryAggregation: metaAgg.sourceAggregation
    });
  });

  // Add calculated field columns
  const calculatedFields = config.calculatedFields || [];
  
  calculatedFields.forEach(calcField => {
    const baseKey = calcField.id || calcField.name.replace(/\s+/g, '_');
    const calcFieldKey = baseKey.startsWith('calc_') ? baseKey : `calc_${baseKey}`;
    
    console.log('🔗 CREATING CALCULATED FIELD COLUMN:', {
      calcFieldName: calcField.name,
      calcFieldKey: calcFieldKey,
      formula: calcField.formula,
      calculatedFieldsCount: calculatedFields.length
    });
    
    pivotColumns.push({
      key: calcFieldKey,
      title: calcField.name,
      sortable: true,
      filterable: true,
      type: 'number',
      isPivotCalculatedField: true,
      calculatedField: calcField,
      formula: calcField.formula,
      format: calcField.format || 'number',
      description: calcField.description,
      dependencies: calcField.dependencies || [],
      // Custom cell renderer for calculated fields
      cellRenderer: (value, rowData) => {
        if (value === 'Error') {
          return '<span style="color: red;">Error</span>';
        }
        return formatCalculatedValue(value, calcField.format || 'number');
      }
    });
  });
  
  console.log('📊 FINAL PIVOT COLUMNS:', pivotColumns.map(col => ({
    key: col.key,
    title: col.title,
    isPivotCalculatedField: col.isPivotCalculatedField,
    type: col.type,
    sortable: col.sortable,
    filterable: col.filterable,
    calculatedField: col.calculatedField ? {
      name: col.calculatedField.name,
      formula: col.calculatedField.formula
    } : null
  })));
  
  console.log('📊 FINAL PIVOT DATA SAMPLE:', pivotData.slice(0, 2).map(row => ({
    brand: row.brand,
    numericKeys: Object.keys(row).filter(k => typeof row[k] === 'number'),
    calcKeys: Object.keys(row).filter(k => k.startsWith('calc_')),
    calcValues: Object.keys(row).filter(k => k.startsWith('calc_')).reduce((acc, key) => {
      acc[key] = row[key];
      return acc;
    }, {})
  })));
  
  return pivotColumns;
};