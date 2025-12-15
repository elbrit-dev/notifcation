import React from 'react';
import { Skeleton } from 'primereact/skeleton';

// Minimal rectangle skeleton. Width/height via props or style.
const RectSkeleton = ({ width = '100%', height = '1rem', borderRadius = '6px', className = '', style = {}, animation = 'wave' }) => {
  return (
    <Skeleton
      shape="rectangle"
      width={style.width ? undefined : width}
      height={style.height ? undefined : height}
      borderRadius={style.borderRadius ? undefined : borderRadius}
      animation={animation}
      className={className}
      style={style}
    />
  );
};

export default RectSkeleton;


