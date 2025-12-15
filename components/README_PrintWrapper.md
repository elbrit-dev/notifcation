# PrintWrapper Component

A **wrapper component** that triggers A3 printing when **any content inside is clicked**. Perfect for **custom icons, images, text, or any designs** you wish to make clickable for printing.

## 🎯 **What it does**

- **Wraps any content** (icons, images, text)  
- **Makes entire area clickable** for printing  
- **Automatic A3 page size** when print dialog opens
- **Zero configuration required**

## 🚀 **Quick Setup**

### In Plasmic:
1. Drag **PrintWrapper** onto canvas
2. **Add content inside** (icons, images, etc.)
3. **Click anywhere inside** = Opens print dialog with A3 size

---

## 📋 **Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | slot | - | **Any content** to be clickable (icons, images, text) |
| `className` | string | "" | Additional CSS classes |
| `style` | object | {} | Inline styles |
| `cursor` | choice | "pointer" | Cursor style (*pointer*, *default*, *grab*, *not-allowed*) |
| `disabled` | boolean | false | Disable the print functionality |
| `tooltip` | string | "Click to print this page" | Tooltip text |
| `parentWindowOrigin` | string | "*" | Security for postMessage |
| `onPrint` | eventHandler | - | Callback when print starts |

---

## 🎨 **Usage Examples**

### 1. **Icon Print Button**
```jsx
<PrintWrapper>
  <i className="pi pi-print" style={{ fontSize: '20px', color: '#007bff' }} />
</PrintWrapper>
```

### 2. **Image Print Trigger**  
```jsx
<PrintWrapper style={{ cursor: 'pointer', padding: '10px' }}>
  <img src="print-icon.png" alt="Print" width="24" height="24" />
</PrintWrapper>
```

### 3. **Text Print Button**
```jsx
<PrintWrapper 
  style={{ 
    padding: '8px 16px', 
    backgroundColor: '#007bff', 
    color: 'white',
    borderRadius: '4px'
  }}
>
  📄 Print Document
</PrintWrapper>
```

### 4. **Custom Design Print**
```jsx
<PrintWrapper 
  className="custom-print-button"
  cursor="grab"
  tooltip="Click to print A3 size"
>
  <div style={{ 
    background: 'linear-gradient(45deg, #007bff, #28a745)',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    textAlign: 'center'
  }}>
    🖨️ PRINT (A3)
  </div>
</PrintWrapper>
```

### 5. **Large Clickable Area**
```jsx
<PrintWrapper 
  style={{ 
    display: 'flex',
    alignItems: 'center', 
    justifyContent: 'center',
    width: '100px',
    height: '60px',
    background: '#f8f9fa',
    border: '2px dashed #007bff',
    borderRadius: '8px'
  }}
>
  <i className="pi pi-print" style={{ fontSize: '24px', color: '#007bff' }} />
</PrintWrapper>
```

---

## 🔧 **In Plasmic Studio**

### **Setup Process:**
1. **Drag** `PrintWrapper` component onto canvas
2. **Resize** to your desired clickable area
3. **Add child content** using Plasmic slots:
   - **Icons** (PrimeReact icon classes)
   - **Images** (upload or URL)  
   - **Text elements** 
   - **Custom designs**

### **Customization Options:**
- **Cursor**: Choose how pointer looks when hovering
- **Disabled**: Toggle print functionality on/off
- **Tooltip**: Custom hover text
- **Styling**: Full CSS control for wrapper

---

## ✨ **Use Cases**

### **Perfect for:**
- ✅ **Icon buttons** (printer icon)
- ✅ **Custom print designs** (styled cards)  
- ✅ **Large clickable areas** (entire print sections)
- ✅ **Image triggers** (photo with print overlay)
- ✅ **Text links** ("Click here to print")
- ✅ **Interactive elements** (draggable print zones)

### **Advanced Examples:**
```jsx
{/* Card with print overlay */}
<PrintWrapper style={{ position: 'relative' }}>
  <img src="document-preview.png" />
  <div style={{ 
    position: 'absolute', 
    top: '50%', 
    left: '50%', 
    transform: 'translate(-50%, -50%)',
    background: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: '8px'
  }}>
    📄 Print
  </div>
</PrintWrapper>

{/* Disabled state example */}
<PrintWrapper 
  disabled={true} 
  cursor="not-allowed"
  style={{ opacity: 0.5 }}
>
  🔒 Print (Coming Soon)
</PrintWrapper>
```

---

## 🔍 **How It Works**

1. **👆 User clicks anywhere** inside wrapper  
2. **📱 PrintWrapper detects** click on any child element
3. **⚡ Immediately applies** A3 page size CSS  
4. **🖨️ Opens print dialog** with A3 preset
5. **📄 Ready to print** large format documents

---

## 👾 **Key Features**

- ✨ **Any content** can trigger print  
- 🎯 **Large click targets** for better UX
- 🏷️ **A3 automatic** page size setting  
- 🔗 **Iframe communication** handles Plasmic contexts
- 🛡️ **Accessible** (keyboard navigation support)
- 🎨 **Customizable clicking** behaviors

---

## 💡 **Pro Tips**

1. **Use adequate padding** around clickable content
2. **Visual feedback** on hover with cursor changes  
3. **Combine with designs** for branded print buttons
4. **Stack multiple wrappers** for different print actions
5. **Add icons + text** for clear interaction indicators

The PrintWrapper gives you **complete flexibility** to make **anything clickable** for automatic A3 printing! 🚀
