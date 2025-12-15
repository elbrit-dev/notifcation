import React, { useState, useCallback } from "react";
import dynamic from 'next/dynamic';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, FileText, CheckCircle, XCircle, Loader, FileUp, FileDown } from "lucide-react";

// Dynamic imports for PrimeReact components
const Button = dynamic(() => import('primereact/button').then(m => m.Button), { ssr: false });
const Dialog = dynamic(() => import('primereact/dialog').then(m => m.Dialog), { ssr: false });
const ProgressBar = dynamic(() => import('primereact/progressbar').then(m => m.ProgressBar), { ssr: false });

/**
 * FileImportButton - A component to upload and import CSV/Excel files
 * 
 * Features:
 * - Upload CSV (.csv) and Excel (.xlsx, .xls) files
 * - Automatically converts files to JSON array
 * - Preview imported data
 * - Save data to global state or use via callback
 * - Progress indicator during import
 * 
 * Props:
 * @param {Function} onImportComplete - Callback function called with imported data array
 * @param {string} stateKey - Optional key to save data to global state ($ctx.state[stateKey])
 * @param {Function} setState - Optional setState function (bind to $ctx.fn.setState in Plasmic)
 * @param {string} label - Button label (default: 'Import File')
 * @param {string} icon - Icon to display (default: Upload from lucide-react)
 * @param {string} iconPosition - Icon position: 'left' or 'right' (default: 'left')
 * @param {boolean} iconOnly - Show only icon without label (default: false)
 * @param {string} className - Custom class name for button
 * @param {string} size - Button size: 'small', 'medium', 'large' (default: 'medium')
 * @param {boolean} disabled - Disable button (default: false)
 * @param {string} variant - Button variant: 'primary', 'secondary', 'outline', 'light' (default: 'primary')
 * @param {boolean} showPreview - Show preview dialog after import (default: true)
 * @param {number} maxFileSize - Maximum file size in MB (default: 10)
 * @param {boolean} firstRowAsHeader - Use first row as headers (default: true)
 * @param {Function} onError - Callback for error handling
 */

const FileImportButton = ({
  onImportComplete,
  stateKey = null,
  setState = null,
  label = 'Import File',
  iconPosition = 'left',
  iconOnly = false,
  className = '',
  size = 'medium',
  disabled = false,
  variant = 'outline',
  showPreview = true,
  maxFileSize = 10,
  firstRowAsHeader = true,
  onError,
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importedData, setImportedData] = useState(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);

  // Get setState function from props or try to access from global context
  const getSetState = useCallback(() => {
    // First, use the setState prop if provided
    if (setState && typeof setState === 'function') {
      return setState;
    }
    // Try to access from window if available (for Plasmic context)
    if (typeof window !== 'undefined') {
      // Try multiple possible locations
      if (window.__plasmicContext?.fn?.setState) {
        return window.__plasmicContext.fn.setState;
      }
      // Try accessing via DataProvider context (if available)
      if (window.plasmicDataContext?.fn?.setState) {
        return window.plasmicDataContext.fn.setState;
      }
    }
    return null;
  }, [setState]);

  // Parse CSV file
  const parseCSV = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n').filter(line => line.trim() !== '');
          
          if (lines.length === 0) {
            reject(new Error('CSV file is empty'));
            return;
          }

          // Parse CSV (handles quoted values and commas)
          const parseCSVLine = (line) => {
            const result = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              
              if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                  current += '"';
                  i++; // Skip next quote
                } else {
                  inQuotes = !inQuotes;
                }
              } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            result.push(current.trim());
            return result;
          };

          const rows = lines.map(line => parseCSVLine(line));
          
          let headers = [];
          let dataRows = rows;

          if (firstRowAsHeader && rows.length > 0) {
            headers = rows[0].map(h => h.trim());
            dataRows = rows.slice(1);
          } else {
            // Generate headers if not using first row
            const maxCols = Math.max(...rows.map(r => r.length));
            headers = Array.from({ length: maxCols }, (_, i) => `Column${i + 1}`);
          }

          // Convert to JSON array
          const jsonData = dataRows.map(row => {
            const obj = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });

          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Error parsing CSV: ${error.message}`));
        }
      };

      reader.onerror = () => reject(new Error('Error reading CSV file'));
      reader.readAsText(file);
    });
  }, [firstRowAsHeader]);

  // Parse Excel file
  const parseExcel = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first sheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            defval: '', // Default value for empty cells
            raw: false, // Convert dates and numbers to strings
          });

          if (jsonData.length === 0) {
            reject(new Error('Excel file is empty or has no data'));
            return;
          }

          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Error parsing Excel file: ${error.message}`));
        }
      };

      reader.onerror = () => reject(new Error('Error reading Excel file'));
      reader.readAsArrayBuffer(file);
    });
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (event) => {
    const file = event.files[0];
    
    if (!file) {
      setError('No file selected');
      return;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      const errorMsg = `File size exceeds maximum allowed size of ${maxFileSize}MB`;
      setError(errorMsg);
      if (onError) onError(new Error(errorMsg));
      return;
    }

    // Check file type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['csv', 'xlsx', 'xls'];
    
    if (!allowedExtensions.includes(fileExtension)) {
      const errorMsg = `Unsupported file type. Please upload CSV or Excel files (.csv, .xlsx, .xls)`;
      setError(errorMsg);
      if (onError) onError(new Error(errorMsg));
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setError(null);
    setFileName(file.name);

    try {
      setImportProgress(30);
      
      let jsonData;
      
      if (fileExtension === 'csv') {
        jsonData = await parseCSV(file);
      } else {
        jsonData = await parseExcel(file);
      }

      setImportProgress(80);
      
      // Set imported data
      setImportedData(jsonData);
      
      // Save to global state if stateKey is provided
      if (stateKey) {
        const setState = getSetState();
        if (setState) {
          setState(stateKey, jsonData, (newValue) => {
            console.log(`Data saved to $ctx.state.${stateKey}`, newValue.length, 'rows');
          });
        } else {
          console.warn('setState not available. Make sure you are using this component within Plasmic context.');
        }
      }

      // Call callback if provided
      if (onImportComplete) {
        onImportComplete(jsonData, file.name);
      }

      setImportProgress(100);
      
      // Show preview dialog if enabled
      if (showPreview) {
        setTimeout(() => {
          setShowPreviewDialog(true);
          setIsImporting(false);
        }, 500);
      } else {
        setIsImporting(false);
      }
    } catch (error) {
      console.error('Import error:', error);
      setError(error.message || 'An error occurred while importing the file');
      setIsImporting(false);
      if (onError) onError(error);
    }
  }, [parseCSV, parseExcel, onImportComplete, stateKey, showPreview, maxFileSize, onError, getSetState]);

  // Get file icon based on type - using document with arrow icon
  const getFileIcon = (fileName) => {
    // Use FileUp icon which looks like document with arrow
    return <FileUp size={18} className="text-blue-600" />;
  };

  // Button size classes
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  // Variant classes - updated to match the image style
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-600',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white border border-gray-600',
    outline: 'bg-white border border-blue-600 text-blue-600 hover:bg-blue-50',
    light: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
  };

  // Handle file input change
  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload({ files: [file] });
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [handleFileUpload]);

  return (
    <div className="file-import-button-wrapper">
      <div className="relative inline-block">
        {/* Custom styled button matching the design - blue border, white background, blue text */}
        <label
          className={`
            ${sizeClasses[size] || sizeClasses.medium}
            bg-white border border-blue-600 text-blue-600
            hover:bg-blue-50 active:bg-blue-100
            ${disabled || isImporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            rounded-md font-medium transition-all duration-200
            inline-flex items-center gap-2
            ${className}
          `}
        >
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled || isImporting}
            style={{ display: 'none' }}
          />
          {iconOnly ? (
            getFileIcon(fileName)
          ) : (
            <>
              {iconPosition === 'left' && getFileIcon(fileName)}
              <span>{label}</span>
              {iconPosition === 'right' && getFileIcon(fileName)}
            </>
          )}
        </label>
        
        {isImporting && (
          <div className="absolute -bottom-8 left-0 right-0 mt-2">
            <ProgressBar value={importProgress} showValue={false} className="h-1" />
            <p className="text-xs text-gray-600 mt-1 text-center">
              Importing... {Math.round(importProgress)}%
            </p>
          </div>
        )}

        {error && (
          <div className="absolute -bottom-8 left-0 right-0 mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
            <div className="flex items-center gap-2">
              <XCircle size={16} />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Preview Dialog - Clean and modern design */}
      {showPreview && importedData && (
        <Dialog
          visible={showPreviewDialog}
          onHide={() => setShowPreviewDialog(false)}
          header={
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-green-600" />
              <span className="font-semibold text-lg">Import Successful</span>
            </div>
          }
          modal
          style={{ width: '90vw', maxWidth: '1400px' }}
          className="file-import-preview-dialog"
          footer={
            <div className="flex justify-end gap-2">
              <Button
                label="Close"
                onClick={() => setShowPreviewDialog(false)}
                className="p-button-outline"
              />
            </div>
          }
        >
          <div className="p-6">
            {/* Success message and file info */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle size={18} />
                <span className="font-medium">
                  Successfully imported <strong>{importedData.length}</strong> row{importedData.length !== 1 ? 's' : ''} from <strong>{fileName}</strong>
                </span>
              </div>

              {stateKey && (
                <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded text-blue-800 text-sm">
                  <strong>Data saved to:</strong> <code className="bg-blue-100 px-2 py-1 rounded">$ctx.state.{stateKey}</code>
                </div>
              )}
            </div>

            {/* Data preview table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="max-h-[500px] overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      {Object.keys(importedData[0] || {}).map((key) => (
                        <th
                          key={key}
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {importedData.slice(0, 100).map((row, index) => (
                      <tr key={index} className="hover:bg-blue-50 transition-colors">
                        {Object.values(row).map((value, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap"
                          >
                            {String(value || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {importedData.length > 100 && (
                <div className="p-3 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-600">
                  Showing first 100 rows of <strong>{importedData.length}</strong> total rows
                </div>
              )}
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default FileImportButton;

