import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

/**
 * LinkComponent - A wrapper component for Next.js Link with instant navigation
 * 
 * This component provides instant navigation without page refreshes,
 * just like in normal React SPAs. It wraps Next.js Link for optimal performance.
 */
const LinkComponent = ({ 
  href, 
  children, 
  className = '', 
  target = '_self',
  rel = '',
  onClick,
  style,
  replace = false, // Use replace instead of push for navigation
  scroll = true,   // Enable smooth scrolling to top
  shallow = false, // Enable shallow routing for dynamic routes
  prefetch = true, // Prefetch pages for faster navigation
  forceRefresh, // Plasmic-specific prop - filter out
  ...props 
}) => {
  const router = useRouter();
  
  // Ensure href is always provided
  if (!href) {
    console.warn('LinkComponent: href prop is required');
    return null;
  }

  // Handle external links (they will refresh, but internal links won't)
  const isExternal = href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:');
  
  // Enhanced click handler to capture clicks from any child element (including buttons)
  const handleClick = (e) => {
    // Always prevent default behavior to stop form submissions or button actions
    e.preventDefault();
    e.stopPropagation();
    
    console.log('LinkComponent clicked!', { href, target: e.target });
    
    // If there's a custom onClick, call it
    if (onClick) {
      onClick(e);
    }
    
    // For internal navigation, use Next.js router for instant navigation
    if (!isExternal) {
      console.log('Navigating to:', href);
      if (replace) {
        router.replace(href);
      } else {
        router.push(href);
      }
    } else {
      // For external links, open manually
      if (target === '_blank') {
        window.open(href, '_blank', rel ? `rel=${rel}` : '');
      } else {
        window.location.href = href;
      }
    }
  };

  // Filter out non-DOM props before spreading
  const { 
    replace: _replace, 
    scroll: _scroll, 
    shallow: _shallow, 
    prefetch: _prefetch,
    forceRefresh: _forceRefresh,
    ...domProps 
  } = props;

  // For internal links, we'll handle click manually to prevent button/form issues
  if (!isExternal) {
    return (
      <div 
        onClick={handleClick}
        className={className}
        style={{ 
          cursor: 'pointer', 
          textDecoration: 'none',
          display: 'inline-block',
          ...style 
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick(e);
          }
        }}
        {...domProps}
      >
        {children}
      </div>
    );
  }
  
  // For external links, use regular anchor tag
  return (
    <a 
      href={href}
      target={target}
      rel={rel}
      onClick={handleClick}
      className={className}
      style={style}
      {...domProps}
    >
      {children}
    </a>
  );
};

export default LinkComponent; 