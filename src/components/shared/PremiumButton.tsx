import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode, useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

interface PremiumButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  ripple?: boolean;
  asChild?: boolean;
}

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  ripple = true,
  asChild = false,
  className,
  onClick,
  ...props
}, ref) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();

      setRipples((prev) => [...prev, { x, y, id }]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    }

    onClick?.(e);
  };

  const variants = {
    primary: 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/50',
    secondary: 'bg-white/10 backdrop-blur-sm text-foreground border border-white/20',
    ghost: 'bg-transparent text-foreground hover:bg-white/5',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const Comp = asChild ? Slot : motion.button;

  return (
    <Comp
      ref={ref as any}
      className={cn(
        'relative overflow-hidden rounded-xl font-medium',
        'transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...(!asChild && {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
      })}
      onClick={handleClick}
      {...(props as any)}
    >
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />

      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
          }}
          initial={{ width: 0, height: 0, opacity: 1 }}
          animate={{
            width: 300,
            height: 300,
            opacity: 0,
            x: -150,
            y: -150,
          }}
          transition={{ duration: 0.6 }}
        />
      ))}

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>

      {/* Glow effect for primary */}
      {variant === 'primary' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 blur-xl opacity-0 pointer-events-none"
          whileHover={{ opacity: 0.5 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </Comp>
  );
});

PremiumButton.displayName = 'PremiumButton';
