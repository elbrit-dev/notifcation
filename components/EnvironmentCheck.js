import React from 'react';

export default function EnvironmentCheck() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_PLASMIC_PROJECT_ID',
    'PLASMIC_API_TOKEN',
    'PLASMIC_AUTH_SECRET',
    'NEXT_PUBLIC_AZURE_TENANT_ID'
  ];

  const checkEnvVars = () => {
    const results = {};
    
    requiredEnvVars.forEach(varName => {
      const value = process.env[varName];
      results[varName] = {
        exists: !!value,
        value: value ? (varName.includes('SECRET') || varName.includes('TOKEN') ? '***' : value) : 'NOT SET',
        length: value ? value.length : 0
      };
    });
    
    return results;
  };

  const envResults = checkEnvVars();
  const allSet = Object.values(envResults).every(result => result.exists);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', borderRadius: '8px' }}>
      <h3>Environment Variables Check</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Status: {allSet ? '✅ All Required Variables Set' : '❌ Missing Variables'}</h4>
      </div>
      
      <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px' }}>
        {Object.entries(envResults).map(([varName, result]) => (
          <div key={varName} style={{ marginBottom: '10px', fontFamily: 'monospace' }}>
            <strong>{varName}:</strong> {result.exists ? '✅' : '❌'} {result.value} 
            {result.exists && <span style={{ color: '#666' }}> (length: {result.length})</span>}
          </div>
        ))}
      </div>
      
      {!allSet && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px' }}>
          <h4>⚠️ Missing Environment Variables</h4>
          <p>Please set the following environment variables in your <code>.env.local</code> file:</p>
          <ul>
            {Object.entries(envResults)
              .filter(([_, result]) => !result.exists)
              .map(([varName, _]) => (
                <li key={varName}><code>{varName}=your_value_here</code></li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
} 