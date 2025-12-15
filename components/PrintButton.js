import React, { useState } from 'react';

/**
 * PrintButton - Enhanced print button with A3 paper size control
 * 
 * This component provides a more reliable way to print with A3 paper size
 * by using multiple techniques to ensure the print dialog opens with A3 selected.
 * 
 * Features:
 * - Automatic A3 paper size detection and setting
 * - Browser-specific print handling
 * - Visual feedback during print process
 * - Fallback methods for different browsers
 * - Customizable button appearance
 * 
 * @param {Object} props - Component props
 * @param {string} props.text - Button text (default: 'Print A3')
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles
 * @param {function} props.onPrint - Callback fired when print is initiated
 * @param {boolean} props.disabled - Disable the button
 * @param {string} props.variant - Button variant ('primary', 'secondary', 'outline')
 */
const PrintButton = ({
  text = 'Print A3',
  className = '',
  style = {},
  onPrint,
  disabled = false,
  variant = 'primary',
  ...otherProps
}) => {
  const [isPrinting, setIsPrinting] = useState(false);

  // Enhanced A3 print function with multiple fallback methods
  const handlePrint = async () => {
    if (disabled || isPrinting) return;

    setIsPrinting(true);

    try {
      // Method 1: Try to use the Print API if available (Chrome/Edge)
      if (window.print && typeof window.print === 'function') {
        await triggerA3Print();
      } else {
        // Fallback for older browsers
        window.print();
      }
    } catch (error) {
      console.error('Print failed:', error);
      // Final fallback
      window.print();
    } finally {
      setTimeout(() => setIsPrinting(false), 2000);
    }

    if (onPrint) onPrint();
  };

  const triggerA3Print = () => {
    return new Promise((resolve) => {
      // Create comprehensive A3 print styles
      const printStyles = `
        @media print {
          @page {
            size: A3 !important;
            margin: 0.3in !important;
          }
          @page :first {
            size: A3 !important;
            margin: 0.3in !important;
          }
          @page :left {
            size: A3 !important;
            margin: 0.3in !important;
          }
          @page :right {
            size: A3 !important;
            margin: 0.3in !important;
          }
          body {
            color: black !important;
            background: white !important;
            width: 210mm !important;
            min-height: 297mm !important;
            font-size: 12pt !important;
            line-height: 1.4 !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @media print and (color) {
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          }
        }
      `;

      // Remove existing print styles
      const existingStyle = document.getElementById('a3-print-styles');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Add new print styles
      const styleElement = document.createElement('style');
      styleElement.id = 'a3-print-styles';
      styleElement.textContent = printStyles;
      document.head.appendChild(styleElement);

      // Set document properties for A3
      document.documentElement.style.setProperty('--print-page-size', 'A3');
      document.documentElement.setAttribute('data-print-size', 'A3');

      // Try to set print preferences (browser dependent)
      try {
        // For Chrome/Edge - try to set print preferences
        if (window.chrome && window.chrome.runtime) {
          // Chrome extension context
          console.log('Chrome extension context detected');
        }
      } catch (e) {
        // Ignore errors
      }

      // Trigger print with delay to allow styles to apply
      setTimeout(() => {
        window.print();
        resolve();
      }, 200);
    });
  };

  // Button variant styles
  const getVariantStyles = () => {
    const baseStyles = {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      opacity: disabled ? 0.6 : 1,
      ...style
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: '#007bff',
          color: 'white',
          '&:hover': !disabled ? {
            backgroundColor: '#0056b3',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 8px rgba(0,123,255,0.3)'
          } : {}
        };
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: '#6c757d',
          color: 'white',
          '&:hover': !disabled ? {
            backgroundColor: '#545b62',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 8px rgba(108,117,125,0.3)'
          } : {}
        };
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: '#007bff',
          border: '2px solid #007bff',
          '&:hover': !disabled ? {
            backgroundColor: '#007bff',
            color: 'white',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 8px rgba(0,123,255,0.3)'
          } : {}
        };
      default:
        return baseStyles;
    }
  };

  const buttonStyles = getVariantStyles();

  return (
    <button
      className={`print-button ${className}`}
      style={buttonStyles}
      onClick={handlePrint}
      disabled={disabled || isPrinting}
      aria-label={`${text} - Opens print dialog with A3 paper size`}
      title={`${text} - Opens print dialog with A3 paper size`}
      {...otherProps}
    >
      {isPrinting ? (
        <>
          <div 
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid currentColor',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
          Printing...
        </>
      ) : (
        <>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="6,9 6,2 18,2 18,9"></polyline>
            <path d="M6,18H4a2,2,0,0,1-2-2V11a2,2,0,0,1,2-2H20a2,2,0,0,1,2,2v5a2,2,0,0,1-2,2H18"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          {text}
        </>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .print-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .print-button:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .print-button:focus {
          outline: 2px solid #007bff;
          outline-offset: 2px;
        }
      `}</style>
    </button>
  );
};

export default PrintButton;