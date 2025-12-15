// HIBERNATION FIX: Production-safe console wrapper
const safeConsole = {
  log: process.env.NODE_ENV === 'development' ? console.log : () => {},
  warn: process.env.NODE_ENV === 'development' ? console.warn : () => {},
  error: console.error // Always show errors
};

// Merge function for combining data from multiple arrays
export const mergeData = (by = [], preserve = []) => (tables = {}) => {
  // CRITICAL: Ensure tables is valid
  if (!tables || typeof tables !== 'object') {
    console.error('mergeData: invalid tables parameter, returning empty array');
    return [];
  }
  
  // CRITICAL: Ensure by array is valid
  if (!Array.isArray(by) || by.length === 0) {
    console.warn('mergeData: invalid or empty by array, returning flattened data');
    const flattened = Object.values(tables).flat().filter(row => row && typeof row === 'object');
    return flattened;
  }
  
  const getKey = row => by.map(k => row?.[k] ?? "").join("||");
  const preserveKey = preserve.find(k => by.includes(k));
  const preserveCache = {};
  
  try {
    Object.values(tables).flat().forEach(row => {
    const id = row?.[preserveKey];
    if (!id) return;
    
    preserveCache[id] ??= {};
    preserve.forEach(field => {
      const value = row?.[field];
      if (value !== undefined && value !== null && value !== "" && value !== 0 && !preserveCache[id][field]) {
        preserveCache[id][field] = value;
      }
    });
  });
  
  const mergedMap = Object.values(tables).flat().reduce((acc, row) => {
    const key = getKey(row);
    const existing = acc[key] || {};
    const id = row?.[preserveKey];
    
    acc[key] = {
      ...existing,
      ...row
    };
    
    preserve.forEach(field => {
      const current = acc[key][field];
      if ((current === undefined || current === null || current === "" || current === 0) && id && preserveCache[id]?.[field]) {
        acc[key][field] = preserveCache[id][field];
      }
    });
    
    return acc;
  }, {});
  
  const result = Object.values(mergedMap);
  
  // CRITICAL: Ensure result is an array
  if (!Array.isArray(result)) {
    console.error('mergeData: result is not an array, returning empty array');
    return [];
  }
  
  return result;
  } catch (error) {
    console.error('mergeData: error during merge operation:', error);
    // Fallback: return flattened data without merging
    try {
      const flattened = Object.values(tables).flat().filter(row => row && typeof row === 'object');
      return Array.isArray(flattened) ? flattened : [];
    } catch (fallbackError) {
      console.error('mergeData: error in fallback operation:', fallbackError);
      return [];
    }
  }
};

// Helper to detect if data needs merging (object with arrays)
export const needsMerging = (data) => {
  return data && 
         typeof data === 'object' && 
         !Array.isArray(data) && 
         Object.values(data).some(val => Array.isArray(val));
};

// Helper to get unique values for a column
export const getUniqueValues = (data, key) => {
  return [...new Set(data
    .filter(row => row && typeof row === 'object') // Filter out null/undefined rows
    .map(row => row[key])
    .filter(val => val !== null && val !== undefined))];
};

// HIBERNATION FIX: Large dataset warning and processing limit
export const getDataSize = (data) => {
  if (Array.isArray(data)) return data.length;
  if (typeof data === 'object' && data !== null) {
    return Object.values(data).reduce((total, arr) => 
      total + (Array.isArray(arr) ? arr.length : 0), 0);
  }
  return 0;
};

// Process data with auto-merge, ROI calculation and validation
export const processData = (
  rawData, 
  graphqlQuery, 
  graphqlData, 
  enableAutoMerge, 
  mergeConfig, 
  enableROICalculation, 
  calculateROI, 
  roiConfig
) => {
  let data = graphqlQuery ? graphqlData : rawData;
  
  // CRITICAL: Ensure data is valid and safe to process
  if (!data) {
    console.warn('processData: No data provided, returning empty array');
    return [];
  }
  
  // CRITICAL: Validate data type and structure
  if (Array.isArray(data) && data.length === 0) {
    return [];
  }
  
  // CRITICAL: If data is not an array and not an object, return empty array
  if (typeof data !== 'object') {
    console.warn('processData: Invalid data type provided, expected array or object, got:', typeof data);
    return [];
  }
  
  // CRITICAL: If data is an object but null, return empty array
  if (data === null) {
    console.warn('processData: Null data provided, returning empty array');
    return [];
  }
  
  // HIBERNATION FIX: Large dataset warning and processing limit
  const dataSize = getDataSize(data);
  if (dataSize > 10000) {
    console.warn(`⚠️ HIBERNATION WARNING: Processing ${dataSize} records. This may cause performance issues.`);
  }
  
  // Check if data needs merging (object with arrays)
  if (enableAutoMerge && needsMerging(data)) {
    
    const { by, preserve, autoDetectMergeFields, mergeStrategy } = mergeConfig;
    
    // Auto-detect merge fields if enabled
    let mergeBy = by;
    let mergePreserve = preserve;
    
    if (autoDetectMergeFields) {
      // HIBERNATION FIX: Limit sampling for large datasets
      const sampleArrays = Object.values(data).map(array => {
        if (Array.isArray(array)) {
          // For large datasets, sample only first 100 records for field detection
          return array.length > 100 ? array.slice(0, 100) : array;
        }
        return array;
      });
      
      // Get all unique keys from sampled arrays
      const allKeys = new Set();
      sampleArrays.forEach(array => {
        if (Array.isArray(array)) {
          array.forEach(row => {
            if (row && typeof row === 'object') {
              Object.keys(row).forEach(key => allKeys.add(key));
            }
          });
        }
      });
      
      // Find common fields across all arrays (potential merge keys)
      const commonFields = Array.from(allKeys).filter(key => {
        return sampleArrays.every(array => 
          Array.isArray(array) && array.some(row => row && key in row)
        );
      });
      
      // Auto-detect merge fields (common fields that look like IDs or dates)
      if (mergeBy.length === 0) {
        mergeBy = commonFields.filter(field => 
          field.toLowerCase().includes('id') || 
          field.toLowerCase().includes('code') || 
          field.toLowerCase().includes('date') ||
          field.toLowerCase().includes('key')
        );
        
        // If no obvious merge fields, use first common field
        if (mergeBy.length === 0 && commonFields.length > 0) {
          mergeBy = [commonFields[0]];
        }
      }
      
      // Auto-detect preserve fields (common fields that should be preserved)
      if (mergePreserve.length === 0) {
        mergePreserve = commonFields.filter(field => 
          field.toLowerCase().includes('name') || 
          field.toLowerCase().includes('team') || 
          field.toLowerCase().includes('hq') ||
          field.toLowerCase().includes('location')
        );
      }
    }
    
    safeConsole.log('Merge configuration:', { mergeBy, mergePreserve });
    
    // Perform the merge
    if (mergeBy.length > 0) {
      try {
        const mergeFunction = mergeData(mergeBy, mergePreserve);
        const mergedData = mergeFunction(data);
        
        // CRITICAL: Ensure merged data is an array
        if (!Array.isArray(mergedData)) {
          console.warn('processData: Merge function did not return an array, converting to array');
          return [];
        }
        
        data = mergedData;
      } catch (error) {
        console.error('processData: Error during data merge:', error);
        return [];
      }
    } else {
      // If no merge fields detected, flatten the data with group markers
      const flattenedData = [];
      try {
        Object.entries(data).forEach(([groupKey, array]) => {
          if (Array.isArray(array)) {
            array.forEach(row => {
              if (row && typeof row === 'object') {
                flattenedData.push({
                  ...row,
                  __group: groupKey // Add group marker for column grouping
                });
              }
            });
          }
        });
      } catch (error) {
        console.error('processData: Error during data flattening:', error);
        return [];
      }
      
      data = flattenedData;
    }
  }
  
  // HIBERNATION FIX: Optimized ROI calculation with batch processing
  let finalData = data;
  
  // CRITICAL: Ensure finalData is an array before processing
  if (!Array.isArray(finalData)) {
    if (finalData && typeof finalData === 'object') {
      // If it's an object but not an array, try to convert it
      console.warn('processData: Data is object but not array, attempting conversion');
      const objectKeys = Object.keys(finalData);
      if (objectKeys.length > 0) {
        // Try to find the first array property
        const firstArrayKey = objectKeys.find(key => Array.isArray(finalData[key]));
        if (firstArrayKey) {
          finalData = finalData[firstArrayKey];
        } else {
          // Convert object to array of values
          finalData = Object.values(finalData).filter(val => val && typeof val === 'object');
        }
      } else {
        finalData = [];
      }
    } else {
      console.warn('processData: Data is not array or object, returning empty array');
      return [];
    }
  }
  
  // NEW: ROI Calculation
  if (enableROICalculation && roiConfig?.showROIColumn && calculateROI) {
    try {
      // HIBERNATION FIX: Batch process ROI calculations for large datasets
      const batchSize = 1000;
      const processedBatches = [];
      
      for (let i = 0; i < finalData.length; i += batchSize) {
        const batch = finalData.slice(i, i + batchSize);
        const processedBatch = batch.map(row => {
          if (!row || typeof row !== 'object') return row;
          
          const roiValue = calculateROI(row);
          return {
            ...row,
            [roiConfig.roiColumnKey]: roiValue
          };
        });
        processedBatches.push(...processedBatch);
      }
      
      finalData = processedBatches;
    } catch (error) {
      console.error('processData: Error during ROI calculation:', error);
      // Continue without ROI calculation
    }
  }
  
  // CRITICAL: Final validation
  if (!Array.isArray(finalData)) {
    console.error('processData: Final data is not an array, returning empty array');
    return [];
  }
  
  // Filter out invalid rows
  const validData = finalData.filter(row => row && typeof row === 'object');
  
  return validData;
};