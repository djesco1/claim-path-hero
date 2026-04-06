import { useEffect } from 'react';
import { useMotionValue, useSpring, useTransform, animate } from 'framer-motion';

export function useAnimatedNumber(value: number, duration = 800) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 30,
    mass: 0.5,
  });
  const rounded = useTransform(springValue, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: duration / 1000,
      ease: 'easeOut',
    });

    return controls.stop;
  }, [value, duration, motionValue]);

  return rounded;
}
