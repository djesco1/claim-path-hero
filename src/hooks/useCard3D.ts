import { useMotionValue, useSpring, useTransform } from 'framer-motion';
import { RefObject, useEffect } from 'react';

interface UseCard3DOptions {
  cardRef: RefObject<HTMLElement>;
  maxRotation?: number;
  disabled?: boolean;
}

export function useCard3D({
  cardRef,
  maxRotation = 3,
  disabled = false,
}: UseCard3DOptions) {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { stiffness: 300, damping: 20 };
  const rotateX = useSpring(
    useTransform(mouseY, [0, 1], [maxRotation, -maxRotation]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [0, 1], [-maxRotation, maxRotation]),
    springConfig
  );

  const shineX = useSpring(
    useTransform(mouseX, [0, 1], [0, 100]),
    springConfig
  );
  const shineY = useSpring(
    useTransform(mouseY, [0, 1], [0, 100]),
    springConfig
  );

  useEffect(() => {
    if (disabled || !cardRef.current) return;

    const card = cardRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      mouseX.set(x);
      mouseY.set(y);
    };

    const handleMouseLeave = () => {
      mouseX.set(0.5);
      mouseY.set(0.5);
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cardRef, disabled, mouseX, mouseY]);

  return { rotateX, rotateY, shineX, shineY };
}
