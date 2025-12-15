# NovuInbox Component

A React component that integrates Novu Inbox for displaying real-time notifications in your application.

## Installation

The component requires `@novu/nextjs` package which is already installed.

## Usage

### Basic Usage

```jsx
import NovuInbox from '@/components/NovuInbox';

function MyComponent() {
  return <NovuInbox />;
}
```

### With Custom Props

```jsx
<NovuInbox
  applicationIdentifier="your-app-id"
  subscriberId="IN002"
  className="my-inbox"
  style={{ margin: '20px' }}
/>
```

### With User Payload

Pass user information (firstName, lastName, email, phone, avatar, custom data) to Novu:

```jsx
<NovuInbox
  userPayload={{
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    avatar: 'https://example.com/avatar.jpg',
    data: {
      department: 'Engineering',
      role: 'Developer'
    }
  }}
/>
```

**Note:** If `userPayload` is not provided, the component will automatically extract user data from the AuthContext (firstName, lastName, email, phone, avatar, etc.).

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `applicationIdentifier` | string | `null` | Novu application identifier. If not provided, uses `NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER` from env |
| `subscriberId` | string | `null` | Subscriber ID. If not provided, uses employeeId from AuthContext or localStorage |
| `userPayload` | object | `null` | User payload object with `firstName`, `lastName`, `email`, `phone`, `avatar`, `data` (custom data). If not provided, automatically extracts from AuthContext user data |
| `backendUrl` | string | `null` | Backend URL for EU region. If not provided, uses `NEXT_PUBLIC_NOVU_BACKEND_URL` from env |
| `socketUrl` | string | `null` | Socket URL for EU region. If not provided, uses `NEXT_PUBLIC_NOVU_SOCKET_URL` from env |
| `className` | string | `''` | Additional CSS classes |
| `style` | object | `{}` | Inline styles |
| `keyless` | boolean | `false` | Use keyless mode for testing (temporary data, expires in 24h) |
| `...otherProps` | any | - | Any other props are passed to the underlying Inbox component |

## How It Works

1. **Subscriber ID**: The component automatically uses the employeeId from:
   - AuthContext user data (`user.customProperties.employeeId` or `user.uid`)
   - localStorage (`employeeId` key)
   - Or the `subscriberId` prop if provided

2. **User Payload**: The component passes user information to Novu:
   - If `userPayload` prop is provided, it uses that directly
   - Otherwise, it automatically extracts from AuthContext: `firstName`, `lastName`, `email`, `phone`, `avatar`, and custom `data` from `user.customProperties` or `user.employeeData`
   - The subscriber object includes both `subscriberId` and user payload data

3. **Application Identifier**: Uses:
   - The `applicationIdentifier` prop if provided
   - Or `NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER` from environment variables

4. **Authentication**: The component checks if the user is authenticated. If not, it shows a message to log in.

5. **EU Region**: If your Novu account is in the EU region, set the `backendUrl` and `socketUrl` props or environment variables.

## Environment Variables

Add these to your `.env.local` file:

```env
# Required for Inbox component
NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER=your_application_identifier_here

# Optional: EU region URLs (only if your account is in EU)
NEXT_PUBLIC_NOVU_BACKEND_URL=https://eu.api.novu.co
NEXT_PUBLIC_NOVU_SOCKET_URL=wss://eu.socket.novu.co
```

## Getting Your Application Identifier

1. Go to [Novu Dashboard](https://web.novu.co)
2. Navigate to Settings → Environments
3. Copy your Application Identifier

## Plasmic Studio Integration

This component is compatible with Plasmic Studio. You can:

1. Import it in Plasmic Studio
2. Use it in your designs
3. Configure props through Plasmic's interface
4. The component will automatically use the logged-in user's employeeId

## Example in Plasmic

```jsx
// In Plasmic Studio, you can use:
<NovuInbox 
  className="notification-inbox"
  style={{ position: 'fixed', top: '20px', right: '20px' }}
/>
```

## Keyless Mode (Testing)

For testing without setup:

```jsx
<NovuInbox keyless={true} />
```

This shows temporary data that expires in 24 hours and is not tied to real subscribers.

## Documentation

- [Novu Inbox Setup](https://docs.novu.co/platform/inbox/setup-inbox)
- [Novu Documentation](https://docs.novu.co)

