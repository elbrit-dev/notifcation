# 📦 TagFilter Component Dependencies

This guide shows you how to install the required dependencies for the different versions of the TagFilter component.

## 🎨 **Option 1: PrimeReact Version (Recommended)**

### Install Dependencies
```bash
npm install primereact primeicons
```

### Import CSS in your main file (e.g., `_app.js` or `index.js`)
```javascript
// PrimeReact theme (choose one)
import 'primereact/resources/themes/lara-light-blue/theme.css';     // Light theme
import 'primereact/resources/themes/lara-dark-blue/theme.css';      // Dark theme
import 'primereact/resources/themes/lara-light-indigo/theme.css';   // Indigo theme
import 'primereact/resources/themes/lara-light-purple/theme.css';   // Purple theme
import 'primereact/resources/themes/lara-light-teal/theme.css';     // Teal theme

// PrimeReact core CSS
import 'primereact/resources/primereact.min.css';

// PrimeIcons
import 'primeicons/primeicons.css';
```

### Use the Component
```javascript
import TagFilterPrimeReact from './components/TagFilterPrimeReact';

<TagFilterPrimeReact
  tagList={['Electronics', 'Clothing', 'Books']}
  tagStyle="tag"
  selectedStyle="filled"
  multiSelect={true}
/>
```

## 🎨 **Option 2: Ant Design Version**

### Install Dependencies
```bash
npm install antd @ant-design/icons
```

### Import CSS in your main file
```javascript
import 'antd/dist/reset.css';
```

### Use the Component
```javascript
import TagFilterAntDesign from './components/TagFilterAntDesign';

<TagFilterAntDesign
  tagList={['Electronics', 'Clothing', 'Books']}
  tagStyle="tag"
  selectedStyle="filled"
  multiSelect={true}
/>
```

## 🎨 **Option 3: Custom CSS Version (Original)**

### No additional dependencies required
```javascript
import TagFilter from './components/TagFilter';
import './components/TagFilter.css';

<TagFilter
  tagList={['Electronics', 'Clothing', 'Books']}
  tagStyle="pill"
  selectedStyle="filled"
  multiSelect={true}
/>
```

## 📊 **Dependency Comparison**

| Feature | PrimeReact | Ant Design | Custom CSS |
|---------|------------|------------|------------|
| **Bundle Size** | ~500KB | ~300KB | ~50KB |
| **Dependencies** | 2 packages | 2 packages | 0 packages |
| **Theming** | ✅ Multiple themes | ✅ Design system | ✅ Customizable |
| **Icons** | ✅ 600+ PrimeIcons | ✅ 300+ Ant Icons | ❌ None |
| **Components** | ✅ 80+ components | ✅ 60+ components | ❌ Just tags |
| **Enterprise** | ✅ Yes | ✅ Yes | ❌ No |

## 🚀 **Quick Start Recommendations**

### **For Professional/Enterprise Apps:**
Choose **PrimeReact** - it provides the most professional look and comprehensive component library.

### **For Modern Consumer Apps:**
Choose **Ant Design** - it offers clean, modern design with excellent performance.

### **For Lightweight/Simple Apps:**
Choose **Custom CSS** - no dependencies, fully customizable, smallest bundle size.

## 🔧 **Installation Commands**

### **All-in-one installation:**
```bash
# Install both libraries (if you want to compare)
npm install primereact primeicons antd @ant-design/icons

# Or install just one
npm install primereact primeicons
# OR
npm install antd @ant-design/icons
```

### **Development dependencies (optional):**
```bash
# For TypeScript support
npm install --save-dev @types/react @types/react-dom

# For better development experience
npm install --save-dev eslint prettier
```

## 📁 **File Structure After Installation**

```
your-project/
├── components/
│   ├── TagFilter.js              # Custom CSS version
│   ├── TagFilterPrimeReact.js    # PrimeReact version
│   ├── TagFilterAntDesign.js     # Ant Design version
│   └── TagFilter.css             # Custom CSS styles
├── examples/
│   ├── TagFilterExample.jsx      # Basic examples
│   └── TagFilterComparison.jsx   # Comparison examples
├── package.json                   # Updated with new dependencies
└── node_modules/
    ├── primereact/               # PrimeReact components
    ├── primeicons/               # PrimeReact icons
    ├── antd/                     # Ant Design components
    └── @ant-design/icons/        # Ant Design icons
```

## 🎯 **Next Steps**

1. **Choose your preferred version** based on your needs
2. **Install the dependencies** using the commands above
3. **Import the CSS** in your main application file
4. **Use the component** in your Plasmic Studio pages
5. **Customize the styling** through Plasmic Studio props

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **CSS not loading:** Make sure you've imported the CSS files in your main application file
2. **Icons not showing:** Verify that the icon packages are installed and imported
3. **Styling conflicts:** Check if other CSS frameworks are conflicting with the component styles
4. **Bundle size too large:** Consider using only the specific components you need instead of the full library

### **Performance Tips:**

1. **Tree shaking:** Import only the specific components you need
2. **Lazy loading:** Load the component libraries only when needed
3. **CSS optimization:** Use CSS purging to remove unused styles

---

**Happy tagging with professional components! 🎉** 