# Hydration Error Fix Guide

## Overview
This guide addresses the "Cannot read properties of undefined (reading 'node')" error that was occurring in the Plasmic application. This error is typically a React hydration issue where components try to access DOM elements before they're fully hydrated.

## Root Cause Analysis

### The Error
```
TypeError: Cannot read properties of undefined (reading 'node')
```

### Why It Happens
1. **Hydration Mismatch**: Server-side rendering (SSR) and client-side rendering produce different results
2. **DOM Access Before Ready**: Components try to access DOM elements before the page is fully hydrated
3. **Race Conditions**: Authentication state changes during component rendering
4. **Plasmic Component Issues**: Plasmic components may have internal DOM dependencies

## Solutions Implemented

### 1. Enhanced Error Boundary (`PlasmicErrorBoundary.js`)
- **Specific Error Detection**: Identifies node property access errors
- **Auto-Retry Logic**: Automatically retries failed renders up to 5 times
- **Progressive Retry Delays**: Faster retries for DOM issues, slower for auth issues
- **Force Refresh Option**: Last resort option after max retries
- **Better Error Reporting**: Shows retry count and error details

### 2. Improved Catchall Route (`[[...catchall]].jsx`)
- **Render Key System**: Forces component remount on errors using `renderKey`
- **Hydration Safety**: Ensures all hooks are called in consistent order
- **Stability Checks**: Waits for auth to be fully loaded before rendering
- **Retry Integration**: Connects error boundary retries to component remounting

### 3. Enhanced Data Context (`PlasmicDataContext.js`)
- **DOM Readiness Checks**: Uses utility functions to ensure DOM is ready
- **Async DOM Waiting**: Waits for DOM to be fully available before operations
- **Hydration Tracking**: Prevents operations during hydration phase

### 4. DOM Utility Functions (`utils/domUtils.js`)
- **Safe DOM Access**: Helper functions for safe DOM property access
- **DOM Readiness Detection**: Functions to check if DOM is fully ready
- **Error Wrapping**: Safe wrappers for DOM operations with fallbacks

## Key Patterns to Follow

### 1. Hydration Safety
```javascript
// ✅ Good: Track hydration completion
const isHydratedRef = useRef(false);
useEffect(() => {
  isHydratedRef.current = true;
}, []);

// ✅ Good: Check hydration before DOM operations
if (!isHydratedRef.current) return;
```

### 2. Consistent Hook Order
```javascript
// ✅ Good: All hooks called in same order every time
const [state1, setState1] = useState(null);
const [state2, setState2] = useState(null);
const memoizedValue = useMemo(() => {}, []);
const effect = useEffect(() => {}, []);

// ❌ Bad: Conditional hook calls
if (condition) {
  const [state, setState] = useState(null); // This breaks hook order
}
```

### 3. DOM Readiness Checks
```javascript
// ✅ Good: Use utility functions
import { isDOMReady, waitForDOMReady } from '../utils/domUtils';

if (!isDOMReady()) {
  const domReady = await waitForDOMReady(3000);
  if (!domReady) return;
}

// ❌ Bad: Direct DOM access without checks
window.document.body // May fail during hydration
```

### 4. Error Recovery
```javascript
// ✅ Good: Implement retry logic
const handleRetry = useCallback(() => {
  setRenderKey(prev => prev + 1); // Force remount
}, []);

// ✅ Good: Use error boundary with retry support
<PlasmicErrorBoundary onRetry={handleRetry}>
  <Component />
</PlasmicErrorBoundary>
```

## Prevention Strategies

### 1. Component Design
- **Avoid Direct DOM Access**: Use React refs and state instead
- **Lazy Loading**: Load heavy components after hydration
- **Conditional Rendering**: Only render components when data is ready

### 2. State Management
- **Stable References**: Use `useRef` for values that shouldn't trigger re-renders
- **Proper Dependencies**: Ensure useEffect dependencies are correct
- **Race Condition Prevention**: Use flags to prevent multiple operations

### 3. Error Handling
- **Graceful Degradation**: Show fallback UI when components fail
- **User Feedback**: Inform users when retries are happening
- **Logging**: Log errors for debugging and monitoring

## Testing the Fix

### 1. Development Testing
```bash
# Run in development mode
npm run dev

# Check console for hydration warnings
# Verify error boundary catches errors
# Test retry functionality
```

### 2. Production Testing
```bash
# Build and test production build
npm run build
npm start

# Test error scenarios
# Verify retry mechanisms work
```

### 3. Error Simulation
- **Network Issues**: Disconnect internet during auth
- **Slow Loading**: Throttle network in DevTools
- **Component Failures**: Temporarily break components

## Monitoring and Maintenance

### 1. Error Tracking
- **Console Logging**: Monitor for new hydration errors
- **User Reports**: Track user-reported issues
- **Performance Metrics**: Monitor component load times

### 2. Regular Reviews
- **Code Reviews**: Check for hydration anti-patterns
- **Dependency Updates**: Keep React and Plasmic updated
- **Performance Audits**: Regular performance reviews

### 3. Documentation Updates
- **Component Guidelines**: Document hydration-safe patterns
- **Error Handling**: Keep error handling procedures updated
- **Team Training**: Educate team on hydration best practices

## Common Pitfalls to Avoid

### 1. ❌ Don't Access DOM During Render
```javascript
// ❌ Bad: DOM access during render
function Component() {
  const element = document.getElementById('my-element'); // This will fail
  return <div>{element?.textContent}</div>;
}
```

### 2. ❌ Don't Call setState During Render
```javascript
// ❌ Bad: State updates during render
function Component() {
  const [state, setState] = useState(null);
  if (condition) {
    setState(value); // This will fail
  }
  return <div>{state}</div>;
}
```

### 3. ❌ Don't Assume DOM is Ready
```javascript
// ❌ Bad: Assume DOM is available
useEffect(() => {
  document.body.classList.add('ready'); // May fail during hydration
}, []);
```

## Conclusion

The implemented fixes provide a robust solution to hydration errors by:

1. **Detecting Errors Early**: Enhanced error boundary catches specific error types
2. **Automatic Recovery**: Auto-retry logic handles transient issues
3. **Safe DOM Access**: Utility functions prevent DOM access errors
4. **User Experience**: Clear error messages and retry options

These patterns should be followed for all new components to prevent similar issues in the future.

## Resources

- [React Hydration Documentation](https://react.dev/reference/react-dom/hydrate)
- [Plasmic Best Practices](https://docs.plasmic.app/learn/quickstart)
- [Next.js SSR Guidelines](https://nextjs.org/docs/advanced-features/server-side-rendering)
