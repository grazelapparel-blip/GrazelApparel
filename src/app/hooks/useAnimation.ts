import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook for triggering animations when an element comes into view
 */
export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

/**
 * Hook for parallax scroll effect
 */
export function useParallax(speed: number = 0.5) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const elementOffset = rect.top;
        const scrollOffset = -elementOffset * speed;
        setOffset(scrollOffset);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return { ref, offset };
}

/**
 * Hook for managing page transitions
 */
export function usePageTransition(onExitComplete?: () => void) {
  const [isExiting, setIsExiting] = useState(false);

  const exit = async () => {
    setIsExiting(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    onExitComplete?.();
  };

  return { isExiting, exit };
}

/**
 * Hook for staggered animations
 */
export function useStaggerAnimation(itemCount: number, baseDelay: number = 100) {
  return Array.from({ length: itemCount }, (_, index) => ({
    delay: index * baseDelay,
    style: {
      animationDelay: `${index * baseDelay}ms`
    }
  }));
}
