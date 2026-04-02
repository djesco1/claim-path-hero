import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Copy, RefreshCw, Trash2, Plus, Upload, FileText, Image, File, X, Loader2, Share2, QrCode, Link as LinkIcon, Mail } from 'lucide-react';
import SuccessGauge from '@/components/claim/SuccessGauge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/layout';
import { StatusBadge, ClaimTypeBadge, ConfirmDialog, DocumentSkeleton, LoadingSpinner } from '@/components/shared';
import { useClaimDetail, useClaimTimeline, useClaimDocuments, useAddTimelineEvent, useDeleteDocument } from '@/hooks/useClaimDetail';
import { useDeleteClaim, useUpdateClaimStatus } from '@/hooks/useClaims';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useAuth } from '@/hooks/useAuth';
import { strengthConfig, timelineEventLabels, timelineEventColors, statusConfig } from '@/constants';
import { formatDate, formatRelativeDate, getDaysUntilDeadline, cn } from '@/lib/utils';
import { generateClaimPDF } from '@/lib/pdf';
import { ClaimStatus, TimelineEventType } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import DocumentScanner from '@/components/scanner/DocumentScanner';
import { QRCodeSVG } from 'qrcode.react';

export default function ClaimDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: claim, isLoading, refetch } = useClaimDetail(id!);
  const { data: timeline } = useClaimTimeline(id!);
  const { data: documents } = useClaimDocuments(id!);
  const addEvent = useAddTimelineEvent();
  const deleteClaim = useDeleteClaim();
  const updateStatus = useUpdateClaimStatus();
  const deleteDoc = useDeleteDocument();
  const { uploadFiles, uploading } = useFileUpload(id!);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [statusDialog, setStatusDialog] = useState(false);
  const [noteDialog, setNoteDialog] = useState(false);
  const [shareDialog, setShareDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<ClaimStatus>('draft');
  const [noteType, setNoteType] = useState<TimelineEventType>('sent');
  const [noteText, setNoteText] = useState('');
  const [deleteDocId, setDeleteDocId] = useState<{ id: string; url: string } | null>(null);

  if (isLoading) return <AppLayout><div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div></AppLayout>;
  if (!claim) return <AppLayout><div className="p-8 text-center text-muted-foreground">Reclamación no encontrada</div></AppLayout>;

  const daysLeft = claim.deadline_date ? getDaysUntilDeadline(claim.deadline_date) : null;
  const shareUrl = claim.share_token ? `${window.location.origin}/share/${claim.share_token}` : '';

  const handleDelete = async () => {
    await deleteClaim.mutateAsync(claim.id);
    toast.success('Reclamación eliminada');
    navigate('/dashboard');
  };

  const handleCopy = () => {
    if (claim.generated_document) {
      navigator.clipboard.writeText(claim.generated_document);
      toast.success('Copiado al portapapeles');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) uploadFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
  };

  const handleAddNote = async () => {
    await addEvent.mutateAsync({ claimId: claim.id, eventType: noteType, note: noteText });
    toast.success('Nota agregada');
    setNoteDialog(false);
    setNoteText('');
  };

  const handleToggleShare = async () => {
    const updates: any = { share_enabled: !claim.share_enabled };
    if (!claim.share_token) {
      updates.share_token = crypto.randomUUID();
    }
    const { error } = await supabase.from('claims').update(updates).eq('id', claim.id);
    if (error) { toast.error('Error al compartir'); return; }
    toast.success(updates.share_enabled ? 'Enlace de compartir activado' : 'Enlace desactivado');
    refetch();
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Enlace copiado');
  };

  const getFileIcon = (name: string) => {
    if (name.match(/\.(pdf)$/i)) return FileText;
    if (name.match(/\.(jpg|jpeg|png|gif)$/i)) return Image;
    return File;
  };

  return (
    <AppLayout claimId={claim.id} claimTitle={claim.title}>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-1" />Dashboard
          </Button>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">{claim.title || 'Reclamación'}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <ClaimTypeBadge type={claim.claim_type} />
                <StatusBadge status={claim.status} />
                <span className="text-sm text-muted-foreground">Actualizado {formatRelativeDate(claim.updated_at)}</span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setShareDialog(true)}><Share2 className="h-4 w-4 mr-2" />Compartir</Button>
              <Button variant="outline" size="sm" onClick={() => { setNewStatus(claim.status); setStatusDialog(true); }}>Actualizar estado</Button>
              <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(true)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="document">
          <TabsList>
            <TabsTrigger value="document">Documento</TabsTrigger>
            <TabsTrigger value="rights">Derechos</TabsTrigger>
            <TabsTrigger value="instructions">Instrucciones</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="files">Archivos</TabsTrigger>
          </TabsList>

          <TabsContent value="document" className="mt-6">
            {claim.generated_document ? (
              <>
                <div className="flex gap-2 mb-4 flex-wrap">
                  <Button size="sm" onClick={() => generateClaimPDF(claim)}><Download className="h-4 w-4 mr-2" />Descargar PDF</Button>
                  <Button size="sm" variant="outline" onClick={handleCopy}><Copy className="h-4 w-4 mr-2" />Copiar texto</Button>
                </div>
                <div className="relative rounded-xl border bg-card p-8 font-serif text-sm leading-relaxed whitespace-pre-wrap text-foreground shadow-sm" style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
                }}>
                  {claim.status === 'draft' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-6xl font-bold text-destructive/[0.04] rotate-[-30deg] select-none">BORRADOR</span>
                    </div>
                  )}
                  {claim.generated_document}
                </div>
              </>
            ) : (
              <DocumentSkeleton />
            )}
          </TabsContent>

          <TabsContent value="rights" className="mt-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Tus derechos en esta situación</h3>
            <div className="space-y-4">
              {claim.legal_rights?.map((right, i) => {
                const config = strengthConfig[right.strength];
                return (
                  <div key={i} className="rounded-xl border bg-card overflow-hidden flex">
                    <div className={cn('w-1.5 shrink-0', config.barColor)} />
                    <div className="p-5 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-foreground">{right.name}</h4>
                        <span className={cn('text-xs rounded-md px-2 py-0.5 font-medium', config.color)}>{config.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">{right.legal_basis}</p>
                      <p className="text-sm text-muted-foreground">{right.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="instructions" className="mt-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Cómo enviar tu reclamación</h3>
            {claim.instructions && (
              <div className="rounded-xl border bg-card p-6 text-sm text-foreground whitespace-pre-wrap mb-4">
                {claim.instructions}
              </div>
            )}
            {claim.deadline_date && (
              <div className={cn(
                'rounded-xl border p-4',
                daysLeft !== null && daysLeft < 7 ? 'border-destructive bg-destructive/5' : daysLeft !== null && daysLeft < 30 ? 'border-warning bg-warning/5' : 'bg-muted'
              )}>
                <p className="font-medium text-foreground">Fecha límite recomendada: {formatDate(claim.deadline_date)}</p>
                {daysLeft !== null && <p className="text-sm text-muted-foreground">{daysLeft > 0 ? `${daysLeft} días restantes` : 'Plazo vencido'}</p>}
              </div>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Historial</h3>
              <Button size="sm" variant="outline" onClick={() => setNoteDialog(true)}><Plus className="h-4 w-4 mr-2" />Agregar nota</Button>
            </div>
            <div className="relative pl-6 space-y-6">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
              {timeline?.map(event => (
                <div key={event.id} className="relative flex gap-4">
                  <div className={cn('absolute left-[-17px] top-1 h-3 w-3 rounded-full border-2 border-card', timelineEventColors[event.event_type])} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{timelineEventLabels[event.event_type]}</p>
                    {event.note && <p className="text-sm text-muted-foreground mt-0.5">{event.note}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(event.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="files" className="mt-6">
            <div className="flex gap-2 mb-4">
              <DocumentScanner claimId={claim.id} />
            </div>
            <div
              className={cn('rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer', uploading ? 'border-primary bg-primary/5' : 'hover:border-primary')}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
            >
              <input ref={fileInputRef} type="file" className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png,.docx" onChange={handleFileUpload} />
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{uploading ? 'Subiendo...' : 'Arrastra archivos aquí o haz clic para seleccionar'}</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG, DOCX — Máx 10MB</p>
            </div>

            {documents && documents.length > 0 && (
              <div className="mt-4 space-y-2">
                {documents.map(doc => {
                  const Icon = getFileIcon(doc.file_name);
                  return (
                    <div key={doc.id} className="flex items-center justify-between rounded-lg border bg-card p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate text-foreground">{doc.file_name}</p>
                          <p className="text-xs text-muted-foreground">{formatRelativeDate(doc.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" asChild><a href={doc.file_url} target="_blank" rel="noopener"><Download className="h-4 w-4" /></a></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteDocId({ id: doc.id, url: doc.file_url })}><X className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog open={deleteConfirm} onOpenChange={setDeleteConfirm} title="¿Eliminar esta reclamación?" description="Esta acción es permanente." confirmLabel="Eliminar" destructive onConfirm={handleDelete} loading={deleteClaim.isPending} />

      <ConfirmDialog
        open={!!deleteDocId}
        onOpenChange={() => setDeleteDocId(null)}
        title="¿Eliminar archivo?"
        description="El archivo será eliminado permanentemente."
        confirmLabel="Eliminar"
        destructive
        onConfirm={async () => {
          if (deleteDocId) {
            await deleteDoc.mutateAsync({ docId: deleteDocId.id, fileUrl: deleteDocId.url });
            toast.success('Archivo eliminado');
            setDeleteDocId(null);
          }
        }}
      />

      <Dialog open={statusDialog} onOpenChange={setStatusDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cambiar estado</DialogTitle></DialogHeader>
          <Select value={newStatus} onValueChange={v => setNewStatus(v as ClaimStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setStatusDialog(false)}>Cancelar</Button>
            <Button onClick={async () => {
              await updateStatus.mutateAsync({ claimId: claim.id, status: newStatus });
              toast.success('Estado actualizado');
              setStatusDialog(false);
            }}>Actualizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={noteDialog} onOpenChange={setNoteDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Agregar nota al historial</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de evento</Label>
              <Select value={noteType} onValueChange={v => setNoteType(v as TimelineEventType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(timelineEventLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nota</Label>
              <Textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Escribe una nota..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNoteDialog(false)}>Cancelar</Button>
            <Button onClick={handleAddNote} disabled={!noteText || addEvent.isPending}>
              {addEvent.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialog} onOpenChange={setShareDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Compartir reclamación</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Compartir enlace público</p>
                <p className="text-xs text-muted-foreground">Solo se comparte el documento generado, no tu información personal</p>
              </div>
              <Switch checked={claim.share_enabled} onCheckedChange={handleToggleShare} />
            </div>

            {claim.share_enabled && claim.share_token && (
              <>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="text-xs" />
                  <Button size="sm" variant="outline" onClick={handleCopyShareLink}><Copy className="h-4 w-4" /></Button>
                </div>
                <div className="flex justify-center p-4 rounded-lg bg-muted">
                  <QRCodeSVG value={shareUrl} size={160} />
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
