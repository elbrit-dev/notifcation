# 🏷️ TagFilter Component for Plasmic Studio

A powerful, configurable tag filter component that allows users to select from dynamic tag lists. Perfect for filtering content, products, categories, and more in Plasmic Studio.

## ✨ Features

- **Dynamic Tag Sources**: Get tags from props, page data, query data, or CMS data
- **Flexible Selection**: Single or multi-select modes with configurable limits
- **Beautiful Styling**: Multiple visual styles (pill, button, chip, badge)
- **Responsive Design**: Works perfectly on all device sizes
- **Accessibility**: Keyboard navigation and screen reader support
- **Plasmic Studio Ready**: Fully configurable through Plasmic Studio interface

## 🚀 Quick Start

### 1. Basic Usage

```jsx
import TagFilter from './components/TagFilter';

// Simple static tags
<TagFilter
  tagList={['Electronics', 'Clothing', 'Books']}
  tagStyle="pill"
  multiSelect={true}
/>
```

### 2. Dynamic Tags from Page Data

```jsx
<TagFilter
  tagDataSource="pageData"
  tagDataPath="products.categories"
  tagField="name"
  tagStyle="chip"
  multiSelect={true}
/>
```

### 3. Tags from Query/CMS Data

```jsx
<TagFilter
  tagDataSource="queryData"
  tagDataPath="searchResults.filters.tags"
  tagField="name"
  tagStyle="badge"
  maxSelections={5}
/>
```

## 📋 Props Reference

### Tag Data Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tagList` | `string[]` | `[]` | Direct array of tags (when using "props" data source) |
| `tagDataSource` | `string` | `"props"` | Data source: "props", "pageData", "queryData", "cmsData" |
| `tagDataPath` | `string` | `""` | Path to extract tags from data source (e.g., "products.categories") |
| `tagField` | `string` | `"name"` | Field name to extract from objects |

### Visual Configuration

| Prop | Type | Default | Options |
|------|------|---------|---------|
| `tagStyle` | `string` | `"pill"` | `"pill"`, `"button"`, `"chip"`, `"badge"` |
| `selectedStyle` | `string` | `"filled"` | `"filled"`, `"outlined"`, `"highlighted"` |
| `tagSize` | `string` | `"medium"` | `"small"`, `"medium"`, `"large"` |
| `tagSpacing` | `number` | `8` | Spacing between tags in pixels |

### Behavior Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `multiSelect` | `boolean` | `true` | Allow multiple tag selection |
| `allowDeselect` | `boolean` | `true` | Allow deselecting selected tags |
| `maxSelections` | `number` | `10` | Maximum number of tags that can be selected |

### State Management

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stateKey` | `string` | `"selectedTags"` | Plasmic Studio state variable name |
| `defaultSelected` | `string[]` | `[]` | Default selected tags |

### Callbacks

| Prop | Type | Description |
|------|------|-------------|
| `onSelectionChange` | `function` | Called when selection changes |
| `onTagClick` | `function` | Called when individual tag is clicked |

## 🎨 Visual Styles

### Tag Styles

- **Pill**: Rounded, modern look (default)
- **Button**: Square with rounded corners
- **Chip**: Compact, material design style
- **Badge**: Small, notification-style

### Selection Styles

- **Filled**: Solid background with white text
- **Outlined**: Transparent background with colored border
- **Highlighted**: Light background with colored text

### Sizes

- **Small**: Compact tags for dense layouts
- **Medium**: Standard size (default)
- **Large**: Prominent tags for important filters

## 📊 Data Source Examples

### 1. Static Tags (Props)

```jsx
const categories = ['Electronics', 'Clothing', 'Books'];

<TagFilter
  tagList={categories}
  tagDataSource="props"
/>
```

### 2. Page Data

```jsx
// Page data structure
const pageData = {
  products: {
    categories: ['Gaming', 'Office', 'Creative']
  }
};

<TagFilter
  tagDataSource="pageData"
  tagDataPath="products.categories"
  tagField="name"
/>
```

### 3. Query Data

```jsx
// GraphQL/CMS query result
const queryData = {
  searchResults: {
    filters: {
      tags: ['JavaScript', 'React', 'Node.js']
    }
  }
};

<TagFilter
  tagDataSource="queryData"
  tagDataPath="searchResults.filters.tags"
  tagField="name"
/>
```

### 4. CMS Data

```jsx
// CMS content data
const cmsData = {
  blogPosts: {
    tags: ['Technology', 'Design', 'Business']
  }
};

<TagFilter
  tagDataSource="cmsData"
  tagDataPath="blogPosts.tags"
  tagField="name"
/>
```

## 🔧 Plasmic Studio Integration

### 1. Add Component to Page

1. Drag and drop the `TagFilter` component onto your Plasmic Studio page
2. The component will appear with default styling

### 2. Configure Tag Data

1. **For static tags**: Set `tagList` prop with an array of strings
2. **For dynamic tags**: Choose data source and set data path
3. **For page data**: Use `tagDataSource="pageData"` and set `tagDataPath`
4. **For query data**: Use `tagDataSource="queryData"` and set `tagDataPath`

### 3. Customize Appearance

1. **Style**: Choose from pill, button, chip, or badge
2. **Size**: Select small, medium, or large
3. **Selection style**: Pick filled, outlined, or highlighted
4. **Spacing**: Adjust gap between tags

### 4. Configure Behavior

1. **Multi-select**: Enable/disable multiple selections
2. **Max selections**: Limit how many tags can be selected
3. **Deselect**: Allow/disallow deselecting tags

### 5. Connect to State

1. **Create state variable** in Plasmic Studio
2. **Set stateKey** prop to your state variable name
3. **Use selections** in other components for filtering

## 📱 Responsive Design

The component automatically adapts to different screen sizes:

- **Desktop**: Full spacing and large tags
- **Tablet**: Reduced spacing and medium tags
- **Mobile**: Compact spacing and small tags

## ♿ Accessibility Features

- **Keyboard navigation**: Use Tab, Enter, and Space keys
- **Screen reader support**: Proper ARIA labels and descriptions
- **Focus indicators**: Clear visual focus states
- **High contrast**: Works with high contrast themes

## 🎯 Use Cases

### E-commerce
- Product category filters
- Brand selection
- Price range filters
- Availability status

### Content Management
- Blog post tags
- Article categories
- Content status filters
- Author selection

### User Management
- Role-based filtering
- Permission groups
- Department filters
- Status indicators

### Search & Discovery
- Search result filters
- Faceted search
- Recommendation tags
- Popular topics

## 🔄 State Management

### Plasmic Studio State

```jsx
// The component automatically manages its own state
// You can access selected tags through:
// 1. onSelectionChange callback
// 2. Custom event: 'tag-filter-selection-change'
// 3. Plasmic Studio state variable (if stateKey is set)
```

### Event Handling

```jsx
// Listen for selection changes
window.addEventListener('tag-filter-selection-change', (event) => {
  const { selectedTags, clickedTag, stateKey } = event.detail;
  console.log('Tags changed:', selectedTags);
});
```

## 🎨 Custom Styling

### CSS Classes

The component uses these CSS classes for styling:

- `.tag-filter-container`: Main container
- `.tag-filter-tag`: Individual tag buttons
- `.tag-size-{size}`: Size variations
- `.tag-style-{style}`: Style variations
- `.tag-selected-{style}`: Selection state styles

### Custom CSS

```css
/* Override default styles */
.tag-filter-tag {
  background-color: #your-color;
  border-color: #your-border-color;
}

.tag-filter-tag.tag-selected-filled {
  background-color: #your-selected-color;
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Tags not showing**: Check data source and path configuration
2. **Selection not working**: Verify multiSelect and allowDeselect settings
3. **Styling issues**: Ensure CSS file is imported
4. **State not updating**: Check stateKey and callback configurations

### Debug Mode

Enable console logging to debug issues:

```jsx
<TagFilter
  // ... other props
  onSelectionChange={(tags, clicked) => {
    console.log('Selection changed:', tags, 'Clicked:', clicked);
  }}
/>
```

## 📚 Examples

See `examples/TagFilterExample.jsx` for comprehensive usage examples including:

- Basic static tags
- Dynamic data sources
- Different visual styles
- Behavior configurations
- Integration patterns

## 🤝 Contributing

Feel free to customize this component for your specific needs. The component is designed to be extensible and maintainable.

## 📄 License

This component is part of your project and follows the same license terms.

---

**Happy tagging! 🎉** 