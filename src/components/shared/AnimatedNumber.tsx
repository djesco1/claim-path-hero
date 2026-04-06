import { motion } from 'framer-motion';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (value: number) => string;
  className?: string;
  triggerOnce?: boolean;
}

export function AnimatedNumber({
  value,
  duration = 800,
  format = (v) => v.toString(),
  className,
  triggerOnce = true,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: triggerOnce, amount: 0.5 });
  const [targetValue, setTargetValue] = useState(0);
  const animatedValue = useAnimatedNumber(targetValue, duration);

  useEffect(() => {
    if (isInView) {
      setTargetValue(value);
    }
  }, [isInView, value]);

  return (
    <motion.span ref={ref} className={className}>
      {format(animatedValue.get())}
    </motion.span>
  );
}
