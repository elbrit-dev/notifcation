import React from 'react';

class PlasmicErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0,
      lastErrorTime: null
    };
    this.retryTimeoutId = null;
    this.maxRetries = 5;
    this.retryDelay = 2000; // Start with 2 seconds
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const now = Date.now();
    
    // Log the error for debugging
    console.error('Plasmic Error Boundary caught an error:', error, errorInfo);
    
    // Check if it's a hydration or setState during render error
    const isHydrationError = error.message?.includes('setState') || 
                            error.message?.includes('hydration') ||
                            error.message?.includes('render');
    
    // Check if it's a TypeError (like the one in the console)
    const isTypeError = error instanceof TypeError;
    
    // Check specifically for the "Cannot read properties of undefined (reading 'node')" error
    const isNodePropertyError = error.message?.includes("Cannot read properties of undefined (reading 'node')");
    
    if (isHydrationError) {
      console.warn('Hydration/setState error detected. Manual recovery may be needed.');
    }
    
    if (isTypeError) {
      console.warn('TypeError detected. This might be a race condition in authentication or DOM access.');
    }
    
    if (isNodePropertyError) {
      console.warn('Node property access error detected. This is likely a DOM hydration issue.');
      // For node property errors, we want to be more aggressive with retries
      this.retryDelay = 1000; // Faster retry for DOM issues
    }
    
    // Auto-retry logic for recoverable errors
    if ((isTypeError || isNodePropertyError) && this.state.retryCount < this.maxRetries) {
      if (!this.retryTimeoutId) {
        this.retryTimeoutId = setTimeout(() => {
          console.log(`🔄 Auto-retrying after error (${this.state.retryCount + 1}/${this.maxRetries})...`);
          this.handleRetry();
        }, this.retryDelay);
      }
    }
    
    this.setState({
      error: error,
      errorInfo: errorInfo,
      retryCount: this.state.retryCount + 1,
      lastErrorTime: now
    });
  }

  componentWillUnmount() {
    // Clean up any pending timeouts
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = () => {
    // Clear any existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }
    
    // Reset the error state to retry rendering
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    // Force a re-render by updating the key prop if available
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  }

  handleForceRefresh = () => {
    // Force a complete page refresh as a last resort
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      const isNodePropertyError = this.state.error?.message?.includes("Cannot read properties of undefined (reading 'node')");
      const isTypeError = this.state.error instanceof TypeError;
      
      // Fallback UI
      return (
        <div style={{ 
          padding: '20px', 
          border: '1px solid #ff6b6b', 
          borderRadius: '4px', 
          backgroundColor: '#ffe0e0',
          margin: '10px 0',
          maxWidth: '600px'
        }}>
          <h3>⚠️ Component Error</h3>
          <p>There was an error loading this component.</p>
          
          {/* Show specific message for Node property errors */}
          {isNodePropertyError && (
            <div style={{ 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffeaa7', 
              borderRadius: '4px', 
              padding: '10px', 
              margin: '10px 0' 
            }}>
              <p><strong>DOM Access Error Detected</strong></p>
              <p>This appears to be a temporary issue with the component loading. The system will automatically retry.</p>
              <p><strong>Retry attempt:</strong> {this.state.retryCount}/{this.maxRetries}</p>
            </div>
          )}
          
          {/* Show specific message for TypeErrors */}
          {isTypeError && !isNodePropertyError && (
            <div style={{ 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffeaa7', 
              borderRadius: '4px', 
              padding: '10px', 
              margin: '10px 0' 
            }}>
              <p><strong>Authentication Error Detected</strong></p>
              <p>This might be a temporary issue with the authentication system. The page will automatically retry.</p>
              <p><strong>Retry attempt:</strong> {this.state.retryCount}/{this.maxRetries}</p>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button 
              onClick={this.handleRetry}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007acc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
            
            {this.state.retryCount >= this.maxRetries && (
              <button 
                onClick={this.handleForceRefresh}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Force Refresh
              </button>
            )}
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '15px' }}>
              <summary>Error Details (Development Only)</summary>
              <pre style={{ fontSize: '12px', overflow: 'auto', backgroundColor: '#f8f9fa', padding: '10px' }}>
                <strong>Error:</strong> {this.state.error && this.state.error.toString()}
                <br />
                <strong>Stack:</strong> {this.state.errorInfo?.componentStack}
                <br />
                <strong>Retry Count:</strong> {this.state.retryCount}
                <br />
                <strong>Last Error Time:</strong> {this.state.lastErrorTime ? new Date(this.state.lastErrorTime).toLocaleString() : 'N/A'}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default PlasmicErrorBoundary; 