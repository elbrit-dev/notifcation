import React, { useState } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

export default function FirestoreDebug() {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, firebaseUser } = useAuth();

  const testFirestoreConnection = async () => {
    setLoading(true);
    setTestResult('Testing Firestore connection...\n');
    
    try {
      console.log('Firestore instance:', db);
      setTestResult(prev => prev + '✅ Firestore instance created\n');
      
      // Test reading from a collection
      const testCollection = collection(db, 'test');
      console.log('Test collection reference created:', testCollection);
      setTestResult(prev => prev + '✅ Test collection reference created\n');
      
      // Test writing a document
      const testDoc = doc(db, 'test', 'connection-test');
      await setDoc(testDoc, {
        timestamp: new Date().toISOString(),
        message: 'Firestore connection test successful',
        user: user?.email || 'unknown'
      });
      console.log('Test document written successfully');
      setTestResult(prev => prev + '✅ Test document written successfully\n');
      
      // Test reading the document back
      const testDocs = await getDocs(testCollection);
      console.log('Test documents read:', testDocs.size);
      setTestResult(prev => prev + `✅ Test documents read: ${testDocs.size}\n`);
      
      setTestResult(prev => prev + '\n🎉 Firestore connection test PASSED!\n');
      
    } catch (error) {
      console.error('Firestore test failed:', error);
      setTestResult(prev => prev + `❌ Firestore test failed: ${error.message}\n`);
      setTestResult(prev => prev + `Error code: ${error.code}\n`);
      setTestResult(prev => prev + `Error details: ${JSON.stringify(error, null, 2)}\n`);
    } finally {
      setLoading(false);
    }
  };

  const testUserCreation = async () => {
    if (!firebaseUser) {
      setTestResult('❌ No Firebase user available for testing');
      return;
    }
    
    setLoading(true);
    setTestResult('Testing user creation...\n');
    
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      
      const testUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || 'Test User',
        role: 'Test',
        createdAt: new Date().toISOString(),
        testFlag: true
      };
      
      await setDoc(userRef, testUser);
      console.log('Test user created successfully');
      setTestResult(prev => prev + '✅ Test user created successfully\n');
      
    } catch (error) {
      console.error('User creation test failed:', error);
      setTestResult(prev => prev + `❌ User creation test failed: ${error.message}\n`);
      setTestResult(prev => prev + `Error code: ${error.code}\n`);
    } finally {
      setLoading(false);
    }
  };

  const testServerSideFirestore = async () => {
    setLoading(true);
    setTestResult('Testing server-side Firestore...\n');
    
    try {
      const response = await fetch('/api/test-firestore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('Server-side Firestore test successful:', result);
        setTestResult(prev => prev + '✅ Server-side Firestore test PASSED\n');
        setTestResult(prev => prev + `Message: ${result.message}\n`);
        setTestResult(prev => prev + `Timestamp: ${result.timestamp}\n`);
      } else {
        console.error('Server-side Firestore test failed:', result);
        setTestResult(prev => prev + `❌ Server-side Firestore test FAILED\n`);
        setTestResult(prev => prev + `Error: ${result.error}\n`);
        setTestResult(prev => prev + `Code: ${result.code}\n`);
      }
      
    } catch (error) {
      console.error('Server-side Firestore test error:', error);
      setTestResult(prev => prev + `❌ Server-side Firestore test error: ${error.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', borderRadius: '8px' }}>
      <h3>Firestore Debug Panel</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Current State:</h4>
        <p><strong>Firebase User:</strong> {firebaseUser ? firebaseUser.email : 'None'}</p>
        <p><strong>Auth User:</strong> {user ? user.email : 'None'}</p>
        <p><strong>User UID:</strong> {firebaseUser ? firebaseUser.uid : 'None'}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testFirestoreConnection}
          disabled={loading}
          style={{ marginRight: '10px', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {loading ? 'Testing...' : 'Test Client Firestore'}
        </button>
        
        <button 
          onClick={testServerSideFirestore}
          disabled={loading}
          style={{ marginRight: '10px', padding: '10px', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {loading ? 'Testing...' : 'Test Server Firestore'}
        </button>
        
        <button 
          onClick={testUserCreation}
          disabled={loading || !firebaseUser}
          style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {loading ? 'Testing...' : 'Test User Creation'}
        </button>
      </div>
      
      <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
        {testResult || 'Click a test button to start debugging...'}
      </div>
    </div>
  );
} 