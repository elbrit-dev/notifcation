import React from 'react';
import { useAuth } from '../components/AuthContext';

export default function TestAuth() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Authentication Test Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Authentication Status</h2>
        <p><strong>Is Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Loading:</strong> {loading ? '🔄 Yes' : '✅ No'}</p>
      </div>

      {user && (
        <div style={{ marginBottom: '20px' }}>
          <h2>User Information</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>UID:</strong> {user.uid}</p>
          <p><strong>Display Name:</strong> {user.displayName}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Role Name:</strong> {user.roleName}</p>
          <p><strong>Auth Provider:</strong> {user.authProvider}</p>
          <p><strong>Phone Number:</strong> {user.phoneNumber}</p>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h2>Custom Properties</h2>
        {user?.customProperties ? (
          <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
            {JSON.stringify(user.customProperties, null, 2)}
          </pre>
        ) : (
          <p>No custom properties</p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Employee Data</h2>
        {user?.employeeData ? (
          <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
            {JSON.stringify(user.employeeData, null, 2)}
          </pre>
        ) : (
          <p>No employee data</p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Local Storage</h2>
        <p><strong>ERPNext User:</strong> {typeof window !== 'undefined' ? localStorage.getItem('erpnextUser') ? '✅ Stored' : '❌ Not stored' : 'N/A'}</p>
        <p><strong>ERPNext Token:</strong> {typeof window !== 'undefined' ? localStorage.getItem('erpnextAuthToken') ? '✅ Stored' : '❌ Not stored' : 'N/A'}</p>
        <p><strong>Phone Number:</strong> {typeof window !== 'undefined' ? localStorage.getItem('userPhoneNumber') || 'Not stored' : 'N/A'}</p>
        <p><strong>Auth Provider:</strong> {typeof window !== 'undefined' ? localStorage.getItem('authProvider') || 'Not stored' : 'N/A'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Access Test</h2>
        <p>If you can see this page, authentication is working correctly.</p>
        <p>If you have admin role, you should be able to access the /sass page.</p>
      </div>
    </div>
  );
} 