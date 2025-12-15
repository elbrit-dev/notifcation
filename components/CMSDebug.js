import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { usePlasmicCMS } from './utils/cmsUtils';

const CMSDebug = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [testResult, setTestResult] = useState(null);

  // Use the same CMS hook as PrimeDataTable
  const { saveToCMS, loadFromCMS, isAdminUser } = usePlasmicCMS(
    process.env.PLASMIC_WORKSPACE_ID || 'uP7RbyUnivSX75FTKL9RLp',
    process.env.PLASMIC_TABLE_CONFIGS_ID || 'o4o5VRFTDgHHmQ31fCfkuz',
    process.env.PLASMIC_API_TOKEN,
    user
  );

  const runDebugTest = async () => {
    const info = {
      user: user ? {
        email: user.email,
        role: user.role,
        roleId: user.roleId,
        id: user.id
      } : null,
      isAdmin: isAdminUser(),
      environment: {
        workspaceId: process.env.PLASMIC_WORKSPACE_ID || 'uP7RbyUnivSX75FTKL9RLp',
        tableId: process.env.PLASMIC_TABLE_CONFIGS_ID || 'o4o5VRFTDgHHmQ31fCfkuz',
        hasApiToken: !!process.env.PLASMIC_API_TOKEN,
        hasSecretToken: !!process.env.PLASMIC_CMS_SECRET_TOKEN,
        hasPublicToken: !!process.env.PLASMIC_CMS_PUBLIC_TOKEN,
        hasCmsDbId: !!process.env.PLASMIC_CMS_DATABASE_ID
      }
    };

    setDebugInfo(info);

    // Test save functionality
    try {
      const testConfig = {
        enabled: true,
        rows: ['testRow'],
        columns: ['testColumn'],
        values: [{ field: 'testValue', aggregation: 'sum' }],
        showGrandTotals: true,
        showRowTotals: true
      };

      console.log('🧪 Testing CMS save with config:', testConfig);
      const result = await saveToCMS('debug_test_config', testConfig);
      setTestResult({ success: true, result });
    } catch (error) {
      console.error('❌ CMS test failed:', error);
      setTestResult({ success: false, error: error.message });
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', borderRadius: '8px' }}>
      <h3>🔧 CMS Debug Panel</h3>
      
      <button 
        onClick={runDebugTest}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Run Debug Test
      </button>

      {Object.keys(debugInfo).length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4>Debug Information:</h4>
          <pre style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto'
          }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}

      {testResult && (
        <div style={{ marginBottom: '20px' }}>
          <h4>Test Result:</h4>
          <div style={{ 
            backgroundColor: testResult.success ? '#d4edda' : '#f8d7da',
            color: testResult.success ? '#155724' : '#721c24',
            padding: '10px',
            borderRadius: '4px',
            border: `1px solid ${testResult.success ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {testResult.success ? (
              <div>
                <strong>✅ Success!</strong>
                <pre style={{ fontSize: '12px', marginTop: '10px' }}>
                  {JSON.stringify(testResult.result, null, 2)}
                </pre>
              </div>
            ) : (
              <div>
                <strong>❌ Failed:</strong>
                <p>{testResult.error}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ fontSize: '12px', color: '#666' }}>
        <h4>Common Issues:</h4>
        <ul>
          <li><strong>Admin Role Required:</strong> User must have role ID: 6c2a85c7-116e-43b3-a4ff-db11b7858487</li>
          <li><strong>Environment Variables:</strong> Check that PLASMIC_CMS_* variables are set</li>
          <li><strong>CMS Table:</strong> TableConfigs table must exist in Plasmic CMS</li>
          <li><strong>API Tokens:</strong> Tokens must have read/write permissions</li>
        </ul>
      </div>
    </div>
  );
};

export default CMSDebug; 