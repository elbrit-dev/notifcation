import React, { useEffect, useState, useMemo } from 'react';
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

  // Define tabs with filters - use useMemo at top level (before early returns)
  // Tabs: All, Approval, Appointment
  const tabs = useMemo(() => [
    {
      label: 'All',
      filter: {}, // No filter - show all notifications
    },
    {
      label: 'Approval',
      filter: {
        // Filter by data attributes in payload (recommended)
        // Include type: 'approval' or category: 'approval' in notification payload
        data: { type: 'approval' },
        // Alternative: tags: ['approval'] (requires workflow tag in Novu dashboard)
      },
    },
    {
      label: 'Appointment',
      filter: {
        // Filter by data attributes in payload (recommended)
        // Include type: 'appointment' or category: 'appointment' in notification payload
        data: { type: 'appointment' },
        // Alternative: tags: ['appointment'] (requires workflow tag in Novu dashboard)
      },
    },
  ], []); // Empty dependency array - tabs don't change

  // Ensure component only renders on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Return null during SSR to prevent hydration mismatch
  // This must come AFTER all hooks are called
  if (typeof window === 'undefined' || !mounted) {
    return null;
  }

  // Get application identifier - use static default if not provided
  // Static default: sCfOsfXhHZNc (as requested)
  const appIdentifier = applicationIdentifier || 
    (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER : null) ||
    'sCfOsfXhHZNc'; // Static default value

  // Get subscriber ID - use static default if not provided
  // Static default: IN003 (as requested)
  const getSubscriberId = () => {
    // Use prop if provided
    if (subscriberId) return subscriberId;
    
    // Try to get from user if authenticated
    if (user) {
      const empId = user?.customProperties?.employeeId || user?.uid || user?.employeeData?.name;
      if (empId) return empId;
    }
    
    // Fallback to localStorage (only on client)
    if (typeof window !== 'undefined') {
      try {
        const storedId = localStorage.getItem('employeeId');
        if (storedId) return storedId;
      } catch (e) {
        // Ignore localStorage errors
      }
    }
    
    // Static default: IN003 (works without login)
    return 'IN003';
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
    // Add tabs even in keyless mode
    keylessProps.tabs = tabs;
    
    return (
      <div className={`novu-inbox-container ${className}`} style={style}>
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

  // Build subscriber object - always create one since we have static defaults
  // This allows working without authentication
  let finalSubscriberObject = subscriberObject;
  
  // If no subscriber object built, create one with static subscriberId
  if (!finalSubscriberObject && finalSubscriberId) {
    finalSubscriberObject = {
      subscriberId: finalSubscriberId
    };
    
    // Add userPayload if provided
    if (userPayload && typeof userPayload === 'object') {
      Object.assign(finalSubscriberObject, userPayload);
    }
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
    tabs: tabs, // Add tabs: All, Approval, Appointment
    ...otherProps
  };

  // Add EU region URLs if provided
  if (finalBackendUrl) {
    inboxProps.backendUrl = finalBackendUrl;
  }
  if (finalSocketUrl) {
    inboxProps.socketUrl = finalSocketUrl;
  }

  // Log subscriber info for debugging (using direct console.log to avoid hook issues)
  if (mounted && finalSubscriberObject && typeof window !== 'undefined') {
    // Only log once per component mount
    if (!window._novuInboxLogged) {
      console.log('📬 Novu Inbox initializing with:', {
        subscriberId: finalSubscriberObject.subscriberId,
        applicationIdentifier: appIdentifier,
        subscriber: finalSubscriberObject
      });
      
      console.log('💡 If you see 400 errors, make sure subscriber exists in Novu:');
      console.log('   Subscriber ID:', finalSubscriberObject.subscriberId);
      console.log('   Create subscriber at: /api/novu/create-subscriber');
      window._novuInboxLogged = true;
    }
  }

  // Render Inbox (component already checks mounted state above)
  return (
    <div className={`novu-inbox-container ${className}`} style={style}>
      <Inbox {...inboxProps} />
    </div>
  );
};

export default NovuInbox;

