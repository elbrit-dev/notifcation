import React from 'react';
import StaticSkeleton from '../components/StaticSkeleton';

export default function TestStaticSkeleton() {
  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h1>StaticSkeleton Demo</h1>
      <p>A minimal, static skeleton you can reuse anywhere.</p>

      <div style={{ marginTop: '1.5rem' }}>
        <StaticSkeleton />
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Inside a Card-like Container</h2>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem' }}>
          <StaticSkeleton />
        </div>
      </div>
    </div>
  );
}


