import React from 'react';
import NovuInbox from './NovuInbox';

/**
 * NovuInboxWrapper - Optional wrapper component with error boundary for NovuInbox
 * 
 * This wrapper provides additional error handling specifically for the Novu Inbox component.
 * It's optional - NovuInbox can be used directly if you prefer.
 * 
 * @param {Object} props - All props are passed through to NovuInbox
 */
class NovuInboxErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      retryCount: 0
    };
    this.maxRetries = 3;
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('NovuInbox Error Boundary caught an error:', error, errorInfo);
    
    // Check if it's a hydration error
    const isHydrationError = error.message?.includes('hydration') || 
                            error.message?.includes('Hydration');
    
    if (isHydrationError) {
      console.warn('⚠️ Hydration error detected in NovuInbox. This is usually temporary.');
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState({ 
        hasError: false, 
        error: null,
        retryCount: this.state.retryCount + 1
      });
    } else {
      // Force page reload after max retries
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      const isHydrationError = this.state.error?.message?.includes('hydration') || 
                              this.state.error?.message?.includes('Hydration');
      
      return (
        <div style={{ 
          padding: '20px', 
          border: '1px solid #ff9800', 
          borderRadius: '4px', 
          backgroundColor: '#fff3e0',
          margin: '10px 0'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#e65100' }}>
            ⚠️ Notification Inbox Error
          </h4>
          <p style={{ margin: '0 0 15px 0', color: '#666' }}>
            {isHydrationError 
              ? 'The notification inbox is loading. Please wait a moment.'
              : 'There was an error loading the notification inbox.'}
          </p>
          
          {this.state.retryCount < this.maxRetries ? (
            <button 
              onClick={this.handleRetry}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry ({this.state.retryCount + 1}/{this.maxRetries})
            </button>
          ) : (
            <button 
              onClick={this.handleRetry}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * NovuInboxWrapper - Wrapped version of NovuInbox with error boundary
 * 
 * Usage:
 * ```jsx
 * import NovuInboxWrapper from '@/components/NovuInboxWrapper';
 * 
 * <NovuInboxWrapper 
 *   subscriberId="IN003"
 *   userPayload={{ email: 'user@example.com' }}
 * />
 * ```
 */
const NovuInboxWrapper = (props) => {
  return (
    <NovuInboxErrorBoundary>
      <NovuInbox {...props} />
    </NovuInboxErrorBoundary>
  );
};

export default NovuInboxWrapper;

