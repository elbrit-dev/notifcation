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
  // CRITICAL: Always call hooks first (React rules)
  const { user, isAuthenticated, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Ensure component only renders on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Return null during SSR to prevent hydration mismatch
  // This must come AFTER all hooks are called
  if (typeof window === 'undefined' || !mounted) {
    return null;
  }

  // Get application identifier from env or prop (only after client check)
  const appIdentifier = applicationIdentifier || 
    (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER : null);

  // Get subscriber ID from prop, auth context, or localStorage (client-only)
  const getSubscriberId = () => {
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

  // Build subscriber object with payload (client-only)
  const buildSubscriberObject = () => {
    if (!finalSubscriberId) return null;

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

  // Get EU region URLs from env if not provided (client-only)
  const finalBackendUrl = backendUrl || 
    (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_NOVU_BACKEND_URL : null);
  const finalSocketUrl = socketUrl || 
    (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_NOVU_SOCKET_URL : null);

  // Keyless mode for testing (shows demo notifications, not real ones)
  // In keyless mode, we don't require authentication or subscriber
  if (keyless) {
    console.warn('⚠️ Novu Inbox is in KEYLESS MODE - showing demo notifications only!');
    console.warn('💡 To see real notifications, disable keyless mode in Plasmic settings');
    
    // Build keyless props - still pass applicationIdentifier if available for better demo
    const keylessProps = {
      ...otherProps
    };
    
    // If application identifier is available, pass it (optional for keyless mode)
    if (appIdentifier) {
      keylessProps.applicationIdentifier = appIdentifier;
    }
    
    // Add EU region URLs if provided
    if (finalBackendUrl) {
      keylessProps.backendUrl = finalBackendUrl;
    }
    if (finalSocketUrl) {
      keylessProps.socketUrl = finalSocketUrl;
    }
    
    // Keyless mode: No subscriber required, shows demo notifications
    return (
      <div className={className} style={style}>
        <Inbox {...keylessProps} />
      </div>
    );
  }

  // REAL-TIME NOTIFICATIONS MODE (keyless = false)
  // When keyless is disabled, we use real subscriber data for live notifications
  // This requires: authentication, subscriber ID, and application identifier

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

  // If subscriberId is provided as prop, allow bypassing authentication check
  // This allows using static subscriberId (like "IN003") without requiring login
  const hasStaticSubscriberId = subscriberId && subscriberId.trim() !== '';
  
  // Build subscriber object - use static values if provided, otherwise require auth
  let finalSubscriberObject = subscriberObject;
  
  // If static subscriberId provided but no subscriber object, create one
  if (hasStaticSubscriberId && !finalSubscriberObject) {
    finalSubscriberObject = {
      subscriberId: subscriberId
    };
    
    // Add userPayload if provided
    if (userPayload && typeof userPayload === 'object') {
      Object.assign(finalSubscriberObject, userPayload);
    }
  }
  
  // If no subscriber object and no static subscriberId, require authentication
  if (!finalSubscriberObject && !hasStaticSubscriberId) {
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
  
  // Must have subscriber object to proceed
  if (!finalSubscriberObject) {
    return (
      <div className={className} style={style}>
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          Subscriber ID is required.
        </div>
      </div>
    );
  }

  // Render Inbox with subscriber object for REAL-TIME NOTIFICATIONS
  // This passes the actual subscriber data to Novu for live notifications
  const inboxProps = {
    applicationIdentifier: appIdentifier,
    subscriber: finalSubscriberObject, // Subscriber with ID (from auth or static prop)
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
    if (mounted && finalSubscriberObject) {
      console.log('📬 Novu Inbox initializing with:', {
        subscriberId: finalSubscriberObject.subscriberId,
        applicationIdentifier: appIdentifier,
        subscriber: finalSubscriberObject,
        usingStaticValues: hasStaticSubscriberId
      });
      
      // Check if subscriber exists - log warning if not
      console.log('💡 If you see 400 errors, make sure subscriber exists in Novu:');
      console.log('   Subscriber ID:', finalSubscriberObject.subscriberId);
      console.log('   Create subscriber at: /api/novu/create-subscriber');
    }
  }, [mounted, finalSubscriberObject, appIdentifier, hasStaticSubscriberId]);

  // Render Inbox (component already checks mounted state above)
  return (
    <div className={className} style={style}>
      <Inbox {...inboxProps} />
    </div>
  );
};

export default NovuInbox;

