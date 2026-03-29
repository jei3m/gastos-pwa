import {
  useState,
  useLayoutEffect,
  RefObject,
} from 'react';

export function useScrollState(
  ref: RefObject<HTMLElement | null>,
  threshold: number = 20
) {
  const [isScrolled, setIsScrolled] = useState(false);

  useLayoutEffect(() => {
    const sr = ref.current;
    if (!sr) return;

    setIsScrolled(sr.scrollTop > threshold);

    const onScroll = () => {
      setIsScrolled(sr.scrollTop > threshold);
    };
    sr.addEventListener('scroll', onScroll, {
      passive: true,
    });
    return () => sr.removeEventListener('scroll', onScroll);
  }, [ref, threshold]);

  return isScrolled;
}
