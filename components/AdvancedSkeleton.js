import React, { useState, useEffect, useRef } from 'react';
import { Skeleton } from 'primereact/skeleton';

/**
 * SimpleSkeleton - Full-featured wrapper around PrimeReact Skeleton
 * Supports: shape, size, width, height, borderRadius, animation, and simple presets (card, list, datatable, avatar-text, text)
 * Docs: https://primereact.org/skeleton/
 */
const SimpleSkeleton = ({
  // Core
  loading = true,
  children = null,
  // Force render for demos
  forceRender = false,
  forceRenderDuration = 5000,
  // PrimeReact Skeleton API
  shape = 'rectangle', // 'rectangle' | 'rounded' | 'square' | 'circle'
  size = null,         // e.g., '2rem' for square/circle; also accepts tokens 'small'|'normal'|'large'
  width = null,        // e.g., '100%', '10rem', '150px'
  height = null,       // e.g., '2rem', '4rem', '150px'
  borderRadius = '6px',
  animation = 'wave',  // 'wave' | 'pulse' | 'none'
  // Presets
  template = null,     // null | 'paragraph' | 'text' | 'card' | 'list' | 'datatable' | 'avatar-text'
  lines = 1,           // used by text/list/datatable presets
  // Styling
  className = '',
  style = {},
  ...otherProps
}) => {
  const [showSkeleton, setShowSkeleton] = useState(loading || forceRender);
  const timeoutRef = useRef(null);

  // Handle force rendering window
  useEffect(() => {
    if (forceRender) {
      setShowSkeleton(true);
      if (forceRenderDuration > 0) {
        timeoutRef.current = setTimeout(() => {
          setShowSkeleton(loading);
        }, forceRenderDuration);
      }
    } else {
      setShowSkeleton(loading);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [loading, forceRender, forceRenderDuration]);

  // Resolve dimensions per PrimeReact docs: https://primereact.org/skeleton/
  // Tokens for convenience; props always take precedence
  const tokenHeights = { small: '16px', normal: '20px', large: '24px' };
  const tokenSquares = { small: '2rem', normal: '3rem', large: '4rem' };
  const isToken = ['small','normal','large'].includes(size);
  const isCssSize = typeof size === 'string' && /\d/.test(size) && !isToken;

  let finalWidth;
  let finalHeight;
  if (shape === 'circle' || shape === 'square') {
    // Single side length: prefer size, then width/height, then token default, then sensible fallback
    const side = (
      isCssSize ? size :
      (isToken ? tokenSquares[size] : null) ||
      width || height || '3rem'
    );
    finalWidth = side;
    finalHeight = side;
  } else {
    // rectangle or rounded
    finalWidth = width || '100%';
    finalHeight = height || (isCssSize ? size : (isToken ? tokenHeights[size] : '20px'));
  }

  // Border radius handling
  const finalRadius = shape === 'circle' ? '50%' : (shape === 'rounded' ? (borderRadius || '16px') : borderRadius);
  const primeShape = shape === 'circle' ? 'circle' : 'rectangle';

  // Single skeleton renderer
  const renderSkeleton = (extraProps = {}) => {
    const widthProp = style && style.width ? undefined : (primeShape === 'circle' ? finalHeight : finalWidth);
    const heightProp = style && style.height ? undefined : finalHeight;
    const radiusProp = style && style.borderRadius ? undefined : finalRadius;
    return (
      <Skeleton
        shape={primeShape}
        width={widthProp}
        height={heightProp}
        animation={animation}
        borderRadius={radiusProp}
        className={className}
        style={style}
        {...otherProps}
        {...extraProps}
      />
    );
  };

  // Preset templates based on PrimeReact docs examples
  const renderTemplate = () => {
    switch (template) {
      case 'card':
        return (
          <div className="border-round border-1 surface-border p-4 surface-card">
            <div className="flex mb-3">
              <Skeleton shape="circle" size="4rem" className="mr-2" animation={animation} />
              <div>
                <Skeleton width="10rem" className="mb-2" animation={animation} borderRadius={borderRadius} />
                <Skeleton width="5rem" className="mb-2" animation={animation} borderRadius={borderRadius} />
                <Skeleton height=".5rem" animation={animation} borderRadius={borderRadius} />
              </div>
            </div>
            <Skeleton width="100%" height="150px" animation={animation} borderRadius={borderRadius} />
            <div className="flex justify-content-between mt-3">
              <Skeleton width="4rem" height="2rem" animation={animation} borderRadius={borderRadius} />
              <Skeleton width="4rem" height="2rem" animation={animation} borderRadius={borderRadius} />
            </div>
          </div>
        );
      case 'list':
        return (
          <div className="border-round border-1 surface-border p-4">
            <ul className="m-0 p-0 list-none">
              {Array.from({ length: lines || 4 }, (_, i) => (
                <li key={i} className={i < (lines || 4) - 1 ? 'mb-3' : ''}>
                  <div className="flex">
                    <Skeleton shape="circle" size="4rem" className="mr-2" animation={animation} />
                    <div style={{ flex: 1 }}>
                      <Skeleton width="100%" className="mb-2" animation={animation} borderRadius={borderRadius} />
                      <Skeleton width="75%" animation={animation} borderRadius={borderRadius} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'datatable':
        return (
          <div>
            {Array.from({ length: lines || 5 }, (_, i) => (
              <div key={i} className="flex mb-2">
                <Skeleton width="25%" className="mr-2" animation={animation} borderRadius={borderRadius} />
                <Skeleton width="25%" className="mr-2" animation={animation} borderRadius={borderRadius} />
                <Skeleton width="25%" className="mr-2" animation={animation} borderRadius={borderRadius} />
                <Skeleton width="25%" animation={animation} borderRadius={borderRadius} />
              </div>
            ))}
          </div>
        );
      case 'avatar-text':
        return (
          <div className="flex">
            <Skeleton shape="circle" size="4rem" className="mr-2" animation={animation} />
            <div style={{ flex: 1 }}>
              <Skeleton width="100%" className="mb-2" animation={animation} borderRadius={borderRadius} />
              <Skeleton width="75%" animation={animation} borderRadius={borderRadius} />
            </div>
          </div>
        );
      case 'paragraph':
      case 'text': {
        const count = Math.max(Number(lines) || 0, 3);
        return (
          <div>
            {Array.from({ length: count }, (_, i) => (
              <Skeleton
                key={i}
                width={`${90 - i * 10}%`}
                height={finalHeight}
                className={i < count - 1 ? 'mb-2' : ''}
                animation={animation}
                borderRadius={borderRadius}
              />
            ))}
          </div>
        );
      }
      default: {
        // No preset: render a vertical stack with a minimum of 3 skeletons
        const count = Math.max(Number(lines) || 0, 3);
        return (
          <div>
            {Array.from({ length: count }, (_, i) => (
              renderSkeleton({
                key: i,
                className: i < count - 1 ? `${className} mb-2` : className
              })
            ))}
          </div>
        );
      }
    }
  };

  if (showSkeleton) return renderTemplate();
  return children;
};

export default SimpleSkeleton;
