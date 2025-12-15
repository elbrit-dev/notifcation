import React, { useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { isDOMReady, waitForDOMReady } from '../utils/domUtils';

/**
 * This component is responsible for exposing user data to Plasmic Studio
 * for use in GraphQL queries and other data operations.
 * 
 * It doesn't render anything visible but sets up global variables
 * that can be used in Plasmic Studio's data queries.
 */
// HYDRATION FIX: Memoize component to prevent unnecessary re-renders
const PlasmicDataContext = React.memo(function PlasmicDataContext() {
  const { user, loading, isAuthenticated } = useAuth();
  const isInitializedRef = useRef(false);
  const dataSetRef = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const isHydratedRef = useRef(false);
  
  // HYDRATION FIX: Track hydration completion
  useEffect(() => {
    isHydratedRef.current = true;
  }, []);
  
  useEffect(() => {
    // HYDRATION FIX: Additional safeguards to prevent setState during render
    if (loading || isInitializedRef.current || !isHydratedRef.current) return;
    
    // HYDRATION FIX: Multiple delays to ensure complete stability
    const timer1 = setTimeout(async () => {
      if (typeof window !== 'undefined' && !dataSetRef.current) {
        try {
          // HYDRATION FIX: Use DOM utility to check if window is fully available
          if (!isDOMReady()) {
            console.warn('Document not ready, waiting for DOM...');
            const domReady = await waitForDOMReady(3000); // Wait up to 3 seconds
            if (!domReady) {
              console.warn('DOM ready timeout, deferring Plasmic data context setup');
              return;
            }
          }
          
          // Set global variables for Plasmic Studio to use in GraphQL queries
          window.PLASMIC_DATA = {
            // User information
            user: {
              email: user?.email || '',
              uid: user?.uid || '',
              displayName: user?.displayName || '',
              isAuthenticated: !!user,
              role: user?.role || '',
              roleName: user?.roleName || '',
              customProperties: user?.customProperties || {}
            },
            
            // Role information from Plasmic custom auth
            userRole: user?.role || '',
            userRoleName: user?.roleName || '',
            userCustomProperties: user?.customProperties || {}
          };
          
          dataSetRef.current = true;
          retryCountRef.current = 0; // Reset retry count on success
          
          // HYDRATION FIX: Dispatch event with even more delay
          const timer2 = setTimeout(() => {
            if (typeof window !== 'undefined' && window.PLASMIC_DATA) {
              try {
                // HYDRATION FIX: Additional check for document readiness using utility
                if (!isDOMReady()) {
                  console.warn('Document still not ready for event dispatch');
                  return;
                }
                
                const event = new CustomEvent('plasmic-data-ready', { 
                  detail: { 
                    user: window.PLASMIC_DATA.user,
                    timestamp: new Date().toISOString()
                  } 
                });
                window.dispatchEvent(event);
                console.log('✅ Plasmic data context initialized successfully');
              } catch (error) {
                console.warn('Failed to dispatch plasmic-data-ready event:', error);
              }
            }
          }, 200); // Longer delay
          
          return () => clearTimeout(timer2);
        } catch (error) {
          console.error('❌ Error setting up Plasmic data context:', error);
          
          // Retry logic for transient errors
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            console.log(`🔄 Retrying Plasmic data context setup (${retryCountRef.current}/${maxRetries})`);
            setTimeout(() => {
              dataSetRef.current = false; // Reset to allow retry
              isInitializedRef.current = false; // Reset initialization flag
            }, 1000 * retryCountRef.current); // Exponential backoff
          } else {
            console.error('❌ Max retries reached for Plasmic data context setup');
          }
        }
      }
    }, 150); // Longer initial delay
    
    isInitializedRef.current = true;
    
    return () => {
      clearTimeout(timer1);
    };
  }, [user, isAuthenticated, loading]);
  
  // This component doesn't render anything visible
  return null;
});

export default PlasmicDataContext; 