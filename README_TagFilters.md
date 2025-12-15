# Tag Filter Components for Plasmic

This project includes two native UI tag filter components that can be used in Plasmic Studio:

1. **TagFilterPrimeReact** - Uses PrimeReact UI components
2. **TagFilterAntd** - Uses Ant Design UI components

Both components share the same API and behavior, making them interchangeable in your Plasmic projects.

## 🚀 Quick Start

### 1. Components are Ready to Use

The components are already registered in your Plasmic project and available in the component library.

### 2. In Plasmic Studio

1. **Drag & Drop**: Look for "Tag Filter (PrimeReact)" or "Tag Filter (Ant Design)" in your component library
2. **Configure**: Set your tag data source and visual preferences
3. **Connect**: Wire up event handlers to other components

## 📋 Component API

### Data Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tagList` | `string[]` | `[]` | Static list of tags (fallback) |
| `tagDataSource` | `'props' \| 'pageData' \| 'queryData' \| 'cmsData'` | `'props'` | Where to read tags from |
| `tagDataPath` | `string` | `''` | Path within data source (e.g., `'categories.items'`) |
| `tagField` | `string` | `'name'` | Field name for object items |

### Behavior Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `multiSelect` | `boolean` | `true` | Allow multiple selections |
| `allowDeselect` | `boolean` | `true` | Allow deselecting tags |
| `maxSelections` | `number` | `10` | Maximum selections allowed |
| `defaultSelected` | `string[]` | `[]` | Initially selected tags |
| `stateKey` | `string` | `'selectedTags'` | Key for custom events |

### Event Handlers

| Event | Description | Arguments |
|-------|-------------|-----------|
| `onSelectionChange` | Selection changes | `(selectedTags, clickedTag)` |
| `onTagClick` | Tag clicked | `(clickedTag, selectedTags)` |

### Visual Props

#### PrimeReact (`TagFilterPrimeReact`)

| Prop | Type | Options | Default |
|------|------|---------|---------|
| `display` | `choice` | `'tag'`, `'chip'`, `'button'`, `'badge'` | `'tag'` |
| `size` | `choice` | `'small'`, `'medium'`, `'large'` | `'medium'` |
| `severity` | `choice` | `'success'`, `'info'`, `'warn'`, `'danger'` | `undefined` |
| `icon` | `string` | Icon names | `null` |
| `iconPos` | `choice` | `'left'`, `'right'` | `'left'` |

#### Ant Design (`TagFilterAntd`)

| Prop | Type | Options | Default |
|------|------|---------|---------|
| `display` | `choice` | `'tag'`, `'checkable-tag'`, `'button'` | `'tag'` |
| `size` | `choice` | `'small'`, `'middle'`, `'large'` | `'middle'` |
| `type` | `choice` | `'default'`, `'primary'`, `'dashed'`, `'link'`, `'text'` | `'default'` |
| `icon` | `string` | `'check'`, `'plus'`, `'filter'`, `'tag'` | `null` |

## 🎯 Usage Examples

### Basic Static Tags

```jsx
<TagFilterPrimeReact
  tagList={['React', 'Next.js', 'Plasmic']}
  display="tag"
  multiSelect={true}
  onSelectionChange={(selected, clicked) => {
    console.log('Selected:', selected);
  }}
/>
```

### Data-Driven from CMS

```jsx
<TagFilterAntd
  tagDataSource="cmsData"
  tagDataPath="categories.items"
  tagField="name"
  display="checkable-tag"
  multiSelect={true}
  maxSelections={5}
  cmsData={yourCMSData}
/>
```

### Single Selection with Custom Styling

```jsx
<TagFilterPrimeReact
  tagList={['Option 1', 'Option 2', 'Option 3']}
  display="button"
  size="large"
  severity="info"
  multiSelect={false}
  onSelectionChange={(selected) => {
    // Only one tag can be selected
    setSelectedOption(selected[0]);
  }}
/>
```

## 🔄 Data Source Integration

### 1. Static Tags (Props)
```jsx
tagList={['Tag1', 'Tag2', 'Tag3']}
tagDataSource="props"
```

### 2. Page Data
```jsx
tagDataSource="pageData"
tagDataPath="user.preferences"
tagField="name"
pageData={pageData}
```

### 3. Query Data (GraphQL/CMS)
```jsx
tagDataSource="queryData"
tagDataPath="searchResults.filters.tags"
tagField="label"
queryData={queryData}
```

### 4. CMS Data
```jsx
tagDataSource="cmsData"
tagDataPath="categories.items"
tagField="title"
cmsData={cmsData}
```

## 🎨 Visual Modes

### PrimeReact Display Options

- **`tag`**: Standard PrimeReact Tag component
- **`chip`**: Removable chip with close button
- **`button`**: Button-style with outlined/filled states
- **`badge`**: Badge component wrapped in clickable container

### Ant Design Display Options

- **`tag`**: Standard Ant Design Tag
- **`checkable-tag`**: Built-in toggle behavior
- **`button`**: Button component with type variants

## 🎭 Event Handling

### In-Plasmic Events

Connect event handlers directly in Plasmic Studio:
- `onSelectionChange` → Update state variables
- `onTagClick` → Trigger specific actions

### Custom Browser Events

Components dispatch `tag-filter-selection-change` events:

```javascript
window.addEventListener('tag-filter-selection-change', (event) => {
  const { selectedTags, clickedTag, stateKey } = event.detail;
  console.log('Selection changed:', selectedTags);
});
```

## 🔧 Advanced Configuration

### Max Selections with Visual Feedback

```jsx
<TagFilterPrimeReact
  tagList={tags}
  multiSelect={true}
  maxSelections={3}
  display="chip"
  onSelectionChange={(selected) => {
    if (selected.length >= 3) {
      // Show "max reached" message
      showMaxSelectionMessage();
    }
  }}
/>
```

### Conditional Deselection

```jsx
<TagFilterAntd
  tagList={requiredTags}
  multiSelect={true}
  allowDeselect={false} // Prevent deselecting required tags
  display="checkable-tag"
/>
```

## 🚫 Troubleshooting

### Common Issues

1. **Tags not showing**: Check `tagDataSource` and `tagDataPath`
2. **Selection not working**: Verify `multiSelect` and `allowDeselect` settings
3. **Styling issues**: Ensure global CSS is imported in `_app.js`

### Debug Mode

Add console logs to event handlers:
```jsx
onSelectionChange={(selected, clicked) => {
  console.log('Selection:', { selected, clicked, source: 'TagFilter' });
}}
```

## 🔄 Migration Between Libraries

Since both components share the same API, you can easily swap between them:

1. **Replace component** in Plasmic Studio
2. **Adjust visual props** (PrimeReact vs Ant Design specific)
3. **Keep all other props** unchanged

## 📱 Responsive Behavior

Both components automatically:
- Wrap tags to new lines
- Maintain consistent spacing
- Work on mobile devices
- Support keyboard navigation (Enter/Space)

## 🎯 Best Practices

1. **Use appropriate display mode** for your use case
2. **Set reasonable maxSelections** to prevent UI clutter
3. **Provide meaningful stateKey** for multiple instances
4. **Handle empty states** when no tags are available
5. **Use consistent sizing** across your interface

## 🔗 Related Components

- **AdvancedTable** - Filter data with selected tags
- **PrimeDataTable** - PrimeReact table integration
- **PlasmicDataContext** - Data source management

---

## 📞 Support

For issues or questions:
1. Check the console for error messages
2. Verify component registration in `plasmic-init.js`
3. Ensure all dependencies are installed
4. Test with the example file: `examples/TagFilterExample.jsx` 