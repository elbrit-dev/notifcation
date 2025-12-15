# PrintButton Component

A ready-made **Plasmic Code Component** that provides printing functionality within iframe contexts (like Plasmic Studio preview and embedded components).

## 🔧 What It Does

The `PrintButton` component automatically handles cross-iframe communication between:
- **Plasmic iframe** → **Parent window** for print dialog
- Ensures print dialogs work in both Plasma Studio preview and deployed applications

## 🚀 Quick Setup

### 1. Register the Component in Plasmic

1. In your Plasmic project **Library** tab
2. Click **"Add component"** → **"Code component"**
3. **Component name**: `PrintButton`
4. **Tarball URL**: Point to your built component bundle
5. **Import path**: `@/components/PrintButton`

### 2. Use in Plasmic

1. Drag **PrintButton** from the component panel
2. Place it where you want a print button  
3. Customize labels, icons, style via props
4. **No additional wiring needed** - it handles everything automatically!

## 📋 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | "Print" | Button text |
| `icon` | string | "pi pi-print" | Icon class name |
| `iconPos` | string | "left" | Icon position ('left' or 'right') |
| `severity` | string | "primary" | Button style ('primary', 'secondary', 'success', 'info', 'warning', 'danger') |
| `size` | string | "normal" | Button size ('small', 'normal', 'large') |
| `outlined` | boolean | false | Whether button should be outlined |
| `rounded` | boolean | false | Whether button should have rounded corners |
| `text` | boolean | false | Whether button should be text only (no background) |
| `raised` | boolean | false | Whether button should have shadow |
| `loading` | boolean | false | Whether button is in loading state |
| `disabled` | boolean | false | Whether button is disabled |
| `className` | string | "" | Additional CSS classes |
| `style` | object | {} | Inline styles |
| `tooltip` | string | "Print this page" | Tooltip text |
| `tooltipOptions` | object | `{position: 'top'}` | Tooltip options |
| `badge` | string | null | Badge text to display on button |
| `badgeClass` | string | "p-badge-danger" | Badge CSS classes |
| `onPrint` | function | undefined | Callback fired when print is initiated |
| `parentWindowOrigin` | string | "*" | Origin for postMessage (for security) |

## 🎨 Examples

### Basic Print Button
```jsx
<PrintButton />
```

### Customized Print Button
```jsx
<PrintButton 
  label="Print Document"
  icon="pi pi-file-export"
  severity="success"
  size="large"
  outlined={false}
  rounded={true}
  tooltip="Export this page to printer"
/>
```

### Text-Only Print Button
```jsx
<PrintButton 
  text={true}
  label="Print this page"
  severity="info"
  icon="pi pi-print"
/>
```

## 🔗 How It Works

### In Plasmic Studio Preview (iframe)
```jsx
// Component detects iframe → sends postMessage
window.parent.postMessage({ action: 'print-page' }, '*');
```

### In Your Host Application (parent window)
```jsx
// Component listens for messages → triggers window.print()
useEffect(() => {
  const handleMessage = (event) => {
    if (event.data?.action === 'print-page') {
      window.print();
    }
  };
  window.addEventListener('message', handleMessage);
}, []);
```

### Direct Browsers (not iframe)
```jsx
// Component detects main window → prints directly  
window.print();
```

## 🛡️ Security Considerations

For production environments, specify `parentWindowOrigin`:

```jsx
<PrintButton parentWindowOrigin="https://yourdomain.com" />
```

This ensures messages are only accepted from trusted domains.

## 📱 Browser Compatibility

- ✅ Chrome, Firefox, Safari, Edge (modern versions)
- ✅ Mobile browsers  
- ✅ Works in Plasmic Studio preview
- ✅ Works in embedded iframes
- ✅ Degrades gracefully if parent communication fails

## 🔧 Troubleshooting

### Print dialog not appearing?
1. Check if your browser blocks popups
2. Ensure the button is actually clicked (not programmatically triggered)
3. Verify parent window communication is working

### Security error with postMessage?
- Set the `parentWindowOrigin` prop to your specific domain instead of `"*"`

### Custom print functionality needed?
- You can extend this by adding print-specific CSS and using the `onPrint` callback hook

## 💡 Advanced Usage

### Adding Custom Print Styles
```jsx
const handlePrint = () => {
  // Add print-specific CSS
  const printStyles = `
    @media print {
      body { font-size: 14pt; }
      .no-print { display: none !important; }
    }
  `;
  
  const styleSheet = document.createElement('style');
  styleSheet.textContent = printStyles;
  document.head.appendChild(styleSheet);
};

<PrintButton onPrint={handlePrint} />
```

### Multiple Print Buttons
Each `PrintButton` component is independent and handles its own communication bridge.

## 🎯 Usage in Production

The component is drop-in ready for your Plasmic projects. No additional configuration required - it automatically detects its context and handles communication appropriately.

Perfect for:
- ✅ Document pages
- ✅ Reports and dashboards  
- ✅ Invoice and receipt pages
- ✅ Any page that needs printing
