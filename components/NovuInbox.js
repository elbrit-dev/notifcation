import React, { useEffect, useState } from 'react';
import { Inbox } from '@novu/nextjs';
import { useAuth } from './AuthContext';

/**
 * NovuInbox - A notification inbox component for Novu
 * 
 * Displays real-time notifications for authenticated users using their employeeId as subscriber ID.
 * 
 * ALL PROPS ARE OPTIONAL - Component works with zero props if:
 * - NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER is set in environment variables
 * - User is authenticated (gets subscriberId from AuthContext automatically)
 * - User data is available in AuthContext (builds subscriber object automatically)
 * 
 * @param {Object} props - Component props (all optional)
 * @param {string} [props.applicationIdentifier] - Novu application identifier (falls back to NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER env var)
 * @param {string} [props.subscriberId] - Subscriber ID (falls back to user.employeeId from AuthContext or localStorage)
 * @param {Object} [props.userPayload] - User payload object with firstName, lastName, email, phone, avatar, data (falls back to AuthContext user data)
 * @param {string} [props.backendUrl] - Backend URL for EU region (falls back to NEXT_PUBLIC_NOVU_BACKEND_URL env var, only needed for EU)
 * @param {string} [props.socketUrl] - Socket URL for EU region (falls back to NEXT_PUBLIC_NOVU_SOCKET_URL env var, only needed for EU)
 * @param {string} [props.className] - Additional CSS classes (default: '')
 * @param {Object} [props.style] - Inline styles (default: {})
 * @param {boolean} [props.keyless] - Use keyless mode for testing (default: false, shows demo notifications only)
 * 
 * @example
 * // Simplest usage - works with zero props if env vars and auth are set up
 * <NovuInbox />
 * 
 * @example
 * // With custom subscriber ID
 * <NovuInbox subscriberId="IN003" />
 * 
 * @example
 * // With custom user payload
 * <NovuInbox userPayload={{ firstName: 'John', email: 'john@example.com' }} />
 */
const NovuInbox = ({
  applicationIdentifier = null,
  subscriberId = null,
  userPayload = null,
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

  // Get application identifier from env or prop (SSR-safe)
  const appIdentifier = applicationIdentifier || 
    (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER : null);

  // Get subscriber ID from prop, auth context, or localStorage (SSR-safe)
  const getSubscriberId = () => {
    // Only access localStorage after mount
    if (!mounted) return null;
    
    if (subscriberId) return subscriberId;
    
    if (user) {
      // Get employeeId from user data
      const empId = user?.customProperties?.employeeId || user?.uid || user?.employeeData?.name;
      if (empId) return empId;
    }
    
    // Fallback to localStorage (only on client)
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('employeeId');
      } catch (e) {
        return null;
      }
    }
    
    return null;
  };

  const finalSubscriberId = getSubscriberId();

  // Build subscriber object with payload (SSR-safe)
  const buildSubscriberObject = () => {
    // Only build after mount to avoid hydration issues
    if (!mounted || !finalSubscriberId) return null;

    // Start with subscriberId
    const subscriber = {
      subscriberId: finalSubscriberId
    };

    // If userPayload is provided, use it directly
    if (userPayload && typeof userPayload === 'object') {
      return {
        ...subscriber,
        ...userPayload
      };
    }

    // Otherwise, build from user data if available
    if (user) {
      // Extract user data
      const firstName = user?.firstName || 
                       user?.displayName?.split(' ')[0] || 
                       user?.employeeData?.first_name || 
                       null;
      
      const lastName = user?.lastName || 
                      user?.displayName?.split(' ').slice(1).join(' ') || 
                      user?.employeeData?.last_name || 
                      null;
      
      const email = user?.email || 
                   user?.company_email || 
                   user?.employeeData?.company_email || 
                   null;
      
      const phone = user?.phoneNumber || 
                   user?.cell_number || 
                   user?.employeeData?.cell_number || 
                   null;

      // Add non-null values to subscriber
      if (firstName) subscriber.firstName = firstName;
      if (lastName) subscriber.lastName = lastName;
      if (email) subscriber.email = email;
      if (phone) subscriber.phone = phone;

      // Add avatar if available
      if (user?.photoURL) {
        subscriber.avatar = user.photoURL;
      }

      // Add custom data if available
      if (user?.customProperties || user?.employeeData) {
        subscriber.data = {
          ...(user.customProperties || {}),
          ...(user.employeeData || {})
        };
      }
    }

    return subscriber;
  };

  const subscriberObject = buildSubscriberObject();

  // Get EU region URLs from env if not provided (SSR-safe)
  const finalBackendUrl = backendUrl || 
    (mounted && typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_NOVU_BACKEND_URL : null);
  const finalSocketUrl = socketUrl || 
    (mounted && typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_NOVU_SOCKET_URL : null);


  // Don't render until mounted (client-side only)
  if (!mounted) {
    return null;
  }

  // Keyless mode for testing (shows demo notifications, not real ones)
  if (keyless) {
    console.warn('⚠️ Novu Inbox is in KEYLESS MODE - showing demo notifications only!');
    console.warn('💡 To see real notifications, disable keyless mode in Plasmic settings');
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
  if (!isAuthenticated || !finalSubscriberId || !subscriberObject) {
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

  // Render Inbox with subscriber object (includes subscriberId and user payload)
  const inboxProps = {
    applicationIdentifier: appIdentifier,
    subscriber: subscriberObject,
    ...otherProps
  };

  // Add EU region URLs if provided
  if (finalBackendUrl) {
    inboxProps.backendUrl = finalBackendUrl;
  }
  if (finalSocketUrl) {
    inboxProps.socketUrl = finalSocketUrl;
  }


  // Log subscriber info for debugging (only after mount)
  useEffect(() => {
    if (mounted && finalSubscriberId && subscriberObject) {
      console.log('📬 Novu Inbox initializing with:', {
        subscriberId: finalSubscriberId,
        applicationIdentifier: appIdentifier,
        subscriber: subscriberObject
      });
      
      // Check if subscriber exists - log warning if not
      console.log('💡 If you see 400 errors, make sure subscriber exists in Novu:');
      console.log('   Subscriber ID:', finalSubscriberId);
      console.log('   Create subscriber at: /api/novu/create-subscriber');
    }
  }, [mounted, finalSubscriberId, subscriberObject, appIdentifier]);

  // Render Inbox (component already checks mounted state above)
  return (
    <div className={className} style={style}>
      <Inbox {...inboxProps} />
    </div>
  );
};

export default NovuInbox;

