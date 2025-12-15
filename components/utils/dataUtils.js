// HIBERNATION FIX: Production-safe console wrapper
const safeConsole = {
  log: process.env.NODE_ENV === 'development' ? console.log : () => {},
  warn: process.env.NODE_ENV === 'development' ? console.warn : () => {},
  error: console.error // Always show errors
};

// ---------- Generic helpers ----------
const isPlainObject = (val) => val !== null && typeof val === 'object' && !Array.isArray(val);
const isNonEmptyValue = (val) => val !== undefined && val !== null && val !== '';
const isEmptyValue = (val) => !isNonEmptyValue(val) || (typeof val === 'number' && Number.isNaN(val));

const choosePreferNonEmpty = (a, b) => {
  if (isEmptyValue(a) && isNonEmptyValue(b)) return b;
  return a;
};

const normalizeForKey = (val) => {
  if (val === undefined || val === null) return '';
  if (typeof val === 'string') return val.trim().toLowerCase();
  if (val instanceof Date) return String(val.getTime());
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? '1' : '0';
  return JSON.stringify(val);
};

const findLikelyIdKey = (obj) => {
  if (!isPlainObject(obj)) return null;
  const keys = Object.keys(obj);
  const lower = keys.map(k => k.toLowerCase());
  const candidates = ['id', 'uuid', 'code', 'key', 'pk', 'ekey'];
  for (const cand of candidates) {
    const idx = lower.indexOf(cand);
    if (idx !== -1) return keys[idx];
  }
  // Also check for compound like somethingId
  const idx2 = lower.findIndex(k => k.endsWith('id') || k.endsWith('code'));
  return idx2 !== -1 ? keys[idx2] : null;
};

const computeCompositeKey = (row, mergeBy) => {
  if (!isPlainObject(row)) return '';
  return mergeBy.map(k => normalizeForKey(row?.[k])).join('||');
};

const deepMergeArrays = (aArr, bArr) => {
  const a = Array.isArray(aArr) ? aArr : [];
  const b = Array.isArray(bArr) ? bArr : [];
  if (a.length === 0) return [...b];
  if (b.length === 0) return [...a];
  // If elements are primitives, return unique set by normalized value
  const all = [...a, ...b];
  if (!all.some(isPlainObject)) {
    const seen = new Set();
    const out = [];
    for (const v of all) {
      const key = normalizeForKey(v);
      if (!seen.has(key)) {
        seen.add(key);
        out.push(v);
      }
    }
    return out;
  }
  // Elements are objects; dedupe by likely id key if present
  const sampleObj = all.find(isPlainObject) || {};
  const idKey = findLikelyIdKey(sampleObj);
  if (!idKey) {
    // Fallback: dedupe by JSON stringification
    const seen = new Set();
    const out = [];
    for (const v of all) {
      const key = JSON.stringify(v ?? null);
      if (!seen.has(key)) {
        seen.add(key);
        out.push(v);
      }
    }
    return out;
  }
  const map = new Map();
  for (const item of all) {
    if (!isPlainObject(item)) continue;
    const key = normalizeForKey(item[idKey]);
    if (!map.has(key)) {
      map.set(key, item);
    } else {
      map.set(key, deepMergeObjects(map.get(key), item));
    }
  }
  return Array.from(map.values());
};

const deepMergeObjects = (aObj, bObj) => {
  const a = isPlainObject(aObj) ? aObj : {};
  const b = isPlainObject(bObj) ? bObj : {};
  const result = { ...a };
  for (const key of Object.keys(b)) {
    const aVal = result[key];
    const bVal = b[key];
    if (Array.isArray(aVal) || Array.isArray(bVal)) {
      result[key] = deepMergeArrays(aVal, bVal);
    } else if (isPlainObject(aVal) && isPlainObject(bVal)) {
      result[key] = deepMergeObjects(aVal, bVal);
    } else {
      // Prefer non-empty; otherwise b overrides
      result[key] = choosePreferNonEmpty(aVal, bVal);
    }
  }
  return result;
};

const flattenObjectOfArrays = (tables, includeGroupMarker = false) => {
  const rows = [];
  try {
    Object.entries(tables).forEach(([groupKey, arr]) => {
      if (Array.isArray(arr)) {
        arr.forEach(row => {
          if (isPlainObject(row)) {
            rows.push(includeGroupMarker ? { ...row, __group: groupKey } : { ...row });
          }
        });
      }
    });
  } catch (e) {
    safeConsole.error('flattenObjectOfArrays error:', e);
  }
  return rows;
};

const collectRecords = (data) => {
  if (Array.isArray(data)) {
    return data.filter(isPlainObject);
  }
  if (isPlainObject(data)) {
    if (Object.values(data).some(v => Array.isArray(v))) {
      // Default: do NOT add __group marker when collecting records for merge
      return flattenObjectOfArrays(data, false);
    }
    return Object.values(data).filter(isPlainObject);
  }
  return [];
};

const detectMergeFields = (records) => {
  const sample = Array.isArray(records) ? records.slice(0, 500) : [];
  const keyFrequency = new Map();
  const allKeys = new Set();
  sample.forEach(row => {
    Object.keys(row || {}).forEach(k => {
      allKeys.add(k);
      keyFrequency.set(k, (keyFrequency.get(k) || 0) + (isNonEmptyValue(row[k]) ? 1 : 0));
    });
  });
  const keys = Array.from(allKeys);
  // Heuristic score: prefer id/code/key/date and higher presence
  const scoreKey = (k) => {
    const kl = k.toLowerCase();
    let score = keyFrequency.get(k) || 0;
    if (kl === 'id' || kl.endsWith('id')) score += 1000;
    if (kl.includes('code')) score += 800;
    if (kl.includes('key')) score += 700;
    if (kl.includes('uuid')) score += 900;
    if (kl.includes('date')) score += 300;
    return score;
  };
  const sorted = keys.sort((a, b) => scoreKey(b) - scoreKey(a));

  const uniqueness = (fields) => {
    const seen = new Set();
    let total = 0;
    for (const row of sample) {
      if (!isPlainObject(row)) continue;
      const key = fields.map(f => normalizeForKey(row?.[f])).join('||');
      if (key) {
        seen.add(key);
        total += 1;
      }
    }
    if (total === 0) return 0;
    return seen.size / total;
  };

  // Try single-field keys first
  for (const k of sorted.slice(0, 10)) {
    if (uniqueness([k]) >= 0.5) {
      return {
        mergeBy: [k],
        preserve: sorted.filter(name => name !== k && /name|team|hq|location|title|label/i.test(name)).slice(0, 6)
      };
    }
  }
  // Try pair combinations from top candidates
  for (let i = 0; i < Math.min(6, sorted.length); i++) {
    for (let j = i + 1; j < Math.min(8, sorted.length); j++) {
      const fields = [sorted[i], sorted[j]];
      if (uniqueness(fields) >= 0.75) {
        return {
          mergeBy: fields,
          preserve: sorted.filter(name => !fields.includes(name) && /name|team|hq|location|title|label/i.test(name)).slice(0, 6)
        };
      }
    }
  }
  // Fallback: any key that exists broadly
  if (sorted.length > 0) {
    return {
      mergeBy: [sorted[0]],
      preserve: sorted.filter(name => name !== sorted[0] && /name|team|hq|location|title|label/i.test(name)).slice(0, 6)
    };
  }
  return { mergeBy: [], preserve: [] };
};

const mergeRecordsByKeys = (records, mergeBy, preserve) => {
  if (!Array.isArray(records) || records.length === 0) return [];
  if (!Array.isArray(mergeBy) || mergeBy.length === 0) return records.filter(isPlainObject);
  const map = new Map();
  const preserveSet = new Set(preserve || []);
  // Cache non-empty preserve values by synthetic id if available
  const preserveCache = new Map();
  for (const row of records) {
    if (!isPlainObject(row)) continue;
    const key = computeCompositeKey(row, mergeBy);
    const idKey = mergeBy.find(k => preserveSet.has(k));
    const idVal = idKey ? normalizeForKey(row[idKey]) : key;
    if (!preserveCache.has(idVal)) preserveCache.set(idVal, {});
    const cacheObj = preserveCache.get(idVal);
    for (const f of preserveSet) {
      const v = row[f];
      if (isNonEmptyValue(v) && !isNonEmptyValue(cacheObj[f])) {
        cacheObj[f] = v;
      }
    }
  }
  for (const row of records) {
    if (!isPlainObject(row)) continue;
    const key = computeCompositeKey(row, mergeBy);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...row });
    } else {
      map.set(key, deepMergeObjects(existing, row));
    }
  }
  // Apply preserve backfill
  for (const [key, obj] of map.entries()) {
    const idKey = mergeBy.find(k => preserveSet.has(k));
    const idVal = idKey ? normalizeForKey(obj[idKey]) : key;
    const cacheObj = preserveCache.get(idVal) || {};
    for (const f of preserveSet) {
      obj[f] = choosePreferNonEmpty(obj[f], cacheObj[f]);
    }
  }
  return Array.from(map.values());
};

// Soft merge: supports merging with partial keys. Rows missing secondary keys
// (e.g., team rows without date) will be merged into all rows that share the
// primary key within their bucket.
const softMergeRecordsByKeys = (records, mergeBy, preserve) => {
  if (!Array.isArray(records) || records.length === 0) return [];
  if (!Array.isArray(mergeBy) || mergeBy.length === 0) return records.filter(isPlainObject);
  if (mergeBy.length === 1) return mergeRecordsByKeys(records, mergeBy, preserve);

  // Choose primary key as the one present in most records
  const presenceCounts = mergeBy.map(k => (
    records.reduce((acc, r) => acc + (isPlainObject(r) && isNonEmptyValue(r[k]) ? 1 : 0), 0)
  ));
  let primaryIdx = 0;
  for (let i = 1; i < presenceCounts.length; i++) {
    if (presenceCounts[i] > presenceCounts[primaryIdx]) primaryIdx = i;
  }
  const primaryKey = mergeBy[primaryIdx];
  const secondaryKeys = mergeBy.filter(k => k !== primaryKey);

  // Build buckets by primary key
  const buckets = new Map(); // normPrimary -> { narrow: Map(secKeyStr -> obj), broad: [rows] }
  const preserveSet = new Set(preserve || []);

  // Cache preserve values by primary id
  const preserveCache = new Map();

  for (const row of records) {
    if (!isPlainObject(row)) continue;
    const pkVal = row[primaryKey];
    if (!isNonEmptyValue(pkVal)) continue;
    const pk = normalizeForKey(pkVal);
    if (!buckets.has(pk)) buckets.set(pk, { narrow: new Map(), broad: [] });
    const bucket = buckets.get(pk);

    // Preserve cache seed
    if (!preserveCache.has(pk)) preserveCache.set(pk, {});
    const cacheObj = preserveCache.get(pk);
    for (const f of preserveSet) {
      const v = row[f];
      if (isNonEmptyValue(v) && !isNonEmptyValue(cacheObj[f])) cacheObj[f] = v;
    }

    const hasAllSecondary = secondaryKeys.every(k => isNonEmptyValue(row[k]));
    if (hasAllSecondary) {
      const secKey = secondaryKeys.map(k => normalizeForKey(row[k])).join('||');
      const existing = bucket.narrow.get(secKey);
      bucket.narrow.set(secKey, existing ? deepMergeObjects(existing, row) : { ...row });
    } else {
      bucket.broad.push(row);
    }
  }

  // Build final rows: merge broad rows into every narrow row within the same bucket
  const results = [];
  for (const [pk, { narrow, broad }] of buckets.entries()) {
    if (narrow.size === 0 && broad.length > 0) {
      // No narrow rows; collapse broad rows by deep merge
      const mergedBroad = broad.reduce((acc, r) => deepMergeObjects(acc, r), {});
      // Apply preserve backfill
      const cacheObj = preserveCache.get(pk) || {};
      for (const f of preserveSet) {
        mergedBroad[f] = choosePreferNonEmpty(mergedBroad[f], cacheObj[f]);
      }
      results.push(mergedBroad);
      continue;
    }

    for (const [secKey, baseObj] of narrow.entries()) {
      let merged = { ...baseObj };
      for (const broadRow of broad) {
        merged = deepMergeObjects(merged, broadRow);
      }
      // Apply preserve backfill
      const cacheObj = preserveCache.get(pk) || {};
      for (const f of preserveSet) {
        merged[f] = choosePreferNonEmpty(merged[f], cacheObj[f]);
      }
      results.push(merged);
    }
  }

  return results;
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
  enableMerge,
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
  
  // Advanced merge pipeline (applies to arrays and object-of-arrays)
  if (enableMerge) {
    try {
      const records = collectRecords(data);
      if (records.length > 0) {
        const { mergeBy, preserve } = detectMergeFields(records);
        safeConsole.log('Advanced merge config:', { mergeBy, preserve });
        if (Array.isArray(mergeBy) && mergeBy.length > 0) {
          data = mergeRecordsByKeys(records, mergeBy, preserve);
        } else {
          // No reliable key found; keep flattened records for safety
          data = records;
        }
      } else {
        data = [];
      }
    } catch (mergeError) {
      console.error('processData: Advanced merge failed, falling back to safe array conversion:', mergeError);
      // Safe fallback: convert to array of objects if possible
      if (Array.isArray(data)) {
        data = data.filter(isPlainObject);
      } else if (isPlainObject(data)) {
        data = Object.values(data).filter(isPlainObject);
      } else {
        data = [];
      }
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

// Public helper: perform advanced merge on any input shape and return array of plain objects
export const advancedMerge = (input) => {
  try {
    const records = collectRecords(input);
    if (records.length === 0) return [];
    const { mergeBy, preserve } = detectMergeFields(records);
    if (Array.isArray(mergeBy) && mergeBy.length > 0) {
      // Use soft merge so rows missing secondary keys (e.g., team without date)
      // enrich matching primary-key rows instead of being dropped
      return softMergeRecordsByKeys(records, mergeBy, preserve);
    }
    return records;
  } catch (err) {
    console.error('advancedMerge: failed, using safe fallback', err);
    if (Array.isArray(input)) return input.filter(isPlainObject);
    if (isPlainObject(input)) return Object.values(input).filter(isPlainObject);
    return [];
  }
};