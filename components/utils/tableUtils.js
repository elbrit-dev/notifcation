// Merge function for combining data from multiple arrays
export const mergeData = (by = [], preserve = []) => (tables = {}) => {
  const getKey = row => by.map(k => row?.[k] ?? "").join("||");
  const preserveKey = preserve.find(k => by.includes(k));
  const preserveCache = {};
  
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
  
  return Object.values(mergedMap);
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
    .filter(row => row && typeof row === 'object')
    .map(row => row[key])
    .filter(val => val !== null && val !== undefined))];
};

// Auto-detect merge fields
export const autoDetectMergeFields = (rawData) => {
  const allKeys = new Set();
  Object.values(rawData).forEach(array => {
    if (Array.isArray(array)) {
      array.forEach(row => {
        if (row && typeof row === 'object') {
          Object.keys(row).forEach(key => allKeys.add(key));
        }
      });
    }
  });
  
  const commonFields = Array.from(allKeys).filter(key => {
    return Object.values(rawData).every(array => 
      Array.isArray(array) && array.some(row => row && key in row)
    );
  });
  
  const mergeBy = commonFields.filter(field => 
    field.toLowerCase().includes('id') || 
    field.toLowerCase().includes('code') || 
    field.toLowerCase().includes('date') ||
    field.toLowerCase().includes('key')
  );
  
  const mergePreserve = commonFields.filter(field => 
    field.toLowerCase().includes('name') || 
    field.toLowerCase().includes('team') || 
    field.toLowerCase().includes('hq') ||
    field.toLowerCase().includes('location')
  );
  
  return { mergeBy, mergePreserve, commonFields };
};

// Process data with auto-merge functionality
export const processDataWithMerge = (data, enableAutoMerge, mergeConfig) => {
  if (!enableAutoMerge || !needsMerging(data)) {
    return data;
  }
  
  const { by, preserve, autoDetectMergeFields: autoDetect } = mergeConfig;
  let mergeBy = by;
  let mergePreserve = preserve;
  
  if (autoDetect) {
    const detected = autoDetectMergeFields(data);
    if (mergeBy.length === 0) {
      mergeBy = detected.mergeBy.length > 0 ? detected.mergeBy : [detected.commonFields[0]].filter(Boolean);
    }
    if (mergePreserve.length === 0) {
      mergePreserve = detected.mergePreserve;
    }
  }
  
  if (mergeBy.length > 0) {
    const mergeFunction = mergeData(mergeBy, mergePreserve);
    return mergeFunction(data);
  } else {
    // Flatten data with group markers
    const flattenedData = [];
    Object.entries(data).forEach(([groupKey, array]) => {
      if (Array.isArray(array)) {
        array.forEach(row => {
          if (row && typeof row === 'object') {
            flattenedData.push({
              ...row,
              __group: groupKey
            });
          }
        });
      }
    });
    return flattenedData;
  }
};

// Generate column type from data
export const detectColumnType = (value) => {
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
  if (typeof value === 'string' && value.includes('T') && value.includes('Z')) return 'datetime';
  return 'text';
};

// Auto-generate columns from data
export const generateColumnsFromData = (data, fields = [], hiddenColumns = [], columnOrder = []) => {
  if (!data.length) return [];
  
  const sampleRow = data[0];
  const autoColumns = Object.keys(sampleRow).map(key => {
    const value = sampleRow[key];
    const type = detectColumnType(value);
    
    return {
      key,
      title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      sortable: true,
      filterable: true,
      type
    };
  });
  
  let orderedColumns = columnOrder.length > 0 
    ? columnOrder.map(key => autoColumns.find(col => col.key === key)).filter(Boolean)
    : autoColumns;
  
  orderedColumns = orderedColumns.filter(col => !hiddenColumns.includes(col.key));
  
  if (fields && Array.isArray(fields) && fields.length > 0) {
    orderedColumns = orderedColumns.filter(col => fields.includes(col.key));
  }
  
  return orderedColumns;
}; 