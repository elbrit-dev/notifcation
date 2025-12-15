# A3 Printing Components - Enhanced Print Functionality

This guide explains how to use the enhanced A3 printing components that automatically set the print dialog to A3 paper size.

## 🚀 Quick Start

### Method 1: PrintWrapper Component (Recommended)

Wrap any content with the `PrintWrapper` component to make it clickable for A3 printing:

```jsx
import PrintWrapper from '../components/PrintWrapper';

<PrintWrapper
  onPrint={() => console.log('Print started')}
  style={{ padding: '20px', backgroundColor: '#007bff', color: 'white' }}
>
  <h3>Click to Print in A3</h3>
  <p>This entire area is clickable</p>
</PrintWrapper>
```

### Method 2: PrintButton Component

Use the enhanced print button with better A3 control:

```jsx
import PrintButton from '../components/PrintButton';

<PrintButton
  text="Print A3"
  variant="primary"
  onPrint={() => console.log('Print started')}
/>
```

### Method 3: CSS Classes

Include the A3 print CSS and use classes:

```jsx
import '../styles/PrintA3.css';

<button 
  className="print-button print-button-primary"
  onClick={() => window.print()}
>
  Print A3
</button>
```

## 📋 Components Overview

### PrintWrapper

A wrapper component that makes any content clickable for A3 printing.

**Props:**
- `children` - Content to be wrapped
- `className` - Additional CSS classes
- `style` - Inline styles
- `onPrint` - Callback fired when print is initiated
- `disabled` - Disable the wrapper
- `tooltip` - Tooltip text
- `cursor` - Cursor style (default: 'pointer')

**Features:**
- ✅ Entire wrapper area is clickable
- ✅ Automatic A3 page size preset
- ✅ Works in iframe contexts (Plasmic preview)
- ✅ Zero configuration required
- ✅ Browser-specific optimizations

### PrintButton

An enhanced print button with better A3 control and visual feedback.

**Props:**
- `text` - Button text (default: 'Print A3')
- `className` - Additional CSS classes
- `style` - Inline styles
- `onPrint` - Callback fired when print is initiated
- `disabled` - Disable the button
- `variant` - Button variant ('primary', 'secondary', 'outline')

**Features:**
- ✅ Loading state during print
- ✅ Multiple button variants
- ✅ Enhanced A3 print control
- ✅ Browser-specific handling
- ✅ Accessibility support

## 🎨 CSS Classes

### Print Styles

The `PrintA3.css` file provides comprehensive A3 printing styles:

```css
/* A3 page setup */
@media print {
  @page {
    size: A3 !important;
    margin: 0.3in !important;
  }
  
  body {
    width: 210mm !important;
    min-height: 297mm !important;
  }
}
```

### Button Styles

```css
.print-button-primary    /* Blue primary button */
.print-button-secondary  /* Gray secondary button */
.print-button-outline    /* Outlined button */
```

### Utility Classes

```css
.a3-preview             /* A3 preview container */
.no-print              /* Hide from print */
.print-only            /* Show only in print */
.no-break             /* Prevent page breaks */
.page-break           /* Force page break */
```

## 🔧 Browser Compatibility

The components use multiple techniques to ensure A3 printing works across different browsers:

### Chrome/Edge
- Uses CSS `@page` rules
- Creates temporary print container
- Sets document properties

### Firefox
- Uses CSS `@page` rules
- Modifies body dimensions
- Applies print-specific styles

### Safari
- Uses CSS `@page` rules
- Fallback to standard print

### Other Browsers
- CSS `@page` rules
- Document property setting
- Standard print fallback

## 📏 A3 Specifications

- **Paper Size:** 297mm × 420mm (11.7" × 16.5")
- **Content Width:** 210mm (8.27")
- **Content Height:** 297mm (11.7")
- **Margins:** 0.3 inches
- **Aspect Ratio:** 1:1.414 (√2)

## 🚨 Troubleshooting

### Print Dialog Doesn't Show A3

If the print dialog doesn't automatically select A3:

1. **Manual Selection:** Change paper size to A3 in the print dialog
2. **Browser Settings:** Check your browser's default print settings
3. **Printer Support:** Ensure your printer supports A3 paper size

### Content Not Fitting

If content doesn't fit properly on A3:

1. **Check Margins:** Ensure margins are set to 0.3 inches
2. **Content Width:** Keep content within 210mm width
3. **Font Size:** Use appropriate font sizes (12pt recommended)

### Print Quality Issues

For better print quality:

1. **Color Settings:** Use `color-adjust: exact` for colors
2. **Image Resolution:** Use high-resolution images
3. **Font Rendering:** Use web-safe fonts

## 📝 Usage Examples

### Basic Usage

```jsx
import PrintWrapper from '../components/PrintWrapper';

function MyComponent() {
  return (
    <PrintWrapper>
      <img src="/my-image.jpg" alt="Print this" />
    </PrintWrapper>
  );
}
```

### With Callbacks

```jsx
import PrintButton from '../components/PrintButton';

function MyComponent() {
  const handlePrint = () => {
    console.log('Print started');
    // Track analytics, show loading, etc.
  };

  return (
    <PrintButton
      text="Print Document"
      variant="primary"
      onPrint={handlePrint}
    />
  );
}
```

### Custom Styling

```jsx
<PrintWrapper
  style={{
    backgroundColor: '#28a745',
    color: 'white',
    padding: '15px',
    borderRadius: '5px',
    cursor: 'pointer'
  }}
  className="my-custom-class"
>
  <h3>Custom Print Button</h3>
</PrintWrapper>
```

### Disabled State

```jsx
<PrintButton
  text="Print A3"
  disabled={true}
  onPrint={() => {}}
/>
```

## 🔍 Testing

Test the A3 printing functionality:

1. **Visit Test Page:** Go to `/test-a3-print`
2. **Try Different Methods:** Test all three printing methods
3. **Check Print Dialog:** Verify A3 is pre-selected
4. **Test Different Browsers:** Chrome, Firefox, Safari, Edge

## 📚 Additional Resources

- [CSS @page Rule Documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/@page)
- [Print Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries)
- [Browser Print API](https://developer.mozilla.org/en-US/docs/Web/API/Window/print)

## 🤝 Contributing

To improve the A3 printing functionality:

1. Test across different browsers
2. Add new browser-specific optimizations
3. Improve error handling
4. Add more print options

## 📄 License

This A3 printing functionality is part of the main project and follows the same license terms.
