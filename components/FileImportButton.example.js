import React, { useState } from 'react';
import FileImportButton from './FileImportButton';

/**
 * Example usage of FileImportButton component
 * 
 * This example shows different ways to use the FileImportButton:
 * 1. Basic usage with callback
 * 2. Saving to global state
 * 3. Custom styling
 * 4. Without preview dialog
 */

const FileImportButtonExample = () => {
  const [importedData, setImportedData] = useState(null);
  const [importStatus, setImportStatus] = useState('');

  // Example 1: Basic usage with callback
  const handleImportComplete = (data, fileName) => {
    console.log('Imported data:', data);
    console.log('File name:', fileName);
    setImportedData(data);
    setImportStatus(`Successfully imported ${data.length} rows from ${fileName}`);
  };

  // Example 2: Error handling
  const handleError = (error) => {
    console.error('Import error:', error);
    setImportStatus(`Error: ${error.message}`);
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-6">File Import Button Examples</h1>

      {/* Example 1: Basic usage */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">1. Basic Usage with Callback</h2>
        <p className="text-gray-600">
          Import a file and receive the data via callback function.
        </p>
        <FileImportButton
          onImportComplete={handleImportComplete}
          onError={handleError}
          label="Import CSV/Excel File"
        />
        {importStatus && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded text-green-800">
            {importStatus}
          </div>
        )}
        {importedData && (
          <div className="mt-4">
            <p className="font-medium mb-2">Imported Data Preview:</p>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-64 text-sm">
              {JSON.stringify(importedData.slice(0, 5), null, 2)}
            </pre>
            <p className="text-sm text-gray-600 mt-2">
              Total rows: {importedData.length}
            </p>
          </div>
        )}
      </div>

      {/* Example 2: Save to global state */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">2. Save to Global State</h2>
        <p className="text-gray-600">
          Import a file and automatically save to $ctx.state.importedData
        </p>
        <FileImportButton
          stateKey="importedData"
          label="Import & Save to State"
          variant="primary"
          // In Plasmic Studio, bind setState prop to: $ctx.fn.setState
        />
        <p className="text-sm text-gray-600">
          After import, access data via: <code className="bg-gray-100 px-2 py-1 rounded">$ctx.state.importedData</code>
        </p>
        <p className="text-xs text-gray-500">
          <strong>Note:</strong> In Plasmic Studio, bind the <code>setState</code> prop to <code>$ctx.fn.setState</code> for full functionality.
        </p>
      </div>

      {/* Example 3: Custom styling */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">3. Custom Styling</h2>
        <p className="text-gray-600">
          Different button variants and sizes.
        </p>
        <div className="flex gap-4 flex-wrap">
          <FileImportButton
            label="Small Primary"
            size="small"
            variant="primary"
          />
          <FileImportButton
            label="Medium Secondary"
            size="medium"
            variant="secondary"
          />
          <FileImportButton
            label="Large Outline"
            size="large"
            variant="outline"
          />
          <FileImportButton
            label="Light Variant"
            variant="light"
          />
        </div>
      </div>

      {/* Example 4: Icon only */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">4. Icon Only Button</h2>
        <p className="text-gray-600">
          Button with only icon, no label.
        </p>
        <FileImportButton
          iconOnly={true}
          onImportComplete={handleImportComplete}
        />
      </div>

      {/* Example 5: Without preview */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">5. Without Preview Dialog</h2>
        <p className="text-gray-600">
          Import without showing preview dialog.
        </p>
        <FileImportButton
          showPreview={false}
          onImportComplete={(data) => {
            alert(`Imported ${data.length} rows successfully!`);
          }}
          label="Import (No Preview)"
        />
      </div>

      {/* Example 6: Custom file size limit */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">6. Custom File Size Limit</h2>
        <p className="text-gray-600">
          Set maximum file size to 5MB (default is 10MB).
        </p>
        <FileImportButton
          maxFileSize={5}
          label="Import (Max 5MB)"
          onError={handleError}
        />
      </div>

      {/* Example 7: Use imported data */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">7. Using Imported Data</h2>
        <p className="text-gray-600">
          Example of how to use the imported data in your application.
        </p>
        <FileImportButton
          stateKey="myData"
          onImportComplete={(data) => {
            // You can process the data here
            const processed = data.map(row => ({
              ...row,
              processed: true,
              timestamp: new Date().toISOString()
            }));
            console.log('Processed data:', processed);
          }}
          label="Import & Process Data"
        />
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> After importing, you can use the data in Plasmic Studio by binding to{' '}
            <code className="bg-blue-100 px-2 py-1 rounded">$ctx.state.myData</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileImportButtonExample;

