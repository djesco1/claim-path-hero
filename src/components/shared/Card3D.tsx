import { useRef, ReactNode } from 'react';
import { motion, useMotionTemplate } from 'framer-motion';
import { useCard3D } from '@/hooks/useCard3D';
import { cn } from '@/lib/utils';

interface Card3DProps {
  children: ReactNode;
  className?: string;
  maxRotation?: number;
  disabled?: boolean;
}

export function Card3D({ children, className, maxRotation = 3, disabled = false }: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { rotateX, rotateY, shineX, shineY } = useCard3D({
    cardRef,
    maxRotation,
    disabled,
  });

  const shine = useMotionTemplate`radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.06) 0%, transparent 50%)`;

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={cardRef}
      style={{
        perspective: 800,
        transformStyle: 'preserve-3d',
      }}
      className={cn('relative', className)}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative w-full h-full"
      >
        {children}
        
        {/* Shine overlay */}
        <motion.div
          style={{
            background: shine,
          }}
          className="absolute inset-0 pointer-events-none rounded-[inherit]"
        />
      </motion.div>
    </motion.div>
  );
}
