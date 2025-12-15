import { useCallback } from 'react';

// Detect group keywords for auto column grouping
export const detectGroupKeywords = (columns, ungroupedColumns) => {
  if (!Array.isArray(columns)) return {};
  
  const groups = {};
  const groupKeywords = [
    'inventory', 'warehouse', 'stock', 'product',
    'sales', 'revenue', 'order', 'transaction',
    'service', 'support', 'customer', 'client',
    'finance', 'payment', 'billing', 'invoice',
    'user', 'employee', 'staff', 'member',
    'project', 'task', 'activity', 'milestone',
    'date', 'time', 'period', 'schedule',
    'total', 'amount', 'value', 'cost'
  ];
  
  columns.forEach(column => {
    if (!column.key || ungroupedColumns.includes(column.key)) return;
    
    const key = column.key.toLowerCase();
    let assigned = false;
    
    // Check for exact matches or contains
    for (const keyword of groupKeywords) {
      if (key.includes(keyword)) {
        const groupName = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        groups[groupName].push(column);
        assigned = true;
        break;
      }
    }
    
    // If no keyword match, try to group by prefix (before underscore)
    if (!assigned && key.includes('_')) {
      const prefix = key.split('_')[0];
      const groupName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(column);
      assigned = true;
    }
    
    // If still not assigned, put in "Other" group if it looks like it should be grouped
    if (!assigned && (key.includes('amount') || key.includes('total') || key.includes('value'))) {
      if (!groups['Other']) {
        groups['Other'] = [];
      }
      groups['Other'].push(column);
    }
  });
  
  // Remove groups with only one column (unless they're important)
  const importantGroups = ['Sales', 'Service', 'Finance', 'Total', 'Amount'];
  Object.keys(groups).forEach(groupName => {
    if (groups[groupName].length === 1 && !importantGroups.includes(groupName)) {
      delete groups[groupName];
    }
  });
  
  return groups;
};

// Process column structure with grouping
export const processFinalColumnStructure = (
  defaultColumns,
  enableColumnGrouping,
  enableAutoColumnGrouping,
  groupConfig,
  tableData
) => {
  if (!enableColumnGrouping) {
    return {
      hasGroups: false,
      groups: {},
      ungroupedColumns: defaultColumns,
      allColumns: defaultColumns
    };
  }

  const { 
    ungroupedColumns = [], 
    customGroupMappings = {},
    groupingPatterns = []
  } = groupConfig;

  let groups = {};
  let remainingColumns = [...defaultColumns];

  // Step 1: Apply custom group mappings
  if (Object.keys(customGroupMappings).length > 0) {
    remainingColumns = remainingColumns.filter(column => {
      const key = column.key?.toLowerCase() || '';
      
      for (const [pattern, groupName] of Object.entries(customGroupMappings)) {
        if (key.includes(pattern.toLowerCase())) {
          if (!groups[groupName]) {
            groups[groupName] = [];
          }
          groups[groupName].push(column);
          return false; // Remove from remaining
        }
      }
      return true; // Keep in remaining
    });
  }

  // Step 2: Apply auto-detection if enabled
  if (enableAutoColumnGrouping) {
    const autoDetectedGroups = detectGroupKeywords(remainingColumns, ungroupedColumns);
    
    // Merge auto-detected groups with existing groups
    Object.entries(autoDetectedGroups).forEach(([groupName, columns]) => {
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(...columns);
      
      // Remove these columns from remaining
      remainingColumns = remainingColumns.filter(col => 
        !columns.some(groupCol => groupCol.key === col.key)
      );
    });
  }

  // Step 3: Handle explicitly ungrouped columns
  const explicitlyUngrouped = remainingColumns.filter(col => 
    ungroupedColumns.includes(col.key)
  );
  
  const finalUngroupedColumns = explicitlyUngrouped.concat(
    remainingColumns.filter(col => !ungroupedColumns.includes(col.key) && 
      !Object.values(groups).flat().some(groupCol => groupCol.key === col.key))
  );

  // Step 4: Create final structure
  const hasGroups = Object.keys(groups).length > 0;
  const allColumns = [...finalUngroupedColumns, ...Object.values(groups).flat()];

  return {
    hasGroups,
    groups,
    ungroupedColumns: finalUngroupedColumns,
    allColumns
  };
};

// Generate default columns from data
export const generateDefaultColumns = (data, fields, imageFields, popupImageFields) => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  // Get sample row to extract keys
  const sampleRow = data.find(row => row && typeof row === 'object');
  if (!sampleRow) {
    return [];
  }

  let columnKeys = [];
  
  // Use provided fields if available
  if (Array.isArray(fields) && fields.length > 0) {
    columnKeys = fields;
  } else {
    // Extract from data but filter out expansion fields
    columnKeys = Object.keys(sampleRow).filter(key => {
      const value = sampleRow[key];
      
      // Filter out fields that are meant for row expansion
      if (key === 'invoices' || key === 'orders' || key === 'children' || key === 'subItems' || key === 'nestedData') {
        return false;
      }
      
      // Filter out fields that contain arrays of objects (potential expansion data)
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
        return false;
      }
      
      return true;
    });
  }

  return columnKeys.map(key => {
    // Determine column type based on data
    const sampleValue = sampleRow[key];
    let type = 'text';
    
    if (typeof sampleValue === 'number') {
      type = 'number';
    } else if (sampleValue instanceof Date || 
               (typeof sampleValue === 'string' && !isNaN(Date.parse(sampleValue)))) {
      type = 'date';
    } else if (typeof sampleValue === 'boolean') {
      type = 'boolean';
    } else if (imageFields?.includes(key)) {
      type = 'image';
    }

    return {
      key,
      title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      sortable: true,
      filterable: true,
      type,
      isImage: imageFields?.includes(key),
      isPopupImage: popupImageFields?.includes(key)
    };
  });
};

// Create column structure for grouped display
export const createColumnGroups = (groups, ungroupedColumns) => {
  const columnGroups = [];
  
  // Create group headers
  Object.entries(groups).forEach(([groupName, columns]) => {
    if (columns.length > 0) {
      columnGroups.push({
        header: groupName,
        colspan: columns.length,
        columns: columns
      });
    }
  });
  
  // Add ungrouped columns
  if (ungroupedColumns.length > 0) {
    ungroupedColumns.forEach(column => {
      columnGroups.push({
        header: column.title,
        colspan: 1,
        columns: [column],
        isUngrouped: true
      });
    });
  }
  
  return columnGroups;
};

// Get column by key
export const getColumnByKey = (columns, key) => {
  return columns.find(col => col.key === key);
};

// Filter columns by type
export const filterColumnsByType = (columns, type) => {
  return columns.filter(col => col.type === type);
};

// Sort columns by title
export const sortColumnsByTitle = (columns, direction = 'asc') => {
  return [...columns].sort((a, b) => {
    const titleA = a.title?.toLowerCase() || '';
    const titleB = b.title?.toLowerCase() || '';
    
    if (direction === 'desc') {
      return titleB.localeCompare(titleA);
    }
    return titleA.localeCompare(titleB);
  });
};