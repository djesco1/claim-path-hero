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
import { ClaimStatus, Claim } from '@/types';
import { statusConfig } from '@/constants';
import { getGreeting, formatRelativeDate, formatCurrency, getDaysUntilDeadline, cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

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
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{getGreeting()}, {firstName}</h1>
            <p className="text-sm text-muted-foreground">Gestiona tus reclamaciones legales</p>
          </div>
          <Button asChild><Link to="/claims/new"><Plus className="h-4 w-4 mr-2" />Nueva Reclamación</Link></Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground">{totalClaims}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">Activas</p>
            <p className="text-2xl font-bold text-primary">{activeClaims}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">Resueltas</p>
            <p className="text-2xl font-bold text-success">{resolvedClaims}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">Plan</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground capitalize">{profile?.plan || 'free'}</span>
              {profile?.plan === 'free' && <Link to="/pricing" className="text-xs text-primary hover:underline">Actualizar</Link>}
            </div>
          </div>
        </div>

        {/* Filters */}
        <Tabs value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? null : v as ClaimStatus)}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {tabs.map(t => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
          </TabsList>
        </Tabs>

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
          <div className="space-y-3">
            {claims.map((claim: Claim) => {
              const daysLeft = claim.deadline_date ? getDaysUntilDeadline(claim.deadline_date) : null;
              return (
                <div key={claim.id} className="rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => navigate(`/claims/${claim.id}`)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <ClaimTypeBadge type={claim.claim_type} />
                        <StatusBadge status={claim.status} />
                        {daysLeft !== null && (
                          <span className={cn(
                            'text-xs rounded-md px-2 py-0.5 font-medium',
                            daysLeft < 7 ? 'bg-red-100 text-red-700' : daysLeft < 30 ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'
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
              );
            })}
          </div>
        )}
      </div>

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
