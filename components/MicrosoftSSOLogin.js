import React, { useEffect, useRef, useState } from "react";
import app from "../firebase"; // now using compat app
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

// Dynamically import FirebaseUI to avoid SSR issues
const FirebaseUIComponent = ({ onSuccess, onError }) => {
  const uiRef = useRef(null);
  const containerRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // If auth data already exists in localStorage, skip initializing FirebaseUI
    try {
      const storedUser = localStorage.getItem('erpnextUser');
      const storedToken = localStorage.getItem('erpnextAuthToken');
      const storedAuthType = localStorage.getItem('authType');
      if (storedUser && storedToken && (storedAuthType === 'erpnext' || !storedAuthType)) {
        // Let parent or global auth handler decide navigation to avoid double route changes
        if (onSuccess) onSuccess({ bypass: true });
        return; // Do not initialize FirebaseUI
      }
    } catch (e) {
      // If localStorage isn't accessible, proceed with login UI
      // eslint-disable-next-line no-console
      console.warn('Unable to read localStorage for auth bypass; showing login UI.', e);
    }

    const initializeFirebaseUI = async () => {
      const auth = app.auth(); // using compat auth

      const firebaseui = await import('firebaseui');
      await import('firebaseui/dist/firebaseui.css');

      uiRef.current = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);

      const uiConfig = {
        signInOptions: [
          {
            provider: 'microsoft.com',
            customParameters: {
              tenant: process.env.NEXT_PUBLIC_AZURE_TENANT_ID
            }
          },
          {
            provider: 'phone',
            recaptchaParameters: {
              type: 'image',
              size: 'normal',
              badge: 'bottomleft'
            },
            defaultCountry: 'IN'
          }
        ],
        signInFlow: 'popup',
          callbacks: {
          signInSuccessWithAuthResult: (authResult, redirectUrl) => {
            console.log('Login successful:', authResult.user.phoneNumber || authResult.user.email);
            // Defer onSuccess to avoid racing with UI teardown and route changes
            if (onSuccess) setTimeout(() => onSuccess({ firebaseUser: authResult.user }), 0);
            return false; // Prevent redirect
          },
          signInFailure: (error) => {
            console.error('Login failed:', error.code, error.message);
            if (error.code === 'auth/timeout') {
              alert('Phone verification timed out. Please retry.');
            }
            if (onError) onError(error);
            return Promise.resolve();
          },
          uiShown: () => {
            console.log('FirebaseUI is ready');
          }
        }
      };

      uiRef.current.start(containerRef.current, uiConfig);

      return () => {
        if (uiRef.current) {
          uiRef.current.reset();
        }
      };
    };

    initializeFirebaseUI();
  }, [isClient, onSuccess, onError]);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div ref={containerRef}></div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(FirebaseUIComponent), {
  ssr: false,
  loading: () => <div>Loading authentication...</div>
});
