import React from 'react';
import Head from 'next/head';
import PrintWrapper from '../components/PrintWrapper';
import PrintButton from '../components/PrintButton';

/**
 * Test page for A3 printing functionality
 * Demonstrates both PrintWrapper and PrintButton components
 */
const TestA3Print = () => {
  const handlePrintStart = () => {
    console.log('Print started with A3 settings');
  };

  const handlePrintComplete = () => {
    console.log('Print dialog opened');
  };

  return (
    <>
      <Head>
        <title>Test A3 Print - Enhanced Print Components</title>
        <meta name="description" content="Test page for A3 printing functionality" />
      </Head>

      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>A3 Print Test Page</h1>
        
        <div style={{ marginBottom: '30px' }}>
          <h2>Method 1: PrintWrapper Component</h2>
          <p>Click anywhere on the blue box below to trigger A3 printing:</p>
          
          <PrintWrapper
            onPrint={handlePrintStart}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              margin: '20px 0'
            }}
            tooltip="Click to print this page in A3 format"
          >
            <h3>📄 Click Here to Print in A3</h3>
            <p>This entire box is clickable and will open the print dialog with A3 paper size pre-selected.</p>
          </PrintWrapper>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2>Method 2: PrintButton Component</h2>
          <p>Use the enhanced print button with better A3 control:</p>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '20px 0' }}>
            <PrintButton
              text="Print A3"
              variant="primary"
              onPrint={handlePrintComplete}
            />
            
            <PrintButton
              text="Print A3 (Secondary)"
              variant="secondary"
              onPrint={handlePrintComplete}
            />
            
            <PrintButton
              text="Print A3 (Outline)"
              variant="outline"
              onPrint={handlePrintComplete}
            />
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2>Method 3: Direct CSS Classes</h2>
          <p>You can also use the CSS classes directly:</p>
          
          <button
            className="print-button print-button-primary"
            onClick={() => {
              // Apply A3 styles and print
              const style = document.createElement('style');
              style.textContent = `
                @media print {
                  @page { size: A3 !important; margin: 0.3in !important; }
                  body { width: 210mm !important; min-height: 297mm !important; }
                }
              `;
              document.head.appendChild(style);
              window.print();
              setTimeout(() => style.remove(), 1000);
            }}
          >
            🖨️ Print with CSS Classes
          </button>
        </div>

        <div className="a3-preview">
          <h2>A3 Preview (Screen Only)</h2>
          <p>This box shows the approximate A3 dimensions on screen. When you print, the content will be formatted for A3 paper size.</p>
          
          <h3>Sample Content for A3 Printing</h3>
          <p>This is sample content that will be printed on A3 paper. The print dialog should automatically open with A3 paper size selected.</p>
          
          <h4>Features of A3 Printing:</h4>
          <ul>
            <li>Automatic A3 paper size detection</li>
            <li>Proper margins and scaling</li>
            <li>Color printing support</li>
            <li>Cross-browser compatibility</li>
            <li>Responsive content layout</li>
          </ul>
          
          <h4>Technical Details:</h4>
          <p>
            A3 paper dimensions: 297mm × 420mm (11.7" × 16.5")<br/>
            Print margins: 0.3 inches<br/>
            Content width: 210mm (8.27")<br/>
            Content height: 297mm (11.7")
          </p>
        </div>

        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>📋 Instructions:</h3>
          <ol>
            <li>Click any of the print buttons or the blue box above</li>
            <li>The print dialog should open with A3 paper size pre-selected</li>
            <li>If A3 is not pre-selected, manually change it in the print dialog</li>
            <li>Adjust other print settings as needed (scale, margins, etc.)</li>
            <li>Click "Print" to print your document in A3 format</li>
          </ol>
          
          <p><strong>Note:</strong> If the print dialog doesn't automatically select A3, you may need to manually change the paper size in your browser's print dialog. This is a limitation of some browsers that don't fully support programmatic print settings.</p>
        </div>
      </div>
    </>
  );
};

export default TestA3Print;
