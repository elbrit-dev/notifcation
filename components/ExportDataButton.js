import React, { useState, useMemo, useCallback } from "react";
import dynamic from 'next/dynamic';
import * as XLSX from 'xlsx';
import { Download } from "lucide-react";

// Dynamic imports for PrimeReact components
const Button = dynamic(() => import('primereact/button').then(m => m.Button), { ssr: false });

/**
 * ExportDataButton - A standalone export button component
 * 
 * Features:
 * - Export data to CSV or Excel format
 * - Automatically detects and handles nested/expansion data
 * - Modal to select export format
 * - Supports simple arrays and nested arrays
 * 
 * Props:
 * @param {Array} data - Main data array (array of objects)
 * @param {Array} columns - Column definitions (optional, auto-generated if not provided)
 * @param {string} nestedDataKey - Key for nested data (default: 'items')
 * @param {boolean} useNativeButton - Use PrimeReact button (default: false, uses custom button)
 * @param {string} label - Button label (default: 'Export')
 * @param {string} icon - Icon to display (default: Download from lucide-react)
 * @param {string} iconPosition - Icon position: 'left' or 'right' (default: 'left')
 * @param {boolean} iconOnly - Show only icon without label (default: false)
 * @param {string} buttonStyle - Custom inline styles for button
 * @param {string} className - Custom class name for button
 * @param {string} size - Button size: 'small', 'medium', 'large' (default: 'medium')
 * @param {boolean} disabled - Disable button (default: false)
 * @param {string} variant - Button variant: 'primary', 'secondary', 'outline', 'light' (default: 'primary')
 */

const ExportDataButton = ({
  data = [],
  columns = [],
  nestedDataKey = 'items',
  useNativeButton = false,
  label = 'Export',
  iconPosition = 'left',
  iconOnly = false,
  buttonStyle = {},
  className = '',
  size = 'medium',
  disabled = false,
  variant = 'primary',
  onExportStart,
  onExportComplete,
}) => {
  const [showExportModal, setShowExportModal] = useState(false);

  // Auto-generate columns from data if not provided
  const generatedColumns = useMemo(() => {
    if (columns && columns.length > 0) {
      return columns.map(col => ({
        key: col.key || col.field || col.header,
        title: col.title || col.header || col.key,
        ...col
      }));
    }
    
    if (!data || data.length === 0) return [];
    
    const firstRow = data[0];
    return Object.keys(firstRow).map(key => {
      const value = firstRow[key];
      let type = 'text';
      
      if (typeof value === 'number') type = 'number';
      else if (typeof value === 'boolean') type = 'boolean';
      else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) type = 'date';
      else if (Array.isArray(value)) type = 'array';
      
      return {
        key,
        title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        type
      };
    });
  }, [columns, data]);

  // Filter out array columns from display
  const displayColumns = useMemo(() => {
    return generatedColumns.filter(col => col.type !== 'array');
  }, [generatedColumns]);

  // Check if data has nested/expansion data
  const hasNestedData = useMemo(() => {
    if (!data || data.length === 0) return false;
    
    return data.some(row => {
      const nested = row[nestedDataKey] || row.items || row.children || row.HQs;
      return nested && Array.isArray(nested) && nested.length > 0;
    });
  }, [data, nestedDataKey]);

  // Open export format selection modal
  const handleExportClick = useCallback(() => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }
    setShowExportModal(true);
  }, [data]);

  // Handle export format selection
  const handleExportFormat = useCallback((format) => {
    setShowExportModal(false);
    
    if (onExportStart) {
      onExportStart(format);
    }
    
    setTimeout(() => {
      if (format === 'excel') {
        exportToExcelXLSX();
      } else if (format === 'csv') {
        exportToCSV();
      }
      
      if (onExportComplete) {
        onExportComplete(format);
      }
    }, 100);
  }, [data, displayColumns, hasNestedData, nestedDataKey, onExportStart, onExportComplete]);

  // Export to CSV format
  const exportToCSV = useCallback(() => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    // Helper function to format cell value
    const formatCellValue = (value) => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    let csvRows = [];
    
    if (hasNestedData) {
      // Export child rows with ALL non-numeric parent data merged
      
      // Get all non-numeric parent columns
      const parentNonNumericColumns = displayColumns.filter(col => {
        // Check if column contains numeric data
        const sampleValue = data.length > 0 ? data[0][col.key] : null;
        return typeof sampleValue !== 'number';
      });
      
      // Get all nested data columns from first nested row
      let nestedColumns = [];
      let allNestedDataRows = [];
      
      data.forEach((row) => {
        const nestedData = row[nestedDataKey] || row.items || row.children || row.HQs;
        
        if (nestedData && Array.isArray(nestedData) && nestedData.length > 0) {
          // Get nested columns from first nested row if not already set
          if (nestedColumns.length === 0) {
            nestedColumns = Object.keys(nestedData[0]);
          }
          
          // Add each nested row with ALL parent non-numeric data
          nestedData.forEach(nestedRow => {
            // Create an object with all non-numeric parent data
            const parentData = {};
            parentNonNumericColumns.forEach(col => {
              parentData[col.key] = row[col.key];
            });
            
            allNestedDataRows.push({
              parentData: parentData,
              nestedData: nestedRow
            });
          });
        }
      });
      
      // Create headers: All Parent Non-Numeric Columns + all nested columns
      const parentHeaders = parentNonNumericColumns.map(col => col.title);
      const nestedHeaders = nestedColumns.map(col => {
        // Format column name
        return col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1');
      });
      const headers = [...parentHeaders, ...nestedHeaders];
      
      // Create rows: All parent non-numeric values + all nested data values
      allNestedDataRows.forEach(({ parentData, nestedData }) => {
        const parentValues = parentNonNumericColumns.map(col => formatCellValue(parentData[col.key]));
        const nestedValues = nestedColumns.map(col => formatCellValue(nestedData[col]));
        const rowCells = [...parentValues, ...nestedValues];
        csvRows.push(rowCells.join(','));
      });
      
      const csvContent = `${headers.join(',')}\n${csvRows.join('\n')}`;

      // Create blob and download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `export_expansion_data_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Simple export without nested data
      const headers = displayColumns.map(col => col.title).join(',');
      const rows = data.map(row => {
        return displayColumns.map(col => formatCellValue(row[col.key])).join(',');
      }).join('\n');

      const csvContent = `${headers}\n${rows}`;

      // Create blob and download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `export_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [data, displayColumns, hasNestedData, nestedDataKey]);

  // Export to Excel XLSX format using SheetJS
  const exportToExcelXLSX = useCallback(() => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    let worksheetData = [];

    if (hasNestedData) {
      // Export child rows with ALL non-numeric parent data merged
      
      // Get all non-numeric parent columns
      const parentNonNumericColumns = displayColumns.filter(col => {
        // Check if column contains numeric data
        const sampleValue = data.length > 0 ? data[0][col.key] : null;
        return typeof sampleValue !== 'number';
      });
      
      // Get all nested data columns from first nested row
      let nestedColumns = [];
      let allNestedDataRows = [];
      
      data.forEach((row) => {
        const nestedData = row[nestedDataKey] || row.items || row.children || row.HQs;
        
        if (nestedData && Array.isArray(nestedData) && nestedData.length > 0) {
          // Get nested columns from first nested row if not already set
          if (nestedColumns.length === 0) {
            nestedColumns = Object.keys(nestedData[0]);
          }
          
          // Add each nested row with ALL parent non-numeric data
          nestedData.forEach(nestedRow => {
            // Create an object with all non-numeric parent data
            const parentData = {};
            parentNonNumericColumns.forEach(col => {
              parentData[col.key] = row[col.key];
            });
            
            allNestedDataRows.push({
              parentData: parentData,
              nestedData: nestedRow
            });
          });
        }
      });
      
      // Create headers: All Parent Non-Numeric Columns + all nested columns
      const parentHeaders = parentNonNumericColumns.map(col => col.title);
      const nestedHeaders = nestedColumns.map(col => {
        // Format column name
        return col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1');
      });
      const headers = [...parentHeaders, ...nestedHeaders];
      
      // Add headers as first row
      worksheetData.push(headers);
      
      // Add data rows: All parent non-numeric values + all nested data values
      allNestedDataRows.forEach(({ parentData, nestedData }) => {
        const parentValues = parentNonNumericColumns.map(col => parentData[col.key] ?? '');
        const nestedValues = nestedColumns.map(col => nestedData[col] ?? '');
        const rowCells = [...parentValues, ...nestedValues];
        worksheetData.push(rowCells);
      });
    } else {
      // Simple export without nested data
      const headers = displayColumns.map(col => col.title);
      worksheetData.push(headers);
      
      data.forEach(row => {
        const rowData = displayColumns.map(col => row[col.key] ?? '');
        worksheetData.push(rowData);
      });
    }

    // Create worksheet from data
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
    const columnWidths = worksheetData[0].map((_, colIndex) => {
      const maxLength = Math.max(
        ...worksheetData.map(row => {
          const cell = row[colIndex];
          return cell ? String(cell).length : 10;
        })
      );
      return { wch: Math.min(Math.max(maxLength, 10), 50) };
    });
    worksheet['!cols'] = columnWidths;
    
    // Style the header row
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    // Generate XLSX file and trigger download
    XLSX.writeFile(
      workbook, 
      `export_${hasNestedData ? 'expansion_data_' : ''}${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  }, [data, displayColumns, hasNestedData, nestedDataKey]);

  // Button size styles
  const sizeStyles = {
    small: {
      padding: '0.375rem 0.625rem',
      fontSize: '0.75rem',
      iconSize: 14
    },
    medium: {
      padding: '0.5rem 0.875rem',
      fontSize: '0.875rem',
      iconSize: 16
    },
    large: {
      padding: '0.625rem 1.125rem',
      fontSize: '1rem',
      iconSize: 18
    }
  };

  // Button variant styles
  const variantStyles = {
    primary: {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      border: '1px solid #3b82f6',
      hoverBackgroundColor: '#2563eb',
      hoverBorderColor: '#2563eb'
    },
    secondary: {
      backgroundColor: '#6b7280',
      color: '#ffffff',
      border: '1px solid #6b7280',
      hoverBackgroundColor: '#4b5563',
      hoverBorderColor: '#4b5563'
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#3b82f6',
      border: '1px solid #3b82f6',
      hoverBackgroundColor: '#eff6ff',
      hoverBorderColor: '#3b82f6'
    },
    light: {
      backgroundColor: '#ffffff',
      color: '#6b7280',
      border: '1px solid #e5e7eb',
      hoverBackgroundColor: '#f9fafb',
      hoverBorderColor: '#d1d5db',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    }
  };

  const currentSize = sizeStyles[size] || sizeStyles.medium;
  const currentVariant = variantStyles[variant] || variantStyles.primary;

  // Custom button
  const customButton = (
    <button
      type="button"
      onClick={handleExportClick}
      disabled={disabled || !data || data.length === 0}
      className={`export-data-button ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: iconOnly ? '0' : '0.5rem',
        padding: currentSize.padding,
        fontSize: currentSize.fontSize,
        fontWeight: '500',
        backgroundColor: currentVariant.backgroundColor,
        color: currentVariant.color,
        border: currentVariant.border,
        borderRadius: '0.5rem',
        cursor: disabled || !data || data.length === 0 ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
        opacity: disabled || !data || data.length === 0 ? 0.5 : 1,
        boxShadow: currentVariant.boxShadow || 'none',
        ...buttonStyle
      }}
      onMouseEnter={(e) => {
        if (!disabled && data && data.length > 0) {
          e.currentTarget.style.backgroundColor = currentVariant.hoverBackgroundColor;
          e.currentTarget.style.borderColor = currentVariant.hoverBorderColor;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && data && data.length > 0) {
          e.currentTarget.style.backgroundColor = currentVariant.backgroundColor;
          e.currentTarget.style.borderColor = currentVariant.border.split(' ')[2];
        }
      }}
      title={iconOnly ? label : undefined}
    >
      {iconPosition === 'left' && <Download size={currentSize.iconSize} />}
      {!iconOnly && <span>{label}</span>}
      {iconPosition === 'right' && <Download size={currentSize.iconSize} />}
    </button>
  );

  // Native PrimeReact button
  const nativeButton = (
    <Button
      icon="pi pi-download"
      label={label}
      onClick={handleExportClick}
      disabled={disabled || !data || data.length === 0}
      className={`p-button-outlined p-button-success ${className}`}
      style={{ 
        fontSize: currentSize.fontSize, 
        padding: currentSize.padding,
        ...buttonStyle 
      }}
      tooltip="Export data"
    />
  );

  return (
    <>
      {useNativeButton ? nativeButton : customButton}

      {/* Export Format Selection Modal */}
      {showExportModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowExportModal(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              minWidth: '400px',
              maxWidth: '90vw',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              animation: 'modalSlideIn 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ 
              margin: '0 0 0.5rem 0', 
              fontSize: '1.5rem', 
              fontWeight: '600',
              color: '#1f2937'
            }}>
              Export Data
            </h3>
            <p style={{ 
              margin: '0 0 1.5rem 0', 
              fontSize: '0.875rem', 
              color: '#6b7280'
            }}>
              {hasNestedData 
                ? `Choose your preferred export format. ${data.length} parent rows with nested data detected.`
                : `Choose your preferred export format. ${data.length} rows to export.`
              }
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* CSV Option */}
              <button
                onClick={() => handleExportFormat('csv')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  backgroundColor: '#f9fafb',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  textAlign: 'left',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#10b981',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'white',
                  flexShrink: 0
                }}>
                  CSV
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                    CSV File
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Comma-separated values, universal compatibility
                  </div>
                </div>
                <div style={{ color: '#3b82f6', fontSize: '1.5rem' }}>→</div>
              </button>
              
              {/* Excel Option */}
              <button
                onClick={() => handleExportFormat('excel')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  backgroundColor: '#f9fafb',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  textAlign: 'left',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#059669',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: 'white',
                  flexShrink: 0
                }}>
                  XLSX
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                    Excel File (.xlsx)
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Modern Excel format with styling support
                  </div>
                </div>
                <div style={{ color: '#3b82f6', fontSize: '1.5rem' }}>→</div>
              </button>
            </div>
            
            {/* Cancel Button */}
            <button
              onClick={() => setShowExportModal(false)}
              style={{
                marginTop: '1rem',
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#6b7280',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default ExportDataButton;

