# SimpleSkeleton Component

A simple skeleton loader component that wraps PrimeReact's built-in Skeleton component with force rendering capability. Perfect for creating loading states anywhere in your application with minimal complexity.

## Features

### 🎯 Core Features
- **Smart Loading State**: Automatically shows/hides based on loading prop
- **Force Rendering**: Show skeleton even when not loading (great for demos/testing)  
- **Built-in PrimeReact**: Uses PrimeReact's proven Skeleton component
- **Simple Configuration**: Just the essential props you need
- **Shape Options**: Rectangle or circle shapes
- **Size Presets**: Small, normal, large + custom dimensions

### 🎨 Customization
- **Custom Dimensions**: Set exact width and height
- **Border Radius**: Custom corner rounding for rectangles
- **Animations**: Wave, pulse, or no animation
- **Styling**: Add custom classes and inline styles

## Usage in Code

### Basic Usage
```jsx
import SimpleSkeleton from '../components/AdvancedSkeleton';

// Simple skeleton
<SimpleSkeleton loading={isLoading}>
  <p>Your content here</p>
</SimpleSkeleton>

// Circle skeleton for avatars
<SimpleSkeleton loading={isLoading} shape="circle" width="60px" height="60px">
  <img src="/avatar.jpg" style={{ borderRadius: '50%' }} />
</SimpleSkeleton>
```

### Force Rendering (Demo Mode)
```jsx
// Show skeleton for 5 seconds regardless of loading state
<SimpleSkeleton 
  loading={false}
  forceRender={true}
  forceRenderDuration={5000}
>
  <p>This content is hidden by force rendering</p>
</SimpleSkeleton>

// Infinite force rendering (until manually stopped)
<SimpleSkeleton 
  forceRender={true}
  forceRenderDuration={0}
>
  <p>Content</p>
</SimpleSkeleton>
```

### Different Sizes and Shapes
```jsx
// Predefined sizes
<SimpleSkeleton loading={isLoading} size="small">
  <span>Small content</span>
</SimpleSkeleton>

<SimpleSkeleton loading={isLoading} size="normal">
  <span>Normal content</span>
</SimpleSkeleton>

<SimpleSkeleton loading={isLoading} size="large">
  <span>Large content</span>
</SimpleSkeleton>

// Custom dimensions
<SimpleSkeleton 
  loading={isLoading}
  width="100%" 
  height="100px"
>
  <div>Custom sized content</div>
</SimpleSkeleton>
```

### Custom Styling
```jsx
// Custom animations and border radius
<SimpleSkeleton 
  loading={isLoading}
  animation="pulse"
  borderRadius="12px"
  style={{ backgroundColor: '#e3f2fd' }}
>
  <p>Custom styled content</p>
</SimpleSkeleton>

// No animation
<SimpleSkeleton 
  loading={isLoading}
  animation="none"
>
  <p>Static skeleton</p>
</SimpleSkeleton>
```

## Common Use Cases

### Loading States
```jsx
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchData().then(() => setLoading(false));
}, []);

return (
  <SimpleSkeleton loading={loading}>
    <UserProfile data={data} />
  </SimpleSkeleton>
);
```

### Demo/Storybook
```jsx
// Show skeleton for 10 seconds for demo purposes
<SimpleSkeleton 
  forceRender={true}
  forceRenderDuration={10000}
>
  <UserCard user={user} />
</SimpleSkeleton>
```

### Grid Layouts
```jsx
{products.map(product => (
  <SimpleSkeleton key={product.id} loading={!product.loaded}>
    <ProductCard product={product} />
  </SimpleSkeleton>
))}
```

## Usage in Plasmic Studio

This component is registered in Plasmic as "Simple Skeleton". All props are exposed in the Plasmic interface for easy configuration.

## Test Page

Visit `/test-skeleton` to see the component in action with interactive examples.
