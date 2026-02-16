import { useState, useEffect } from 'react';

export function useScrollState(threshold: number = 40) {
  const [isScrolled, setIsScrolled] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.scrollY > threshold;
    }
    return false;
  });

  console.log(isScrolled);

  useEffect(() => {
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
