import * as React from "react";
import {
  PlasmicComponent,
  extractPlasmicQueryData,
  PlasmicRootProvider,
  DataProvider,
} from "@plasmicapp/loader-nextjs";

import Error from "next/error";
import { useRouter } from "next/router";
import { PLASMIC } from "../plasmic-init";
import { useAuth } from '../components/AuthContext';
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import PlasmicDataContext from '../components/PlasmicDataContext';
import PlasmicErrorBoundary from '../components/PlasmicErrorBoundary';

export default function PlasmicLoaderPage(props) {
  const { plasmicData, queryCache } = props;
  const router = useRouter();
  
  // Get Firebase user from AuthContext
  const { user: firebaseUser, loading: firebaseLoading } = useAuth();

  // HYDRATION FIX: Add hydration tracking - MUST BE CALLED FIRST
  const isHydratedRef = useRef(false);
  
  // HOOKS FIX: All useState hooks must be called in the same order every time
  const [plasmicUser, setPlasmicUser] = useState(null);
  const [plasmicAuthToken, setPlasmicAuthToken] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [isStable, setIsStable] = useState(false); // HYDRATION FIX: Additional stability check
  const [renderKey, setRenderKey] = useState(0); // HYDRATION FIX: Force remount on errors
  
  // HOOKS FIX: All useMemo hooks must be called in the same order every time
  const pageMeta = useMemo(() => {
    return plasmicData?.entryCompMetas?.[0] || null;
  }, [plasmicData]);

  const userContext = useMemo(() => ({
    email: firebaseUser?.email,
    uid: firebaseUser?.uid,
    isAuthenticated: !!firebaseUser,
    displayName: firebaseUser?.displayName,
    photoURL: firebaseUser?.photoURL,
    groupIds: firebaseUser?.groupIds || [],
    roles: firebaseUser?.roles || [],
    // Add roleName and roleNames for Plasmic access control
    roleName: plasmicUser?.roleName,
    roleNames: plasmicUser?.roleNames,
  }), [firebaseUser, plasmicUser]);

  const userEmail = useMemo(() => firebaseUser?.email || "", [firebaseUser?.email]);
  
  // HYDRATION FIX: All useEffect hooks must be called in the same order every time
  // HYDRATION FIX: Track hydration completion
  useEffect(() => {
    isHydratedRef.current = true;
  }, []);
  
  // HYDRATION FIX: Load ERPNext auth data from localStorage with hydration safety
  useEffect(() => {
    if (!isHydratedRef.current) return;
    
    // Defer to next tick to avoid setState during render
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('erpnextUser');
        const storedToken = localStorage.getItem('erpnextAuthToken');
        
        if (storedUser) {
          try {
            setPlasmicUser(JSON.parse(storedUser));
          } catch (error) {
            console.error('Failed to parse stored user:', error);
            localStorage.removeItem('erpnextUser');
          }
        }
        if (storedToken) setPlasmicAuthToken(storedToken);
        setAuthLoaded(true);
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  // HYDRATION FIX: Fallback auth refresh with hydration safety
  useEffect(() => {
    if (!isHydratedRef.current) return;
    
    async function refreshERPNextAuth() {
      if (
        typeof window !== 'undefined' &&
        firebaseUser &&
        (!plasmicUser || !plasmicAuthToken)
      ) {
        console.log('Refreshing ERPNext auth for Firebase user:', firebaseUser.email);
        try {
          const response = await fetch('/api/erpnext/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: firebaseUser.email,
              phoneNumber: firebaseUser.phoneNumber,
              authProvider: firebaseUser.phoneNumber ? 'phone' : 'microsoft'
            })
          });
          if (response.ok) {
            const erpnextData = await response.json();
            console.log('ERPNext auth refresh successful:', erpnextData);
            setPlasmicUser(erpnextData.user);
            setPlasmicAuthToken(erpnextData.token);
            localStorage.setItem('erpnextUser', JSON.stringify(erpnextData.user));
            localStorage.setItem('erpnextAuthToken', erpnextData.token);
            const employeeId = erpnextData?.user?.customProperties?.employeeId || erpnextData?.user?.uid || erpnextData?.user?.employeeData?.name || '';
            localStorage.setItem('employeeId', employeeId);
          } else {
            console.error('ERPNext auth refresh failed:', response.status, response.statusText);
          }
        } catch (err) {
          console.error('Failed to refresh ERPNext Auth:', err);
        }
      }
    }
    
    // HYDRATION FIX: Defer execution to avoid setState during render
    const timer = setTimeout(refreshERPNextAuth, 0);
    return () => clearTimeout(timer);
  }, [firebaseUser, plasmicUser, plasmicAuthToken]);

  // HYDRATION FIX: Stability check - ensure everything is settled before rendering Plasmic
  useEffect(() => {
    if (authLoaded && isHydratedRef.current) {
      const stabilityTimer = setTimeout(() => {
        setIsStable(true);
      }, 100); // Small delay to ensure everything is stable
      
      return () => clearTimeout(stabilityTimer);
    }
  }, [authLoaded]);

  // HYDRATION FIX: Debug logging moved to useEffect to avoid render-time execution
  useEffect(() => {
    // Only log if PLASMIC_DEBUG is set to 'true' in localStorage
    if (typeof window !== "undefined" && window.localStorage?.getItem('PLASMIC_DEBUG') === 'true') {
      console.log("🔍 Plasmic user:", plasmicUser);
      console.log("🔍 Plasmic token:", plasmicAuthToken);
      console.log("🔍 User context:", userContext);
      console.log("🔍 Auth loaded:", authLoaded);
      console.log("🔍 Is stable:", isStable);
    }
  }, [plasmicUser, plasmicAuthToken, userContext, authLoaded, isStable]);

  // HYDRATION FIX: Handle retry from error boundary
  const handleRetry = useCallback(() => {
    setRenderKey(prev => prev + 1);
  }, []);

  // HOOKS FIX: All hooks called - now we can do conditional returns
  if (!plasmicData || plasmicData.entryCompMetas.length === 0) {
    return <Error statusCode={404} />;
  }
  
  // HYDRATION FIX: Show loading state until auth is loaded and stable
  if (!authLoaded || !isStable) {
    return <div>Loading...</div>;
  }

  return (
    <PlasmicRootProvider
      loader={PLASMIC}
      prefetchedData={plasmicData}
      prefetchedQueryData={queryCache}
      // Disable Plasmic's built-in auth by not passing user/token
      // Our custom auth will handle everything
      key={`plasmic-root-${pageMeta?.displayName || 'unknown'}-${authLoaded}-${renderKey}`} // HYDRATION FIX: Force remount on auth changes and retries
    >
      {/* HYDRATION FIX: Wrap in error boundary and stability check */}
      {authLoaded && isStable && pageMeta && (
        <>
          {/* Make user data available for Plasmic Studio data queries */}
          <DataProvider 
            name="currentUser" 
            data={userContext}
            key={`user-context-${firebaseUser?.uid || 'anonymous'}-${renderKey}`} // HYDRATION FIX: Stable key with retry support
          >
            {/* Make email available as a global variable for Plasmic Studio */}
            <DataProvider 
              name="userEmail" 
              data={userEmail}
              key={`user-email-${userEmail}-${renderKey}`} // HYDRATION FIX: Stable key with retry support
            >
              {/* Set up global variables for Plasmic Studio GraphQL queries */}
              <PlasmicDataContext />
              {/* HYDRATION FIX: Wrap in error boundary to catch setState during render errors */}
              <PlasmicErrorBoundary onRetry={handleRetry}>
                <PlasmicComponent 
                  component={pageMeta.displayName}
                  key={`component-${pageMeta.displayName}-${userContext.isAuthenticated}-${renderKey}`} // HYDRATION FIX: Stable component key with retry support
                />
              </PlasmicErrorBoundary>
            </DataProvider>
          </DataProvider>
        </>
      )}
    </PlasmicRootProvider>
  );
}

export async function getStaticPaths() {
  // Pre-generate currently active Plasmic pages; serve others on-demand
  const pages = await PLASMIC.getActivePages?.();
  const paths = (pages || []).map((p) => ({
    params: {
      catchall: p.path === "/" ? [] : p.path.substring(1).split("/")
    }
  }));
  return { paths, fallback: 'blocking' };
}

export const getStaticProps = async (context) => {
  const { catchall } = context.params ?? {};
  const plasmicPath = typeof catchall === 'string' ? catchall : Array.isArray(catchall) ? `/${catchall.join('/')}` : '/';
  const plasmicData = await PLASMIC.maybeFetchComponentData(plasmicPath);
  if (!plasmicData) {
    return { notFound: true, revalidate: 60 };
  }
  const pageMeta = plasmicData.entryCompMetas[0];

  const queryCache = await extractPlasmicQueryData(
    <PlasmicRootProvider
      loader={PLASMIC}
      prefetchedData={plasmicData}
      pageRoute={pageMeta.path}
      pageParams={pageMeta.params}
    >
      <PlasmicComponent component={pageMeta.displayName} />
    </PlasmicRootProvider>
  );

  return {
    props: {
      plasmicData,
      queryCache
    },
    // ⚡ PERFORMANCE: Increase revalidate time for better caching
    // Lower revalidation = more fresh content but more server requests
    // Higher revalidation = better performance but less frequent updates
    // 300 seconds (5 min) is a good balance for most content
    revalidate: process.env.NODE_ENV === 'production' ? 300 : 60
  };
}
