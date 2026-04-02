import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Check, Shield, Loader2, Home, Briefcase, Umbrella, Landmark, Building, MoreHorizontal } from 'lucide-react';
import VoiceInput from '@/components/voice/VoiceInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AppLayout } from '@/components/layout';
import { ClaimTypeBadge, ConfirmDialog } from '@/components/shared';
import { claimTypes, counterpartyTypes } from '@/constants';
import { newClaimStep2Schema, NewClaimStep2Input } from '@/schemas';
import { ClaimType, NewClaimData } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';

const iconMap: Record<string, typeof Home> = {
  Home, Briefcase, Umbrella, Landmark, Building, MoreHorizontal,
};

export default function NewClaim() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<ClaimType | null>(null);
  const [exitConfirm, setExitConfirm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<NewClaimStep2Input>({
    resolver: zodResolver(newClaimStep2Schema),
    defaultValues: { counterparty_type: 'company' },
  });

  const description = watch('situation_description', '');
  const atLimit = profile?.plan === 'free' && (profile?.claims_used || 0) >= 2;

  const handleStep2Submit = (data: NewClaimStep2Input) => {
    setStep(3);
  };

  const handleGenerate = async () => {
    if (!selectedType || !user) return;
    const formData = watch();

    setStep(4);
    setGenerating(true);

    // Animated steps
    setGenStep(1);
    await new Promise(r => setTimeout(r, 2000));
    setGenStep(2);
    await new Promise(r => setTimeout(r, 2000));
    setGenStep(3);

    try {
      const { data, error } = await supabase.functions.invoke('generate-claim', {
        body: {
          claim_type: selectedType,
          situation_description: formData.situation_description,
          counterparty_name: formData.counterparty_name,
          counterparty_type: formData.counterparty_type,
          amount_involved: formData.amount_involved || null,
          incident_date: formData.incident_date,
          country: profile?.country || 'Colombia',
        },
      });

      if (error) throw error;

      await refreshProfile();
      toast.success('¡Tu reclamación ha sido generada!');
      navigate(`/claims/${data.id}`);
    } catch (error: any) {
      if (error?.message?.includes('PLAN_LIMIT_REACHED')) {
        toast.error('Has alcanzado el límite de tu plan gratuito');
        navigate('/pricing');
      } else {
        toast.error('Error al generar la reclamación');
        setStep(3);
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Paso {step} de 4</p>
            {step > 1 && step < 4 && (
              <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-4 w-4 mr-1" />Atrás
              </Button>
            )}
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">¿Cuál es tu situación?</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {claimTypes.map(ct => {
                const Icon = iconMap[ct.icon];
                const selected = selectedType === ct.value;
                return (
                  <button
                    key={ct.value}
                    onClick={() => setSelectedType(ct.value)}
                    className={cn(
                      'rounded-xl border p-6 text-left transition-all hover:shadow-sm',
                      selected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'bg-card hover:border-primary/30'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <Icon className="h-10 w-10 text-primary mb-3" />
                      {selected && <Check className="h-5 w-5 text-primary" />}
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{ct.label}</h3>
                    <p className="text-sm text-muted-foreground">{ct.description}</p>
                  </button>
                );
              })}
            </div>
            <Button className="w-full" disabled={!selectedType} onClick={() => setStep(2)}>
              Siguiente <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Cuéntanos qué pasó</h2>
            <div className="grid lg:grid-cols-3 gap-6">
              <form onSubmit={handleSubmit(handleStep2Submit)} className="lg:col-span-2 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="situation">Describe tu situación con el mayor detalle posible</Label>
                    <VoiceInput onTranscript={(text) => {
                      const current = watch('situation_description') || '';
                      const newValue = current ? `${current} ${text}` : text;
                      setValue('situation_description', newValue, { shouldDirty: true, shouldValidate: true });
                    }} />
                  </div>
                  <Textarea id="situation" {...register('situation_description')} className="min-h-[180px]" maxLength={5000} />
                  <p className={cn('text-xs', description.length < 100 ? 'text-destructive' : 'text-muted-foreground')}>
                    {description.length}/5000 caracteres {description.length < 100 && '(mínimo 100)'}
                  </p>
                  {errors.situation_description && <p className="text-sm text-destructive">{errors.situation_description.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="counterparty">Nombre de la contraparte</Label>
                  <Input id="counterparty" {...register('counterparty_name')} placeholder="Nombre o razón social" />
                  {errors.counterparty_name && <p className="text-sm text-destructive">{errors.counterparty_name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Tipo de contraparte</Label>
                  <Controller
                    control={control}
                    name="counterparty_type"
                    render={({ field }) => (
                      <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4">
                        {counterpartyTypes.map(ct => (
                          <div key={ct.value} className="flex items-center gap-2">
                            <RadioGroupItem value={ct.value} id={ct.value} />
                            <Label htmlFor={ct.value} className="font-normal">{ct.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Monto involucrado (opcional)</Label>
                  <Input id="amount" type="number" {...register('amount_involved', { valueAsNumber: true })} placeholder="0" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Fecha del incidente</Label>
                  <Input id="date" type="date" {...register('incident_date')} max={new Date().toISOString().split('T')[0]} />
                  {errors.incident_date && <p className="text-sm text-destructive">{errors.incident_date.message}</p>}
                </div>

                <Button type="submit" className="w-full">Siguiente <ArrowRight className="h-4 w-4 ml-2" /></Button>
              </form>

              <div className="hidden lg:block">
                <div className="sticky top-24 rounded-xl border bg-card p-5 space-y-3">
                  <h4 className="font-semibold text-sm text-foreground">Consejos para una mejor reclamación</h4>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li>📅 Incluye fechas exactas de los hechos</li>
                    <li>👤 Menciona nombres completos y NIT/cédula si los tienes</li>
                    <li>💰 Describe el monto exacto en pesos</li>
                    <li>📨 Indica qué respuesta has recibido hasta ahora</li>
                    <li>📝 Cuantos más detalles, mejor será el documento</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 - Review */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Revisa tu información</h2>
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Tipo</p>
                <ClaimTypeBadge type={selectedType!} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Situación</p>
                <p className="text-sm text-foreground line-clamp-3">{watch('situation_description')}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Contraparte</p>
                <p className="text-sm text-foreground">{watch('counterparty_name')}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Monto</p>
                <p className="text-sm text-foreground">{watch('amount_involved') ? formatCurrency(watch('amount_involved')!) : 'No especificado'}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Fecha</p>
                <p className="text-sm text-foreground">{watch('incident_date') ? formatDate(watch('incident_date')) : '-'}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep(2)}>Editar información</Button>
            </div>

            {atLimit ? (
              <div className="rounded-xl border border-warning bg-warning/10 p-4 text-center space-y-3">
                <p className="font-medium text-foreground">Has alcanzado el límite de tu plan gratuito</p>
                <Button asChild><a href="/pricing">Actualizar a Pro</a></Button>
              </div>
            ) : (
              <Button className="w-full" size="lg" onClick={handleGenerate}>
                Generar documento
              </Button>
            )}
          </div>
        )}

        {/* Step 4 - Generating */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center py-20 space-y-8">
            <Shield className="h-16 w-16 text-primary animate-pulse-slow" />
            <div className="space-y-4 text-center">
              {[
                'Analizando tu situación...',
                'Identificando tus derechos aplicables...',
                'Redactando tu documento legal...',
              ].map((msg, i) => (
                <div key={i} className={cn('flex items-center gap-3 transition-opacity', genStep > i ? 'opacity-100' : genStep === i ? 'opacity-100' : 'opacity-30')}>
                  {genStep > i + 1 ? <Check className="h-5 w-5 text-success" /> : genStep === i + 1 ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <div className="h-5 w-5" />}
                  <p className="text-sm text-foreground">{msg}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={exitConfirm}
        onOpenChange={setExitConfirm}
        title="¿Seguro que quieres salir?"
        description="Perderás la información ingresada en este formulario."
        confirmLabel="Salir"
        destructive
        onConfirm={() => navigate('/dashboard')}
      />
    </AppLayout>
  );
}
