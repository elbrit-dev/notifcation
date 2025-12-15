# SimpleCard Component

A versatile card component built with PrimeReact that provides a flexible container for displaying content with customizable header, body, and footer sections.

## Features

- **Flexible Layout**: Header, body, and footer sections
- **Image Support**: Header images with automatic sizing
- **Customizable Appearance**: Colors, borders, shadows, padding
- **Interactive**: Click handlers and hover effects
- **Responsive**: Works well in grid layouts
- **Slot Support**: Custom header and footer content

## Usage in Code

```jsx
import SimpleCard from '../components/SimpleCard';

// Basic card
<SimpleCard title="Card Title" subtitle="Card subtitle">
  <p>Card body content goes here</p>
</SimpleCard>

// Card with image
<SimpleCard 
  title="Product"
  headerImage="https://example.com/image.jpg"
  footer={<button>Buy Now</button>}
>
  <p>Product description</p>
</SimpleCard>

// Interactive card
<SimpleCard 
  title="Click Me"
  hoverable
  onClick={() => console.log('Clicked!')}
>
  <p>This card is clickable with hover effects</p>
</SimpleCard>

// Custom styled card
<SimpleCard 
  backgroundColor="#f0f0f0"
  borderRadius="12px"
  padding="2rem"
  width="400px"
>
  <p>Custom styled content</p>
</SimpleCard>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | "" | Card header title |
| `subtitle` | string | "" | Card header subtitle |
| `header` | ReactNode | null | Custom header content (overrides title/subtitle) |
| `footer` | ReactNode | null | Footer content |
| `children` | ReactNode | null | Card body content |
| `headerImage` | string | null | URL for header image |
| `headerImageAlt` | string | "" | Alt text for header image |
| `headerImageHeight` | string | "200px" | Height of header image |
| `shadow` | boolean | true | Show shadow/elevation |
| `bordered` | boolean | true | Show border |
| `hoverable` | boolean | false | Enable hover effects |
| `width` | string | "auto" | Card width |
| `height` | string | "auto" | Card height |
| `padding` | string | "1rem" | Body padding |
| `backgroundColor` | string | "#ffffff" | Background color |
| `borderColor` | string | "#dee2e6" | Border color |
| `borderRadius` | string | "6px" | Border radius |
| `onClick` | function | null | Click handler |
| `className` | string | "" | Additional CSS classes |
| `style` | object | {} | Inline styles |

## Common Use Cases

### Product Card
```jsx
<SimpleCard 
  title="Product Name"
  headerImage="/product.jpg"
  footer={
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>$29.99</span>
      <button>Add to Cart</button>
    </div>
  }
>
  <p>Product description...</p>
</SimpleCard>
```

### Info Card
```jsx
<SimpleCard 
  title="Information"
  backgroundColor="#e3f2fd"
  borderColor="#2196f3"
>
  <p>Important information goes here</p>
</SimpleCard>
```

### Clickable Card
```jsx
<SimpleCard 
  title="View Details"
  hoverable
  onClick={() => router.push('/details')}
  style={{ cursor: 'pointer' }}
>
  <p>Click to see more...</p>
</SimpleCard>
```

## Grid Layout Example

```jsx
<div style={{ 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
  gap: '1rem' 
}}>
  <SimpleCard title="Card 1">Content 1</SimpleCard>
  <SimpleCard title="Card 2">Content 2</SimpleCard>
  <SimpleCard title="Card 3">Content 3</SimpleCard>
</div>
```

## Usage in Plasmic Studio

This component is registered in Plasmic and can be found in the component library as "Simple Card". All props are exposed in the Plasmic UI, including slots for header, footer, and body content.

## Demo

Visit `/simple-card-demo` to see various card configurations and examples.
