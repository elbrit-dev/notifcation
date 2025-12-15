import React from 'react';
import { Skeleton } from 'primereact/skeleton';

// Minimal circle skeleton. Size via props or style.
const CircleSkeleton = ({ size = '3rem', className = '', style = {}, animation = 'wave' }) => {
  const side = style.width || style.height ? undefined : size;
  return (
    <Skeleton
      shape="circle"
      width={side}
      height={side}
      animation={animation}
      className={className}
      style={style}
    />
  );
};

export default CircleSkeleton;


