import {
  useState,
  useLayoutEffect,
  RefObject,
} from 'react';

export function useScrollState(
  ref: RefObject<HTMLElement | null>,
  threshold: number = 20,
  isMobile: boolean = true
) {
  const [isScrolled, setIsScrolled] = useState(false);

  useLayoutEffect(() => {
    if (isMobile) {
      const sr = ref.current;
      if (!sr) return;

      setIsScrolled(sr.scrollTop > threshold);

      const onScroll = () => {
        setIsScrolled(sr.scrollTop > threshold);
      };
      sr.addEventListener('scroll', onScroll, {
        passive: true,
      });
      return () =>
        sr.removeEventListener('scroll', onScroll);
    } else {
      setIsScrolled(window.scrollY > threshold);

      const onScroll = () => {
        setIsScrolled(window.scrollY > threshold);
      };
      window.addEventListener('scroll', onScroll, {
        passive: true,
      });
      return () =>
        window.removeEventListener('scroll', onScroll);
    }
  }, [ref, threshold, isMobile]);

  return isScrolled;
}
