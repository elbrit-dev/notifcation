# LinkComponent

A React component that wraps the native Next.js `Link` component with a slot pattern for children content.

## Features

- **Slot Pattern**: Uses a children slot for flexible content placement
- **Native Link Integration**: Wraps Next.js Link component for optimal performance
- **Customizable Styling**: Supports custom CSS classes and inline styles
- **Accessibility**: Includes proper focus states and keyboard navigation
- **TypeScript Ready**: Full TypeScript support with proper prop types

## Usage

### Basic Usage

```jsx
import LinkComponent from './components/LinkComponent';

<LinkComponent href="/dashboard">
  Dashboard
</LinkComponent>
```

### With Custom Styling

```jsx
<LinkComponent 
  href="/profile" 
  className="nested"
  style={{ color: '#8b5cf6' }}
>
  User Profile
</LinkComponent>
```

### With Icons and Complex Content

```jsx
<LinkComponent href="/settings">
  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <span style={{ 
      width: '16px', 
      height: '16px', 
      backgroundColor: '#8b5cf6', 
      borderRadius: '50%',
      display: 'inline-block'
    }}></span>
    Settings
  </span>
</LinkComponent>
```

### External Links

```jsx
<LinkComponent 
  href="https://example.com" 
  target="_blank"
  rel="noopener noreferrer"
>
  External Website
</LinkComponent>
```

### With Click Handlers

```jsx
<LinkComponent 
  href="#" 
  onClick={(e) => {
    e.preventDefault();
    // Handle click
  }}
>
  Click Me
</LinkComponent>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | Required | The URL to navigate to |
| `children` | `ReactNode` | - | Content to render inside the link |
| `className` | `string` | `''` | Additional CSS classes |
| `target` | `string` | `'_self'` | Link target attribute |
| `rel` | `string` | `''` | Link rel attribute |
| `onClick` | `function` | - | Click event handler |
| `...props` | `any` | - | Additional props passed to Next.js Link |

## CSS Classes

The component uses the following CSS classes for styling:

- `.link-component`: Main container wrapper
- `.link-slot`: Inner content slot
- `.nested`: For nested/hierarchical display
- `.active`: For active/current page state

## Styling

Import the CSS file in your component:

```jsx
import '../styles/LinkComponent.css';
```

Or include it in your global styles:

```css
@import './styles/LinkComponent.css';
```

## Examples

See `LinkComponentExample.js` for complete usage examples.

## Structure

The component follows the layout structure shown in the design:

```
Layout
└── Slot: "children"
```

This provides a consistent interface for navigation links with flexible content placement through the children slot pattern. 