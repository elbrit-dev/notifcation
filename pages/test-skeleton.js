import React, { useState } from 'react';
import SimpleSkeleton from '../components/AdvancedSkeleton';
import SimpleButton from '../components/SimpleButton';

export default function TestSkeleton() {
  const [loading, setLoading] = useState(true);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>SimpleSkeleton Test</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <SimpleButton 
          label={loading ? "Stop Loading" : "Start Loading"} 
          onClick={() => setLoading(!loading)}
        />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Basic Test</h2>
        <SimpleSkeleton loading={loading}>
          <p>This is the actual content that should appear when loading is false.</p>
        </SimpleSkeleton>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Force Render Test</h2>
        <SimpleSkeleton 
          loading={false}
          forceRender={true}
          forceRenderDuration={5000}
        >
          <p>This content should be hidden by force rendering for 5 seconds.</p>
        </SimpleSkeleton>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Circle Shape</h2>
        <SimpleSkeleton 
          loading={loading}
          shape="circle"
          width="60px"
          height="60px"
        >
          <img src="https://via.placeholder.com/60" alt="Avatar" style={{ borderRadius: '50%' }} />
        </SimpleSkeleton>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Different Sizes</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <SimpleSkeleton loading={loading} size="small">
            <span>Small text</span>
          </SimpleSkeleton>
          <SimpleSkeleton loading={loading} size="normal">
            <span>Normal text</span>
          </SimpleSkeleton>
          <SimpleSkeleton loading={loading} size="large">
            <span>Large text</span>
          </SimpleSkeleton>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Custom Dimensions</h2>
        <SimpleSkeleton 
          loading={loading}
          width="100%"
          height="100px"
        >
          <div style={{ width: '100%', height: '100px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Custom content area
          </div>
        </SimpleSkeleton>
      </div>
    </div>
  );
}
