import '../styles/globals.css';
import '../styles/PrintA3.css';
import { AuthProvider } from '../components/AuthContext';
// Lazy-load Plasmic init so it doesn't block app bootstrap
import dynamic from 'next/dynamic';
const PlasmicInit = dynamic(() => import('../plasmic-init'), { ssr: false });
import { DataProvider } from '@plasmicapp/host';
import { useEffect, useState, useCallback } from 'react';
import LZString from 'lz-string';
import localforage from 'localforage';

// ⚡ PERFORMANCE: CSS imports are optimized by Next.js via optimizeCs config
// Next.js will automatically:
// - Code-split CSS by route/page
// - Minify and optimize CSS
// - Remove unused CSS
// - Load CSS asynchronously where possible

// PrimeReact CSS - loaded via Next.js optimization
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primeicons/primeicons.css';

// Ant Design CSS - loaded via Next.js optimization
import 'antd/dist/reset.css';

import { advancedMerge } from '../components/utils/dataUtils';

// ✅ Advanced universal deep flattener with renaming and dynamic prefix mapping
const flatten = (renameMapOrData, maybeData, options = {}) => {
  // 🔧 Helper to flatten any nested object or array into underscore-joined keys
  const flat = (obj, prefix = '', res = {}) => {
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => flat(item, `${prefix}${prefix ? '_' : ''}${i}`, res));
    } else if (typeof obj === 'object' && obj !== null) {
      Object.entries(obj).forEach(([key, val]) => flat(val, `${prefix}${prefix ? '_' : ''}${key}`, res));
    } else {
      res[prefix] = obj;
    }
    return res;
  };

  // ✅ Internal utility to generate prefixMap dynamically
  const generatePrefixMap = (prefix = 'node_items_', replacement = null, count = 25) => {
    const map = {};
    for (let i = 0; i < count; i++) {
      map[`${prefix}${i}_`] = replacement;
    }
    return map;
  };

  // 📦 Allow usage: flatten(renameMap, data, { prefixMap }) OR flatten(data)
  let renameMap = {};
  let input = renameMapOrData;

  if (maybeData !== undefined) {
    renameMap = renameMapOrData || {};
    input = maybeData;
  }

  // Allow passing dynamic prefixMap generator inline
  const prefixMap =
    typeof options.prefixMap === 'function' ? options.prefixMap(generatePrefixMap) : options.prefixMap || {};

  // ✅ If input is an array, return flattened and renamed rows
  if (Array.isArray(input)) {
    return input.map((entry) => {
      const flatRow = flat(entry);
      const renamed = {};

      Object.entries(flatRow).forEach(([k, v]) => {
        let newKey = renameMap[k];

        if (!newKey) {
          const matchedPrefix = Object.entries(prefixMap).find(([prefix]) => k.startsWith(prefix));

          if (matchedPrefix) {
            const [prefix, replacement] = matchedPrefix;
            newKey = replacement === null ? k.replace(prefix, '') : k.replace(prefix, replacement);
          } else {
            newKey = k;
          }
        }

        renamed[newKey] = v;
      });

      return renamed;
    });
  }

  // ✅ If input is an object with arrays inside (e.g., { service: [], team: [] })
  if (typeof input === 'object' && input !== null) {
    const result = {};
    Object.entries(input).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        result[key] = value.map((entry) => {
          const flatRow = flat(entry);
          const renamed = {};

          Object.entries(flatRow).forEach(([k, v]) => {
            let newKey = renameMap[k];

            if (!newKey) {
              const matchedPrefix = Object.entries(prefixMap).find(([prefix]) => k.startsWith(prefix));

              if (matchedPrefix) {
                const [prefix, replacement] = matchedPrefix;
                newKey = replacement === null ? k.replace(prefix, '') : k.replace(prefix, replacement);
              } else {
                newKey = k;
              }
            }

            renamed[newKey] = v;
          });

          return renamed;
        });
      } else {
        result[key] = value;
      }
    });
    return result;
  }

  return input;
};

// ✅ All utility functions under "fn"
const a = {
  summarize: (groupBy = [], timeKeys = [], sumKeys = []) => (data = []) => {
    const result = [];
    const getGroupKey = row => groupBy.map(k => row?.[k] ?? "").join("||");
    const getTimeKey = row => timeKeys.map(k => row?.[k] ?? "").join("||");
    const map = new Map();
    data.forEach(row => {
      const gKey = getGroupKey(row);
      const tKey = getTimeKey(row);
      if (!map.has(gKey)) {
        map.set(gKey, {
          ...groupBy.reduce((a, k) => ({
            ...a,
            [k]: row[k]
          }), {})
        })
      }
      const entry = map.get(gKey);
      sumKeys.forEach(k => {
        entry[k + "_Total"] = (entry[k + "_Total"] || 0) + (row[k] || 0);
        if (tKey) {
          const colKey = `${tKey}__${k}`;
          entry[colKey] = (entry[colKey] || 0) + (row[k] || 0)
        }
      });
      map.set(gKey, entry)
    });
    return Array.from(map.values())
  },

  aggregate: (by, mode = "sum") => data => {
    if (!Array.isArray(data))
      return [];
    const num = v => +String(v || "").replace(/,/g, "") || 0;
    const numericKeys = Object.keys(data[0] || {}).filter(k => !by.includes(k) && data.some(r => !Number.isNaN(num(r[k]))));
    const grouped = data.reduce((acc, row) => {
      const key = by.map(k => row[k]).join("__");
      if (!acc[key]) {
        acc[key] = Object.fromEntries(by.map(k => [k, row[k]]));
        if (mode === "count") {
          acc[key]._count = 0
        } else {
          numericKeys.forEach(f => acc[key][f] = 0)
        }
      }
      if (mode === "count") {
        acc[key]._count += 1
      } else {
        numericKeys.forEach(f => {
          acc[key][f] += num(row[f])
        })
      }
      return acc
    }, {});
    return Object.values(grouped)
  },

  pivote: (by, keys, values, mode = "sum", ignoreZeros = true) => data => {
    if (!Array.isArray(data))
      return [];
    const singleValue = values.length === 1;
    const num = v => +String(v || "").replace(/,/g, "") || 0;
    const rowKey = r => by.map(k => r[k]).join("__");
    const colKey = r => keys.map(k => r[k]).join("-");
    const rows = {}, colTotals = {};
    data.forEach(r => {
      const rk = rowKey(r), ck = colKey(r);
      rows[rk] ??= {
        ...Object.fromEntries(by.map(k => [k, r[k]])),
        __cols: {},
        __totals: Object.fromEntries(values.map(v => [`${v} Total`, 0]))
      };
      values.forEach(v => {
        const val = mode === "count" ? 1 : num(r[v]);
        const key = singleValue ? ck : `${ck}__${v}`;
        rows[rk].__cols[key] = (rows[rk].__cols[key] || 0) + val;
        rows[rk].__totals[`${v} Total`] += val;
        colTotals[key] = (colTotals[key] || 0) + val
      })
    });
    const allCols = Object.keys(colTotals);
    const activeCols = ignoreZeros ? allCols.filter(c => colTotals[c] > 0) : allCols;
    return Object.values(rows).map(r => ({
      ...Object.fromEntries(by.map(k => [k, r[k]])),
      ...Object.fromEntries(activeCols.filter(k => k in r.__cols).map(k => [k, r.__cols[k]])),
      ...r.__totals
    })).sort((a, b) => String(a[by[0]]).localeCompare(String(b[by[0]])))
  },

  // Advanced merge usable directly from Plasmic via fn.merge(data)
  merge: (input) => advancedMerge(input),

  explodeWithParent: (data = [], options = {}) => {
    const {
      itemPath = "node.items",         // dot path to array of children
      parentPrefix = "",               // optional prefix for parent fields
      childPrefix = "",                // optional prefix for child fields
      includeParentPaths = []          // optional: only include selected parent paths
    } = options;
  
    // 🔍 Safely resolve dot path
    const get = (obj, path) =>
      path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
  
    // 🔃 Flatten nested object into flat { a_b_c: value }, skipping arrays at any depth
    const flatten = (obj, prefix = '', res = {}) => {
      if (!obj || typeof obj !== 'object') return res;
      for (const [k, v] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}_${k}` : k;
        if (Array.isArray(v)) {
          // skip arrays entirely (e.g., parent.items)
          continue;
        }
        if (v && typeof v === 'object') {
          flatten(v, newKey, res);
        } else {
          res[newKey] = v;
        }
      }
      return res;
    };
  
    return data.flatMap(entry => {
      const parentPath = itemPath.split('.').slice(0, -1).join('.');
      const parentObject = parentPath ? get(entry, parentPath) : entry;   // 👈 use whole entry when no parentPath
      const parentFlatFull = flatten(parentObject, parentPrefix);
  
      // If includeParentPaths is defined, filter only selected keys
      const parentFlat = includeParentPaths.length > 0
        ? Object.fromEntries(
            Object.entries(parentFlatFull).filter(([k]) =>
              includeParentPaths.includes(k)
            )
          )
        : parentFlatFull;
  
      const items = get(entry, itemPath) || [];
  
      return items.map(child => {
        const childFlat = flatten(child, childPrefix);
        return {
          ...parentFlat,
          ...childFlat
        };
      });
    });
  }
  ,

  // URL encoding/decoding helpers (names as requested)
  enocdeui: (value) => {
    const text = value == null ? '' : String(value);
    try { return encodeURI(text); } catch (e) { return text; }
  },
  encodeuicompeont: (value) => {
    const text = value == null ? '' : String(value);
    try { return encodeURIComponent(text); } catch (e) { return text; }
  },
  decodeui: (value) => {
    const text = value == null ? '' : String(value);
    try { return decodeURI(text); } catch (e) { return text; }
  },
  decodeuicompoent: (value) => {
    const text = value == null ? '' : String(value);
    try { return decodeURIComponent(text); } catch (e) { return text; }
  },

  // ✅ NEW flatten function for dynamic JSON
  flatten,

  // ✅ LZ-String compression functions for Plasmic Studio
  // Compress JSON/array data to a compressed string
  compress: (data) => {
    try {
      const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
      return LZString.compress(jsonString);
    } catch (e) {
      console.error('Compression error:', e);
      return null;
    }
  },

  // Decompress back to original data
  decompress: (compressed) => {
    try {
      const decompressed = LZString.decompress(compressed);
      if (!decompressed) return null;
      try {
        return JSON.parse(decompressed);
      } catch {
        return decompressed; // Return as string if not JSON
      }
    } catch (e) {
      console.error('Decompression error:', e);
      return null;
    }
  },

  // Compress to Base64 (URL-safe and readable)
  compressToBase64: (data) => {
    try {
      const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
      return LZString.compressToBase64(jsonString);
    } catch (e) {
      console.error('Base64 compression error:', e);
      return null;
    }
  },

  // Decompress from Base64
  decompressFromBase64: (compressed) => {
    try {
      const decompressed = LZString.decompressFromBase64(compressed);
      if (!decompressed) return null;
      try {
        return JSON.parse(decompressed);
      } catch {
        return decompressed; // Return as string if not JSON
      }
    } catch (e) {
      console.error('Base64 decompression error:', e);
      return null;
    }
  },

  // Compress to UTF16 (efficient for storage)
  compressToUTF16: (data) => {
    try {
      const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
      return LZString.compressToUTF16(jsonString);
    } catch (e) {
      console.error('UTF16 compression error:', e);
      return null;
    }
  },

  // Decompress from UTF16
  decompressFromUTF16: (compressed) => {
    try {
      const decompressed = LZString.decompressFromUTF16(compressed);
      if (!decompressed) return null;
      try {
        return JSON.parse(decompressed);
      } catch {
        return decompressed; // Return as string if not JSON
      }
    } catch (e) {
      console.error('UTF16 decompression error:', e);
      return null;
    }
  },

  // Compress to EncodedURIComponent (safe for URLs)
  compressToEncodedURIComponent: (data) => {
    try {
      const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
      return LZString.compressToEncodedURIComponent(jsonString);
    } catch (e) {
      console.error('URI compression error:', e);
      return null;
    }
  },

  // Decompress from EncodedURIComponent
  decompressFromEncodedURIComponent: (compressed) => {
    try {
      const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
      if (!decompressed) return null;
      try {
        return JSON.parse(decompressed);
      } catch {
        return decompressed; // Return as string if not JSON
      }
    } catch (e) {
      console.error('URI decompression error:', e);
      return null;
    }
  },

  // ✅ Direct access to localforage library
  // Use all localforage methods directly in Plasmic Studio
  localforage: localforage,

  // ✅ Division function: divides value by divisor, multiplies by 100, formats to decimal places
  // Usage: $ctx.fn.percentage(value, divisor, decimalPlaces)
  // Example: $ctx.fn.percentage($props.incentive, $props.target, 1)
  percentage: (value, divisor, decimalPlaces = 1) => {
    if (value && divisor) {
      const result = (value / divisor) * 100;
      // Round to specified decimal places and return as number
      const multiplier = Math.pow(10, decimalPlaces);
      return Math.round(result * multiplier) / multiplier;
    }
    return 0;
  },

  // ✅ Normal division function: divides value by divisor, formats to decimal places (no 100 multiplication)
  // Usage: $ctx.fn.divide(value, divisor, decimalPlaces)
  // Example: $ctx.fn.divide(10, 3, 2) returns 3.33
  divide: (value, divisor, decimalPlaces = 1) => {
    if (value && divisor) {
      const result = value / divisor;
      // Round to specified decimal places and return as number
      const multiplier = Math.pow(10, decimalPlaces);
      return Math.round(result * multiplier) / multiplier;
    }
    return 0;
  }
};

// Global error handler to catch unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Check if it's a TypeError related to authentication
    if (event.reason instanceof TypeError) {
      console.warn('TypeError detected in promise rejection. This might be an authentication race condition.');
      
      // Prevent the error from being logged to console
      event.preventDefault();
      
      // Optionally, you could show a user-friendly message here
      // or trigger a retry mechanism
    }
  });
  
  // Also catch regular errors
  window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    
    // Check if it's a TypeError
    if (event.error instanceof TypeError) {
      console.warn('TypeError detected in global error handler.');
      // You could add specific handling here if needed
    }
  });

  // Service worker registration is now handled by OneSignal
  // OneSignal SDK will automatically register OneSignalSDKWorker.js
  // which includes push notification support
  
  // If you need offline caching alongside OneSignal, you'll need to merge
  // the sw.js functionality into OneSignalSDKWorker.js
  
  /* Commented out - replaced by OneSignal's service worker
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const registerServiceWorker = () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.warn('Service Worker registration failed:', error);
        });
    };
    if (document.readyState === 'complete') {
      registerServiceWorker();
    } else {
      window.addEventListener('load', registerServiceWorker, { once: true });
    }
  }
  */
}

function MyApp({ Component, pageProps }) {
  // Global state that can be accessed and updated from Plasmic Studio
  const [globalState, setGlobalState] = useState({});

  // setState function that can be used in Plasmic Studio as $ctx.fn.setState(stateName, data, callback)
  // This updates the global state which can then be bound to component states in Plasmic Studio
  // 
  // Usage examples:
  //   $ctx.fn.setState('items', data) - sets $ctx.state.items = data
  //   $ctx.fn.setState('items', items, (newValue) => console.log('set state', newValue.length)) - with callback
  //   $ctx.fn.setState('items', items, (newValue, stateName, fullState) => console.log(stateName, newValue.length))
  //   $ctx.fn.setState('userName', 'John') - sets $ctx.state.userName = 'John'
  //   $ctx.fn.setState({ items: data, loading: false }) - merges multiple state properties
  //
  // Parameters:
  //   stateName: string (state property name) or object (multiple properties to merge)
  //   data: the value to set (required if stateName is string)
  //   callback: optional function called after state update
  //     - For single property: callback(newValue, stateName, fullState)
  //     - For object merge: callback(fullState)
  //
  // To use with Plasmic component states:
  //   1. Call $ctx.fn.setState('items', data) to store in global state
  //   2. In Plasmic Studio, bind your component's "items" state variable to $ctx.state.items
  //   3. The component state will automatically update when you call setState
  const setState = useCallback((stateName, data, callback) => {
    if (typeof stateName === 'string') {
      // If stateName is a string, treat it as the state property name (key) and update that specific property
      // Example: setState('items', [1,2,3]) creates/updates $ctx.state.items = [1,2,3]
      // Then bind your Plasmic component's "items" state to $ctx.state.items
      setGlobalState(prev => {
        const newState = {
          ...prev,
          [stateName]: data
        };
        // Call callback after state update if provided
        // Note: If callback is not a function (e.g., console.log(...) which executes immediately),
        // it will be ignored. Wrap in arrow function: (newValue) => console.log("set state", newValue.length)
        if (typeof callback === 'function') {
          // Use setTimeout to ensure state is updated and component re-renders before callback
          // This allows $ctx.state.items to be updated when callback accesses it
          setTimeout(() => {
            try {
              // Callback receives: (newValue, stateName, fullState)
              callback(newState[stateName], stateName, newState);
            } catch (error) {
              console.error('Error in setState callback:', error);
            }
          }, 0);
        } else if (callback !== undefined && callback !== null) {
          // If callback is provided but not a function, log a warning
          console.warn('setState callback must be a function. Received:', typeof callback);
        }
        return newState;
      });
    } else if (typeof stateName === 'object' && stateName !== null) {
      // If stateName is an object, merge it with existing state
      // Example: setState({ items: data, loading: false }) merges both properties into state
      // In this case, data parameter is treated as callback if it's a function
      const actualCallback = typeof data === 'function' ? data : callback;
      setGlobalState(prev => {
        const newState = {
          ...prev,
          ...stateName
        };
        // Call callback after state update if provided
        if (typeof actualCallback === 'function') {
          // Use setTimeout to ensure state is updated before callback
          setTimeout(() => {
            try {
              actualCallback(newState);
            } catch (error) {
              console.error('Error in setState callback:', error);
            }
          }, 0);
        }
        return newState;
      });
    }
  }, []);

  // Combine all utility functions with setState
  const fnWithState = {
    ...a,
    setState
  };

  useEffect(() => {
    const loadingScreen = document.getElementById('app-loading-screen');
    const loadingGif = document.querySelector('.loading-gif');
    
    if (loadingScreen && loadingGif) {
      let animationCompleted = false;
      let appReady = false;
      
      // Minimum display time (3 seconds) - adjust based on your GIF duration
      const MIN_DISPLAY_TIME = 3000;
      const startTime = Date.now();
      
      // Mark app as ready after a short delay
      setTimeout(() => {
        appReady = true;
        checkAndHideLoader();
      }, 500);
      
      // Wait for minimum display time (to ensure GIF plays)
      setTimeout(() => {
        animationCompleted = true;
        checkAndHideLoader();
      }, MIN_DISPLAY_TIME);
      
      // Function to hide loader only when both conditions are met
      function checkAndHideLoader() {
        if (animationCompleted && appReady) {
          loadingScreen.classList.add('fade-out');
          setTimeout(() => {
            loadingScreen.remove();
          }, 500);
        }
      }
    }
  }, []);

  return (
    <DataProvider name="fn" data={fnWithState}>
      <DataProvider name="state" data={globalState}>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </DataProvider>
    </DataProvider>
  );
}


export default MyApp; 