import React, { useEffect, useRef, useState } from 'react';

export const ClientOnly = ({ children, fallback = null, delayMs = 0 }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);
  if (!mounted) return fallback;
  return typeof window === 'undefined' ? null : children;
};

export const VisibilityGate = ({
  children,
  rootMargin = '200px 0px',
  minHeight = '240px',
  delayMs = 0,
  placeholderClassName = '',
  placeholderStyle = {}
}) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current || typeof window === 'undefined') return;
    let observer;
    const node = ref.current;
    const onIntersect = (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          if (delayMs > 0) {
            setTimeout(() => setVisible(true), delayMs);
          } else {
            setVisible(true);
          }
          observer && observer.disconnect();
        }
      });
    };
    observer = new IntersectionObserver(onIntersect, { rootMargin });
    observer.observe(node);
    return () => observer && observer.disconnect();
  }, [rootMargin, delayMs]);

  if (!visible) {
    return <div ref={ref} className={placeholderClassName} style={{ minHeight, ...placeholderStyle }} />;
  }
  return <div ref={ref}>{children}</div>;
};

export default { ClientOnly, VisibilityGate };


