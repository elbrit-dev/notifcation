import React, { useEffect, useState } from 'react';
import { Inbox } from '@novu/nextjs';
import { useAuth } from './AuthContext';

/**
 * NovuInbox - A notification inbox component for Novu
 * 
 * Displays real-time notifications for authenticated users using their employeeId as subscriber ID.
 * 
 * @param {Object} props - Component props
 * @param {string} props.applicationIdentifier - Novu application identifier (optional, uses env if not provided)
 * @param {string} props.subscriberId - Subscriber ID (optional, uses employeeId from auth if not provided)
 * @param {string} props.backendUrl - Backend URL for EU region (optional)
 * @param {string} props.socketUrl - Socket URL for EU region (optional)
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles
 * @param {boolean} props.keyless - Use keyless mode for testing (default: false)
 */
const NovuInbox = ({
  applicationIdentifier = null,
  subscriberId = null,
  backendUrl = null,
  socketUrl = null,
  className = '',
  style = {},
  keyless = false,
  ...otherProps
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Ensure component only renders on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get application identifier from env or prop
  const appIdentifier = applicationIdentifier || 
    (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER : null);

  // Get subscriber ID from prop, auth context, or localStorage
  const getSubscriberId = () => {
    if (subscriberId) return subscriberId;
    
    if (user) {
      // Get employeeId from user data
      const empId = user?.customProperties?.employeeId || user?.uid || user?.employeeData?.name;
      if (empId) return empId;
    }
    
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('employeeId');
    }
    
    return null;
  };

  const finalSubscriberId = getSubscriberId();

  // Get EU region URLs from env if not provided
  const finalBackendUrl = backendUrl || 
    (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_NOVU_BACKEND_URL : null);
  const finalSocketUrl = socketUrl || 
    (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_NOVU_SOCKET_URL : null);

  // Don't render until mounted (client-side only)
  if (!mounted) {
    return null;
  }

  // Keyless mode for testing
  if (keyless) {
    return (
      <div className={className} style={style}>
        <Inbox {...otherProps} />
      </div>
    );
  }

  // If no application identifier, show message
  if (!appIdentifier) {
    return (
      <div className={className} style={style}>
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          ⚠️ Novu Application Identifier not configured. 
          <br />
          Please set NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER in your environment variables.
        </div>
      </div>
    );
  }

  // If not authenticated or no subscriber ID, show message
  if (!isAuthenticated || !finalSubscriberId) {
    if (loading) {
      return (
        <div className={className} style={style}>
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            Loading notifications...
          </div>
        </div>
      );
    }
    
    return (
      <div className={className} style={style}>
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          Please log in to view notifications.
        </div>
      </div>
    );
  }

  // Render Inbox with subscriber ID
  const inboxProps = {
    applicationIdentifier: appIdentifier,
    subscriber: finalSubscriberId,
    ...otherProps
  };

  // Add EU region URLs if provided
  if (finalBackendUrl) {
    inboxProps.backendUrl = finalBackendUrl;
  }
  if (finalSocketUrl) {
    inboxProps.socketUrl = finalSocketUrl;
  }

  return (
    <div className={className} style={style}>
      <Inbox {...inboxProps} />
    </div>
  );
};

export default NovuInbox;

