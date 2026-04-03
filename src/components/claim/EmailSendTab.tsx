import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Send, CheckCircle2, Loader2, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ConfirmDialog } from '@/components/shared';
import { Claim } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useAddTimelineEvent } from '@/hooks/useClaimDetail';
import { useUpdateClaimStatus } from '@/hooks/useClaims';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { formatDate, cn } from '@/lib/utils';
import { sanitize } from '@/lib/sanitize';

const emailSchema = z.object({
  recipientEmail: z.string().email('Email inválido'),
  recipientName: z.string().min(1, 'Nombre requerido'),
  cc: z.string().optional(),
  subject: z.string().min(1, 'Asunto requerido'),
  body: z.string().min(10, 'Mensaje muy corto'),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface EmailLog {
  id: string;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  status: string | null;
  sent_at: string | null;
}

type Step = 'compose' | 'sending' | 'success';

export default function EmailSendTab({ claim }: { claim: Claim }) {
  const { user, profile } = useAuth();
  const addEvent = useAddTimelineEvent();
  const updateStatus = useUpdateClaimStatus();
  const [step, setStep] = useState<Step>('compose');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [attachPdf, setAttachPdf] = useState(true);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [sentConfirmation, setSentConfirmation] = useState<{ email: string; time: string } | null>(null);

  const claimTypeLabel = claim.claim_type.replace(/_/g, ' ');
  const today = formatDate(new Date());

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      recipientEmail: claim.counterparty_email || '',
      recipientName: claim.counterparty_name || '',
      cc: '',
      subject: `Reclamación formal — ${claimTypeLabel} — ${today}`,
      body: `Estimados señores,\n\nPor medio del presente correo, les hago llegar formal reclamación según el documento adjunto, de conformidad con la legislación colombiana vigente.\n\nQuedo en espera de respuesta dentro del plazo legal indicado.\n\nAtentamente,\n${profile?.full_name || 'Usuario ClaimPath'}`,
    },
  });

  // Load email logs
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('email_logs')
        .select('id, recipient_email, recipient_name, subject, status, sent_at')
        .eq('claim_id', claim.id)
        .order('sent_at', { ascending: false });
      setEmailLogs((data as EmailLog[]) || []);
      setLoadingLogs(false);
    })();
  }, [claim.id]);

  const handleSend = async (data: EmailFormData) => {
    setConfirmOpen(false);
    setStep('sending');

    try {
      // Validate CC emails
      const ccEmails = data.cc
        ? data.cc.split(',').map(e => e.trim()).filter(Boolean)
        : [];

      for (const email of ccEmails) {
        if (!z.string().email().safeParse(email).success) {
          toast.error(`Email CC inválido: ${email}`);
          setStep('compose');
          return;
        }
      }

      // Check rate limit (3 emails per claim per 24h)
      const recentCount = emailLogs.filter(l => {
        if (!l.sent_at) return false;
        const hoursAgo = (Date.now() - new Date(l.sent_at).getTime()) / (1000 * 60 * 60);
        return hoursAgo < 24;
      }).length;

      if (recentCount >= 3) {
        toast.error('Has alcanzado el límite de 3 correos por reclamación cada 24 horas.');
        setStep('compose');
        return;
      }

      // Save counterparty email to claim if not set
      if (!claim.counterparty_email && data.recipientEmail) {
        await supabase.from('claims').update({ counterparty_email: data.recipientEmail }).eq('id', claim.id);
      }

      // Insert email log
      const { error: logError } = await supabase.from('email_logs').insert({
        claim_id: claim.id,
        user_id: user!.id,
        recipient_email: sanitize(data.recipientEmail),
        recipient_name: sanitize(data.recipientName),
        cc_emails: ccEmails.length > 0 ? ccEmails : null,
        subject: sanitize(data.subject),
        body_preview: sanitize(data.body).slice(0, 200),
        pdf_attached: attachPdf,
        status: 'sent',
      });

      if (logError) throw logError;

      // Open mailto with the composed email
      const subject = encodeURIComponent(data.subject);
      const body = encodeURIComponent(
        data.body + (claim.generated_document ? '\n\n---\n\n' + claim.generated_document : '')
      );
      const mailto = `mailto:${data.recipientEmail}?subject=${subject}&body=${body}${ccEmails.length ? '&cc=' + ccEmails.join(',') : ''}`;
      window.open(mailto, '_blank');

      // Update claim status
      await updateStatus.mutateAsync({ claimId: claim.id, status: 'sent' });

      // Add timeline event
      await addEvent.mutateAsync({
        claimId: claim.id,
        eventType: 'sent',
        note: `Enviado a ${data.recipientEmail} via ClaimPath`,
      });

      setSentConfirmation({ email: data.recipientEmail, time: new Date().toISOString() });
      setStep('success');

      // Refresh logs
      const { data: newLogs } = await supabase
        .from('email_logs')
        .select('id, recipient_email, recipient_name, subject, status, sent_at')
        .eq('claim_id', claim.id)
        .order('sent_at', { ascending: false });
      setEmailLogs((newLogs as EmailLog[]) || []);

    } catch (err: any) {
      toast.error('Error al enviar: ' + (err.message || 'Intenta de nuevo'));
      setStep('compose');
    }
  };

  if (step === 'sending') {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <Send className="h-8 w-8 text-primary" />
          </div>
        </div>
        <p className="mt-6 text-lg font-semibold text-foreground">Preparando envío...</p>
        <p className="text-sm text-muted-foreground mt-1">Se abrirá tu cliente de correo</p>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-4" />
      </div>
    );
  }

  if (step === 'success' && sentConfirmation) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <p className="mt-6 text-lg font-semibold text-foreground">Correo preparado exitosamente</p>
        <p className="text-sm text-muted-foreground mt-1">
          Enviado a <span className="font-medium text-foreground">{sentConfirmation.email}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDate(sentConfirmation.time)}
        </p>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={() => setStep('compose')}>
            Enviar otro
          </Button>
        </div>

        {/* History */}
        {emailLogs.length > 0 && <EmailHistory logs={emailLogs} />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!claim.generated_document && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Documento no generado</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Genera el documento de reclamación primero antes de enviarlo.</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Email de la contraparte *</Label>
            <Input {...form.register('recipientEmail')} placeholder="empresa@ejemplo.com" type="email" />
            {form.formState.errors.recipientEmail && (
              <p className="text-xs text-destructive">{form.formState.errors.recipientEmail.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Nombre del destinatario *</Label>
            <Input {...form.register('recipientName')} placeholder="Nombre o empresa" />
            {form.formState.errors.recipientName && (
              <p className="text-xs text-destructive">{form.formState.errors.recipientName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>CC (opcional)</Label>
          <Input {...form.register('cc')} placeholder="copia@ejemplo.com, otro@ejemplo.com" />
          <p className="text-xs text-muted-foreground">Separa múltiples correos con comas</p>
        </div>

        <div className="space-y-2">
          <Label>Asunto *</Label>
          <Input {...form.register('subject')} />
          {form.formState.errors.subject && (
            <p className="text-xs text-destructive">{form.formState.errors.subject.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Mensaje introductorio *</Label>
          <Textarea {...form.register('body')} rows={8} className="font-sans text-sm" />
          {form.formState.errors.body && (
            <p className="text-xs text-destructive">{form.formState.errors.body.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
          <div>
            <p className="text-sm font-medium text-foreground">Incluir documento en el correo</p>
            <p className="text-xs text-muted-foreground">El documento de reclamación se incluirá en el cuerpo del correo</p>
          </div>
          <Switch checked={attachPdf} onCheckedChange={setAttachPdf} />
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={form.handleSubmit(() => setConfirmOpen(true))}
          disabled={!claim.generated_document}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          Enviar reclamación
        </Button>
      </div>

      {/* Email history */}
      {emailLogs.length > 0 && <EmailHistory logs={emailLogs} />}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="¿Enviar reclamación formal?"
        description={`Estás a punto de enviar esta reclamación formal a ${form.getValues('recipientEmail')}. Esta acción quedará registrada. ¿Continuar?`}
        confirmLabel="Enviar"
        onConfirm={() => handleSend(form.getValues())}
      />
    </div>
  );
}

function EmailHistory({ logs }: { logs: EmailLog[] }) {
  return (
    <div className="w-full mt-8">
      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        Historial de envíos
      </h4>
      <div className="space-y-2">
        {logs.map(log => (
          <div key={log.id} className="rounded-lg border bg-card p-3 flex items-center justify-between text-sm">
            <div className="min-w-0">
              <p className="font-medium text-foreground truncate">{log.recipient_email}</p>
              <p className="text-xs text-muted-foreground truncate">{log.subject}</p>
            </div>
            <div className="text-right shrink-0 ml-4">
              <span className={cn(
                'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                log.status === 'sent' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-muted text-muted-foreground'
              )}>
                {log.status === 'sent' ? 'Enviado' : log.status}
              </span>
              {log.sent_at && (
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(log.sent_at)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
