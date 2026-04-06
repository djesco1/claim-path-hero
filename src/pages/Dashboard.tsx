import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, Trash2, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AppLayout } from '@/components/layout';
import { StatusBadge, ClaimTypeBadge, EmptyState, ClaimCardSkeleton, ConfirmDialog, LoadingSpinner } from '@/components/shared';
import { useClaims, useDeleteClaim, useUpdateClaimStatus } from '@/hooks/useClaims';
import { useAuth } from '@/hooks/useAuth';
import { ClaimStatus, Claim, ClaimType } from '@/types';
import { statusConfig } from '@/constants';
import { getGreeting, formatRelativeDate, formatCurrency, getDaysUntilDeadline, cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { AnimatedBackground } from '@/components/shared/AnimatedBackground';
import { FloatingParticles } from '@/components/shared/FloatingParticles';
import { GlassCard } from '@/components/shared/GlassCard';
import { AnimatedNumber } from '@/components/shared/AnimatedNumber';
import { pageVariants, fadeInVariants, staggerContainer } from '@/lib/motion';

const ACCENT_COLORS: Record<ClaimType, string> = {
  landlord_deposit: 'bg-blue-500',
  wrongful_termination: 'bg-orange-500',
  insurance_denial: 'bg-violet-500',
  public_entity: 'bg-emerald-500',
  service_refund: 'bg-amber-500',
  other: 'bg-slate-400',
};

export default function Dashboard() {
  const { profile } = useAuth();
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | null>(null);
  const { data: claims, isLoading } = useClaims(statusFilter);
  const deleteClaim = useDeleteClaim();
  const updateStatus = useUpdateClaimStatus();
  const navigate = useNavigate();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusDialog, setStatusDialog] = useState<{ id: string; current: ClaimStatus } | null>(null);
  const [newStatus, setNewStatus] = useState<ClaimStatus>('draft');

  const firstName = profile?.full_name?.split(' ')[0] || 'Usuario';
  const totalClaims = claims?.length || 0;
  const activeClaims = claims?.filter(c => c.status === 'in_progress' || c.status === 'sent').length || 0;
  const resolvedClaims = claims?.filter(c => c.status === 'resolved').length || 0;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteClaim.mutateAsync(deleteId);
      toast.success('Reclamación eliminada');
    } catch {
      toast.error('Error al eliminar');
    }
    setDeleteId(null);
  };

  const handleStatusUpdate = async () => {
    if (!statusDialog) return;
    try {
      await updateStatus.mutateAsync({ claimId: statusDialog.id, status: newStatus });
      toast.success('Estado actualizado');
    } catch {
      toast.error('Error al actualizar');
    }
    setStatusDialog(null);
  };

  const tabs: { value: string; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'draft', label: 'Borrador' },
    { value: 'in_progress', label: 'En proceso' },
    { value: 'sent', label: 'Enviadas' },
    { value: 'resolved', label: 'Resueltas' },
    { value: 'closed', label: 'Cerradas' },
  ];

  return (
    <AppLayout>
      <AnimatedBackground />
      <FloatingParticles count={15} />
      
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6 relative z-10"
      >
        {/* Header */}
        <motion.div
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">{getGreeting()}, {firstName}</h1>
            <p className="text-sm text-muted-foreground">Gestiona tus reclamaciones legales</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild className="bg-gradient-to-r from-primary to-purple-600 hover:brightness-110 shadow-lg shadow-primary/30">
              <Link to="/claims/new"><Plus className="h-4 w-4 mr-2" />Nueva Reclamación</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats with animated numbers */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <GlassCard className="p-4" glow>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground"><AnimatedNumber value={totalClaims} /></p>
          </GlassCard>
          <GlassCard className="p-4" glow>
            <p className="text-sm text-muted-foreground">Activas</p>
            <p className="text-2xl font-bold text-primary"><AnimatedNumber value={activeClaims} /></p>
          </GlassCard>
          <GlassCard className="p-4" glow>
            <p className="text-sm text-muted-foreground">Resueltas</p>
            <p className="text-2xl font-bold text-success"><AnimatedNumber value={resolvedClaims} /></p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-sm text-muted-foreground">Plan</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground capitalize">{profile?.plan || 'free'}</span>
              {profile?.plan === 'free' && <Link to="/pricing" className="text-xs text-primary hover:underline">Actualizar</Link>}
            </div>
          </GlassCard>
        </motion.div>

        {/* Filters */}
        <GlassCard className="p-1">
          <Tabs value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? null : v as ClaimStatus)}>
            <TabsList className="w-full justify-start overflow-x-auto bg-transparent">
              {tabs.map(t => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
            </TabsList>
          </Tabs>
        </GlassCard>

        {/* Claims List */}
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <ClaimCardSkeleton key={i} />)}</div>
        ) : !claims?.length ? (
          <EmptyState
            title="Aún no tienes reclamaciones"
            description="Cuando tengas un problema que resolver, estaremos aquí."
            action={<Button asChild><Link to="/claims/new">Crear mi primera reclamación</Link></Button>}
          />
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
              {claims.map((claim: Claim, index: number) => {
              const daysLeft = claim.deadline_date ? getDaysUntilDeadline(claim.deadline_date) : null;
              const accentColor = ACCENT_COLORS[claim.claim_type] || 'bg-slate-400';
              return (
                <GlassCard
                  key={claim.id}
                  className="overflow-hidden cursor-pointer group flex"
                  glow
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2, scale: 1.01 }}
                  onClick={() => navigate(`/claims/${claim.id}`)}
                >
                  {/* Accent bar */}
                  <div className={cn('w-1 shrink-0 transition-all group-hover:w-1.5', accentColor)} />
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ClaimTypeBadge type={claim.claim_type} />
                          <StatusBadge status={claim.status} />
                          {daysLeft !== null && (
                            <span className={cn(
                              'text-xs rounded-md px-2 py-0.5 font-medium transition-colors',
                              daysLeft < 3 ? 'bg-destructive/10 text-destructive animate-pulse' :
                              daysLeft < 7 ? 'bg-destructive/10 text-destructive' :
                              daysLeft < 30 ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'
                            )}>
                              {daysLeft > 0 ? `${daysLeft} días` : 'Vencida'}
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-foreground truncate">{claim.title || 'Sin título'}</p>
                        <p className="text-sm text-muted-foreground">{claim.counterparty_name} · {formatRelativeDate(claim.created_at)}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="shrink-0"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); navigate(`/claims/${claim.id}`); }}><Eye className="h-4 w-4 mr-2" />Ver detalle</DropdownMenuItem>
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); setStatusDialog({ id: claim.id, current: claim.status }); setNewStatus(claim.status); }}><RefreshCw className="h-4 w-4 mr-2" />Cambiar estado</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={e => { e.stopPropagation(); setDeleteId(claim.id); }}><Trash2 className="h-4 w-4 mr-2" />Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="¿Eliminar esta reclamación?"
        description="Esta acción es permanente. ¿Eliminar esta reclamación?"
        confirmLabel="Eliminar"
        destructive
        onConfirm={handleDelete}
        loading={deleteClaim.isPending}
      />

      <Dialog open={!!statusDialog} onOpenChange={() => setStatusDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cambiar estado</DialogTitle></DialogHeader>
          <Select value={newStatus} onValueChange={v => setNewStatus(v as ClaimStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setStatusDialog(null)}>Cancelar</Button>
            <Button onClick={handleStatusUpdate} disabled={updateStatus.isPending}>
              {updateStatus.isPending && <LoadingSpinner className="h-4 w-4 mr-2" />}
              Actualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
