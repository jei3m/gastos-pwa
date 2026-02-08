import { useState, useEffect } from 'react';

export function useScrollState(threshold: number = 40) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Just reset scroll position, no state update
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    // Set initial state based on current position
    onScroll();

    window.addEventListener('scroll', onScroll, {
      passive: true,
    });
    return () =>
      window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return isScrolled;
}
