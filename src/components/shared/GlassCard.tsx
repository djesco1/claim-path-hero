import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export function GlassCard({ 
  children, 
  className, 
  hover = true,
  glow = false,
  ...props 
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'relative rounded-2xl border border-white/20',
        'bg-white/10 backdrop-blur-xl',
        'shadow-xl shadow-black/5',
        hover && 'transition-all duration-300',
        className
      )}
      whileHover={hover ? { 
        y: -4,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      } : undefined}
      {...props}
    >
      {/* Glow effect */}
      {glow && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 blur-xl -z-10" />
      )}

      {/* Shine effect on hover */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0"
          initial={{ x: '-100%', y: '-100%' }}
          whileHover={{ x: '100%', y: '100%' }}
          transition={{ duration: 0.6 }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Border gradient */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
    </motion.div>
  );
}
