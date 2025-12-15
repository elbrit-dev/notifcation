# SimpleButton Component

A versatile and customizable button component built with PrimeReact that can be used both in Plasmic Studio and directly in your React code.

## Features

- **Multiple Styles**: Primary, Secondary, Success, Info, Warning, Danger, Help
- **Size Options**: Small, Normal, Large
- **Button Variants**: Outlined, Rounded, Text-only, Raised
- **Icons Support**: Add icons with customizable position
- **Loading State**: Built-in loading spinner
- **Badges**: Display notification badges
- **Tooltips**: Hover tooltips for additional information
- **Fully Customizable**: Custom classes and inline styles

## Usage in Code

```jsx
import SimpleButton from '../components/SimpleButton';

// Basic usage
<SimpleButton label="Click Me" onClick={handleClick} />

// With icon
<SimpleButton 
  label="Save" 
  icon="pi pi-save" 
  severity="success"
/>

// Loading state
<SimpleButton 
  label="Submit" 
  loading={isLoading}
  onClick={handleSubmit}
/>

// With badge and tooltip
<SimpleButton 
  label="Notifications" 
  badge="5"
  tooltip="You have 5 new notifications"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | "Click Me" | Button text |
| `icon` | string | null | Icon class (e.g., 'pi pi-check') |
| `iconPos` | "left" \| "right" | "left" | Icon position |
| `severity` | string | "primary" | Color theme |
| `size` | "small" \| "normal" \| "large" | "normal" | Button size |
| `outlined` | boolean | false | Outlined style |
| `rounded` | boolean | false | Rounded corners |
| `text` | boolean | false | Text-only style |
| `raised` | boolean | false | Shadow/elevation |
| `loading` | boolean | false | Show loading spinner |
| `disabled` | boolean | false | Disable button |
| `tooltip` | string | "" | Tooltip text |
| `badge` | string | null | Badge value |
| `badgeClass` | string | "p-badge-danger" | Badge color class |
| `onClick` | function | () => {} | Click handler |
| `className` | string | "" | Additional CSS classes |
| `style` | object | {} | Inline styles |

## Icon Examples

Common PrimeReact icons you can use:
- `pi pi-check` - Checkmark
- `pi pi-times` - Close/X
- `pi pi-save` - Save
- `pi pi-trash` - Delete
- `pi pi-user` - User
- `pi pi-heart` - Heart
- `pi pi-star` - Star
- `pi pi-search` - Search
- `pi pi-arrow-right` - Arrow right
- `pi pi-download` - Download
- `pi pi-upload` - Upload
- `pi pi-refresh` - Refresh

## Usage in Plasmic Studio

This component is registered in Plasmic and can be found in the component library as "Simple Button". All props are exposed in the Plasmic UI for easy configuration.

## Demo

Visit `/simple-button-demo` to see all button variants and features in action.
