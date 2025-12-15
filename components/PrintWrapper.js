import React, { useEffect } from 'react';

// Utility function to detect browser and apply appropriate print settings
const getBrowserPrintSettings = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('chrome')) {
    return {
      method: 'chrome',
      pageSize: 'A3',
      margins: '0.3in'
    };
  } else if (userAgent.includes('firefox')) {
    return {
      method: 'firefox',
      pageSize: 'A3',
      margins: '0.3in'
    };
  } else if (userAgent.includes('safari')) {
    return {
      method: 'safari',
      pageSize: 'A3',
      margins: '0.3in'
    };
  } else if (userAgent.includes('edge')) {
    return {
      method: 'edge',
      pageSize: 'A3',
      margins: '0.3in'
    };
  }
  
  return {
    method: 'default',
    pageSize: 'A3',
    margins: '0.3in'
  };
};

/**
 * PrintWrapper - A wrapper component that triggers A3 printing when any child element is clicked
 * 
 * This component wraps any content (icons, images, text) and makes the entire area clickable
 * to trigger printing with A3 page size. Perfect for icons, images, or custom print buttons.
 * 
 * Features:
 * - Wrap any content (icons, images, text, custom designs)
 * - Entire wrapper area is clickable
 * - Automatic A3 page size preset when print dialog opens
 * - Works in iframe contexts (Plasmic preview) and main window
 * - Zero configuration required
 * 
 * Usage in Plasmic:
 * 1. Drag PrintWrapper component onto canvas
 * 2. Add any content inside (icons, images, text)
 * 3. Click anywhere on the wrapper = Print dialog opens with A3 size
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to be wrapped
 * @param {string} props.className - Additional CSS classes for wrapper
 * @param {Object} props.style - Inline styles for wrapper
 * @param {string} props.cursor - Cursor style (default: 'pointer')
 * @param {function} props.onPrint - Callback fired when print is initiated
 * @param {string} props.parentWindowOrigin - Origin for postMessage (for security)
 * @param {boolean} props.disabled - Disable the print wrapper
 * @param {string} props.tooltip - Tooltip text to show on hover
 */
const PrintWrapper = ({
  children,
  className = '',
  style = {},
  cursor = 'pointer',
  onPrint,
  parentWindowOrigin = '*',
  disabled = false,
  tooltip,
  ...otherProps
}) => {
  
  // Function to immediately trigger print with A3 page size - NO SETUP REQUIRED
  const triggerAutoPrint = () => {
    if (disabled) return;

    const browserSettings = getBrowserPrintSettings();
    
    // Apply A3 page size styles with multiple approaches for better browser compatibility
    let printStyle = document.getElementById('print-wrapper-a3-styles');
    if (!printStyle) {
      printStyle = document.createElement('style');
      printStyle.id = 'print-wrapper-a3-styles';
      printStyle.textContent = `
        @media print {
          @page {
            size: A3 !important;
            margin: ${browserSettings.margins} !important;
          }
          @page :first {
            size: A3 !important;
            margin: ${browserSettings.margins} !important;
          }
          @page :left {
            size: A3 !important;
            margin: ${browserSettings.margins} !important;
          }
          @page :right {
            size: A3 !important;
            margin: ${browserSettings.margins} !important;
          }
          body {
            color: black !important;
            background: white !important;
            width: 210mm !important;
            min-height: 297mm !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `;
      document.head.appendChild(printStyle);
    }

    // Browser-specific print handling
    try {
      if (browserSettings.method === 'chrome') {
        // Chrome-specific approach
        document.documentElement.style.setProperty('--print-page-size', 'A3');
        
        // Create a temporary print container with A3 dimensions
        const printContainer = document.createElement('div');
        printContainer.style.cssText = `
          position: absolute;
          left: -9999px;
          top: -9999px;
          width: 210mm;
          height: 297mm;
          background: white;
        `;
        printContainer.innerHTML = document.body.innerHTML;
        document.body.appendChild(printContainer);
        
        setTimeout(() => {
          window.print();
          setTimeout(() => {
            if (printContainer && printContainer.parentNode) {
              printContainer.parentNode.removeChild(printContainer);
            }
          }, 1000);
        }, 150);
        
      } else if (browserSettings.method === 'firefox') {
        // Firefox-specific approach
        const originalBody = document.body.innerHTML;
        document.body.style.width = '210mm';
        document.body.style.minHeight = '297mm';
        
        setTimeout(() => {
          window.print();
          setTimeout(() => {
            document.body.style.width = '';
            document.body.style.minHeight = '';
          }, 1000);
        }, 100);
        
      } else {
        // Default approach for other browsers
        document.documentElement.style.setProperty('--print-page-size', 'A3');
        
        setTimeout(() => {
          window.print();
        }, 100);
      }
      
    } catch (error) {
      // Fallback: Just trigger print normally
      console.warn('Could not set A3 print settings:', error);
      window.print();
    }
    
    // Call callback if provided
    if (onPrint) onPrint();
  };

  // Set up message listener for parent window communication
  useEffect(() => {
    // Only add listener in parent window (not iframe)
    if (typeof window !== 'undefined' && window === window.parent) {
      const handleMessage = (event) => {
        // Optional: Check origin for security
        if (parentWindowOrigin !== '*' && event.origin !== parentWindowOrigin) {
          return;
        }
        
        if (event.data?.action === 'print-page') {
          triggerAutoPrint();
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [parentWindowOrigin, onPrint, disabled]);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;

    // Check if we're in an iframe context
    if (typeof window !== 'undefined' && window.parent && window !== window.parent) {
      // We're inside an iframe - send message to parent
      window.parent.postMessage({ action: 'print-page' }, parentWindowOrigin);
    } else {
      // We're in the main window - automatically print with A3
      triggerAutoPrint();
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    
    // Trigger print on Enter or Space key
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  const wrapperStyle = {
    cursor: disabled ? 'not-allowed' : cursor,
    userSelect: 'none',
    display: 'inline-block',
    ...style
  };

  return (
    <div
      className={className}
      style={wrapperStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={tooltip || 'Click to print this page'}
      title={tooltip}
      {...otherProps}
    >
      {children}
    </div>
  );
};

export default PrintWrapper;
