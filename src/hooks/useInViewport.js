"use client";

import { useEffect, useState } from 'react';

/**
 * Gates a component's WebGL setup effect to only run near the viewport.
 *
 * The landing page mounts nine separate THREE.WebGLRenderer instances (one
 * per 3D component) all at once regardless of scroll position — nine
 * concurrent WebGL contexts from a single page load, which is enough to hit
 * the browser's context limit (commonly 8-16, lower on constrained GPUs) on
 * its own. When that limit is hit, the browser silently kills the oldest
 * context and that canvas goes blank — which one, depends on mount order and
 * how many tabs/reloads came before it, so it looks random and stops being
 * reproducible the moment you go looking for it in one clean tab.
 *
 * rootMargin starts the WebGL setup slightly before the section is actually
 * on screen, so there's no visible pop-in on scroll.
 */
export function useInViewport(ref, { rootMargin = '200px' } = {}) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === 'undefined') {
      setInView(true); // no observer support — fail open rather than never render
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inView;
}
