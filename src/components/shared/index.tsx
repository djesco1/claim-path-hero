import { cn } from '@/lib/utils';
import { ClaimStatus, ClaimType } from '@/types';
import { statusConfig, claimTypes } from '@/constants';
import { Home, Briefcase, Umbrella, Landmark, Building, MoreHorizontal, Loader2, AlertTriangle, FileText, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useEffect, Component, ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { badgeVariants } from '@/lib/motion';

const claimTypeIcons: Record<ClaimType, typeof Home> = {
  landlord_deposit: Home,
  wrongful_termination: Briefcase,
  insurance_denial: Umbrella,
  public_entity: Landmark,
  service_refund: Building,
  other: MoreHorizontal,
};

export function StatusBadge({ status }: { status: ClaimStatus }) {
  const config = statusConfig[status];
  
  // Determine animation variant based on status
  const getVariant = () => {
    if (status === 'resolved') return badgeVariants.success;
    if (status === 'draft') return badgeVariants.info;
    if (status === 'sent') return badgeVariants.warning;
    return badgeVariants.info;
  };

  return (
    <motion.span
      variants={getVariant()}
      initial="hidden"
      animate="visible"
      className={cn('inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium', config.color)}
    >
      {config.label}
    </motion.span>
  );
}

export function ClaimTypeBadge({ type }: { type: ClaimType }) {
  const config = claimTypes.find(c => c.value === type);
  const Icon = claimTypeIcons[type];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
      <Icon className="h-3.5 w-3.5" />
      {config?.label}
    </span>
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-6 w-6 animate-spin text-primary', className)} />;
}

export function EmptyState({ icon: Icon = FileText, title, description, action }: {
  icon?: typeof FileText;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="rounded-2xl bg-muted p-4 mb-4"
      >
        <Icon className="h-10 w-10 text-muted-foreground" />
      </motion.div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {action}
    </motion.div>
  );
}

export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = 'Confirmar', destructive, onConfirm, loading }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  loading?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant={destructive ? 'destructive' : 'default'} onClick={onConfirm} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UpgradeModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Actualiza a Pro</DialogTitle>
          <DialogDescription>Has alcanzado el límite de tu plan gratuito. Actualiza para crear reclamaciones ilimitadas.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <div className="flex items-center gap-2 text-sm"><span className="text-success">✓</span> Reclamaciones ilimitadas</div>
          <div className="flex items-center gap-2 text-sm"><span className="text-success">✓</span> Recordatorios automáticos</div>
          <div className="flex items-center gap-2 text-sm"><span className="text-success">✓</span> Soporte prioritario</div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cerrar</Button>
          <Button asChild><a href="/pricing">Ver planes</a></Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -100 }}
      className="fixed top-0 left-0 right-0 z-[100] bg-warning px-4 py-2 text-center text-sm font-medium text-warning-foreground"
    >
      <WifiOff className="inline h-4 w-4 mr-2" />
      Sin conexión a internet. Algunas funciones pueden no estar disponibles.
    </motion.div>
  );
}

interface ErrorBoundaryProps { children: ReactNode }
interface ErrorBoundaryState { hasError: boolean }

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h1 className="text-xl font-semibold mb-2 text-foreground">Algo salió mal</h1>
          <p className="text-muted-foreground mb-6">Ha ocurrido un error inesperado.</p>
          <Button onClick={() => window.location.reload()}>Recargar página</Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ClaimCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function DocumentSkeleton() {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="h-4" style={{ width: `${60 + Math.random() * 40}%` }} />
      ))}
    </div>
  );
}

// Export new components
export { Card3D } from './Card3D';
export { AnimatedNumber } from './AnimatedNumber';
export { TypingText } from './TypingText';
export { AnimatedBackground } from './AnimatedBackground';
export { FloatingParticles } from './FloatingParticles';
export { LegalOwl } from './LegalOwl';
export { GlassCard } from './GlassCard';
export { PremiumButton } from './PremiumButton';
