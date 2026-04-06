import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface EnhancedToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
  progress: number;
  isPaused: boolean;
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: 'bg-green-50 border-green-200 text-green-900',
  error: 'bg-red-50 border-red-200 text-red-900',
  info: 'bg-blue-50 border-blue-200 text-blue-900',
  warning: 'bg-amber-50 border-amber-200 text-amber-900',
};

const progressColors = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-amber-500',
};

export function EnhancedToast({ toast, onDismiss, progress, isPaused }: EnhancedToastProps) {
  const Icon = icons[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'relative overflow-hidden rounded-lg border shadow-lg p-4 pr-10 min-w-[320px] max-w-md',
        colors[toast.type]
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <p className="text-sm font-medium flex-1">{toast.message}</p>
        <button
          onClick={() => onDismiss(toast.id)}
          className="absolute top-3 right-3 rounded-md p-1 hover:bg-black/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* Progress bar */}
      <motion.div
        className={cn('absolute bottom-0 left-0 h-1', progressColors[toast.type])}
        initial={{ width: '100%' }}
        animate={{ width: isPaused ? `${progress}%` : '0%' }}
        transition={{ duration: isPaused ? 0 : (toast.duration || 4000) / 1000, ease: 'linear' }}
      />
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  getProgress: (id: string) => number;
  isPaused: (id: string) => boolean;
}

export function ToastContainer({ toasts, onDismiss, getProgress, isPaused }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.slice(0, 3).map((toast, index) => (
          <motion.div
            key={toast.id}
            style={{ pointerEvents: 'auto' }}
            animate={{
              scale: 1 - index * 0.05,
              y: index * -8,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <EnhancedToast
              toast={toast}
              onDismiss={onDismiss}
              progress={getProgress(toast.id)}
              isPaused={isPaused(toast.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
