import React from 'react';
import RectSkeleton from '../components/RectSkeleton';
import CircleSkeleton from '../components/CircleSkeleton';

export default function TestBasicSkeletons() {
  return (
    <div style={{ padding: '2rem', display: 'grid', gap: '1.5rem', maxWidth: 800, margin: '0 auto' }}>
      <h1>Basic Skeletons</h1>

      <section>
        <h2>Rectangle</h2>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <RectSkeleton width="100%" height="1rem" />
          <RectSkeleton width="80%" height="0.75rem" />
          <RectSkeleton width="100%" height="160px" borderRadius="8px" />
        </div>
      </section>

      <section>
        <h2>Circle</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <CircleSkeleton size="2rem" />
          <CircleSkeleton size="3rem" />
          <CircleSkeleton size="4rem" />
        </div>
      </section>
    </div>
  );
}


