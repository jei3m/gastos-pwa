import { useState, useLayoutEffect } from 'react';

export function useScrollState(threshold: number = 20) {
  const [isScrolled, setIsScrolled] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.scrollY > threshold;
    }
    return false;
  });

  useLayoutEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };
    window.addEventListener('scroll', onScroll, {
      passive: true,
    });
    return () =>
      window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return isScrolled;
}
