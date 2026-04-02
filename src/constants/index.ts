import { ClaimType, ClaimStatus, CounterpartyType, TimelineEventType } from '@/types';

export const claimTypes: { value: ClaimType; label: string; icon: string; description: string }[] = [
  { value: 'landlord_deposit', label: 'Arrendamiento', icon: 'Home', description: 'Depósito no devuelto, daños injustificados, desalojo irregular' },
  { value: 'wrongful_termination', label: 'Laboral', icon: 'Briefcase', description: 'Despido sin justa causa, liquidación incorrecta, acoso laboral' },
  { value: 'insurance_denial', label: 'Seguros', icon: 'Umbrella', description: 'Reclamación negada, demora injustificada, póliza mal aplicada' },
  { value: 'public_entity', label: 'Entidad pública', icon: 'Landmark', description: 'Derechos de petición, silencio administrativo, negación de trámites' },
  { value: 'service_refund', label: 'Empresa/Servicio', icon: 'Building', description: 'Reembolsos, garantías, servicios no prestados' },
  { value: 'other', label: 'Otro', icon: 'MoreHorizontal', description: 'Cualquier situación que vulnere tus derechos' },
];

export const statusConfig: Record<ClaimStatus, { label: string; variant: string; color: string }> = {
  draft: { label: 'Borrador', variant: 'secondary', color: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'En proceso', variant: 'default', color: 'bg-blue-100 text-blue-700' },
  sent: { label: 'Enviada', variant: 'default', color: 'bg-amber-100 text-amber-700' },
  resolved: { label: 'Resuelta', variant: 'default', color: 'bg-emerald-100 text-emerald-700' },
  closed: { label: 'Cerrada', variant: 'secondary', color: 'bg-muted text-muted-foreground' },
};

export const counterpartyTypes: { value: CounterpartyType; label: string }[] = [
  { value: 'person', label: 'Persona' },
  { value: 'company', label: 'Empresa' },
  { value: 'government_entity', label: 'Entidad pública' },
];

export const timelineEventLabels: Record<TimelineEventType, string> = {
  created: 'Reclamación creada',
  document_generated: 'Documento generado',
  sent: 'Documento enviado',
  response_received: 'Respuesta recibida',
  escalated: 'Caso escalado',
  resolved: 'Caso resuelto',
};

export const timelineEventColors: Record<TimelineEventType, string> = {
  created: 'bg-blue-500',
  document_generated: 'bg-primary',
  sent: 'bg-amber-500',
  response_received: 'bg-emerald-500',
  escalated: 'bg-orange-500',
  resolved: 'bg-emerald-600',
};

export const countries = [
  'Colombia', 'México', 'Argentina', 'Chile', 'Perú', 'Ecuador',
  'Venezuela', 'Bolivia', 'Paraguay', 'Uruguay', 'Costa Rica',
  'Panamá', 'Guatemala', 'Honduras', 'El Salvador', 'Nicaragua',
  'República Dominicana', 'Cuba', 'Puerto Rico', 'Brasil',
];

export const strengthConfig: Record<string, { label: string; color: string; barColor: string }> = {
  strong: { label: 'Derecho sólido', color: 'bg-emerald-100 text-emerald-700', barColor: 'bg-emerald-500' },
  moderate: { label: 'Aplicable', color: 'bg-amber-100 text-amber-700', barColor: 'bg-amber-500' },
  reference: { label: 'Referencia', color: 'bg-muted text-muted-foreground', barColor: 'bg-muted-foreground' },
};
