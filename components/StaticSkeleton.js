import React from 'react';
import { Skeleton } from 'primereact/skeleton';

/**
 * StaticSkeleton
 * A simple, static skeleton you can drop anywhere. No slots, minimal props.
 * Renders a title bar, two lines of text, and a rectangular block.
 */
const StaticSkeleton = ({ className = '', style = {}, animation = 'wave' }) => {
  return (
    <div className={className} style={style}>
      <div style={{ marginBottom: '0.75rem' }}>
        <Skeleton width="40%" height="1rem" animation={animation} />
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        <Skeleton width="100%" height="0.75rem" animation={animation} />
      </div>
      <div style={{ marginBottom: '0.75rem' }}>
        <Skeleton width="80%" height="0.75rem" animation={animation} />
      </div>
      <Skeleton width="100%" height="160px" animation={animation} borderRadius="8px" />
    </div>
  );
};

export default StaticSkeleton;


