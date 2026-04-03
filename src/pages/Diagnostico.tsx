import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Home, Briefcase, Umbrella, Landmark, Building, MoreHorizontal, Check, Loader2, AlertTriangle, Shield, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicNavbar } from '@/components/layout';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ClaimType } from '@/types';

const situationTypes = [
  { value: 'landlord_deposit' as ClaimType, label: 'Arrendamiento', emoji: '🏠', icon: Home, desc: 'Depósito, daños, desalojo' },
  { value: 'wrongful_termination' as ClaimType, label: 'Laboral', emoji: '💼', icon: Briefcase, desc: 'Despido, liquidación, acoso' },
  { value: 'insurance_denial' as ClaimType, label: 'Seguros', emoji: '🛡️', icon: Umbrella, desc: 'Reclamación negada o demorada' },
  { value: 'public_entity' as ClaimType, label: 'Entidad pública', emoji: '🏛️', icon: Landmark, desc: 'Peticiones, trámites negados' },
  { value: 'service_refund' as ClaimType, label: 'Empresa/Servicio', emoji: '🏢', icon: Building, desc: 'Reembolsos, garantías' },
  { value: 'other' as ClaimType, label: 'Otro', emoji: '📋', icon: MoreHorizontal, desc: 'Otra situación legal' },
];

const timeOptions = [
  'Menos de 15 días',
  'Entre 15 días y 1 mes',
  'Entre 1 y 3 meses',
  'Más de 3 meses',
  'Más de 1 año',
];

const evidenceOptions = [
  'Contrato firmado',
  'Mensajes de WhatsApp / correos',
  'Recibos o facturas',
  'Fotos o videos',
  'Testigos',
  'Ninguna evidencia aún',
];

const attemptOptions = [
  'No he hecho nada todavía',
  'Hablé con la otra parte, sin resultado',
  'Envié un mensaje escrito, me ignoraron',
  'Ya intenté reclamar formalmente, sin respuesta',
];

const impactOptions = [
  'Menos de $500.000 pesos',
  'Entre $500.000 y $2.000.000',
  'Entre $2.000.000 y $10.000.000',
  'Más de $10.000.000',
  'No es monetario — afecta mis derechos',
];

interface DiagnosticResult {
  viability_score: number;
  viability_label: string;
  viability_color: string;
  summary: string;
  key_rights: string[];
  recommended_action: string;
  urgency: string;
  urgency_reason: string;
  risks: string[];
  next_steps: string[];
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={cn(
          'h-2.5 w-2.5 rounded-full transition-all duration-300',
          i < current ? 'bg-primary' : i === current ? 'bg-primary animate-pulse scale-125' : 'bg-muted'
        )} />
      ))}
    </div>
  );
}

function AnswerSummary({ answers }: { answers: Record<number, any> }) {
  const labels: Record<number, string> = { 0: 'Tipo', 1: 'Tiempo', 2: 'Evidencia', 3: 'Intentos', 4: 'Impacto' };
  const entries = Object.entries(answers).filter(([_, v]) => v != null);
  if (!entries.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {entries.map(([k, v]) => (
        <span key={k} className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1 font-medium">
          {labels[Number(k)]}: {Array.isArray(v) ? v.length + ' sel.' : typeof v === 'object' ? v.label : v}
        </span>
      ))}
    </div>
  );
}

export default function Diagnostico() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  const setAnswer = (val: any) => {
    setAnswers(prev => ({ ...prev, [step]: val }));
  };

  const canProceed = answers[step] != null && (step !== 2 || (Array.isArray(answers[2]) && answers[2].length > 0));

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      await runDiagnostic();
    }
  };

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      // Build a local diagnostic result (no edge function needed for basic assessment)
      const type = answers[0]?.value || 'other';
      const time = answers[1] || '';
      const evidence = answers[2] || [];
      const attempts = answers[3] || '';
      const impact = answers[4] || '';

      // Calculate viability score based on answers
      let score = 50;
      
      // Evidence boosts score
      if (evidence.includes('Contrato firmado')) score += 15;
      if (evidence.includes('Mensajes de WhatsApp / correos')) score += 10;
      if (evidence.includes('Recibos o facturas')) score += 10;
      if (evidence.includes('Fotos o videos')) score += 5;
      if (evidence.includes('Testigos')) score += 5;
      if (evidence.includes('Ninguna evidencia aún')) score -= 15;

      // Time affects urgency but not viability much
      if (time === 'Más de 1 año') score -= 10;
      
      // Previous attempts show effort
      if (attempts.includes('mensaje escrito') || attempts.includes('formalmente')) score += 5;

      score = Math.max(15, Math.min(95, score));

      const viability_label = score >= 70 ? 'Caso sólido' : score >= 40 ? 'Caso viable' : 'Caso difícil';
      const viability_color = score >= 70 ? 'green' : score >= 40 ? 'amber' : 'red';

      const diagnosticResult: DiagnosticResult = {
        viability_score: score,
        viability_label,
        viability_color,
        summary: score >= 70
          ? 'Tu situación tiene fundamentos legales claros. Con la documentación adecuada, tienes buenas posibilidades de obtener una resolución favorable.'
          : score >= 40
          ? 'Tu caso tiene mérito legal, aunque podrían existir algunos obstáculos. Es recomendable fortalecer tu evidencia antes de proceder.'
          : 'Este caso presenta desafíos significativos. Te recomendamos consultar con un abogado antes de proceder formalmente.',
        key_rights: type === 'landlord_deposit'
          ? ['Derecho a devolución de depósito (Ley 820, Art. 29)', 'Derecho a intereses moratorios por retención']
          : type === 'wrongful_termination'
          ? ['Derecho a indemnización por despido sin justa causa (CST Art. 64)', 'Derecho a liquidación completa (CST Art. 65)']
          : type === 'insurance_denial'
          ? ['Derecho a respuesta en 30 días hábiles (C. Comercio Art. 1080)', 'Silencio positivo en reclamaciones de seguros']
          : type === 'public_entity'
          ? ['Derecho de petición (Ley 1437, Art. 14)', 'Silencio administrativo positivo (Ley 1437, Art. 83)']
          : type === 'service_refund'
          ? ['Derecho a devolución (Ley 1480, Art. 7)', 'Garantía legal mínima (Ley 1480, Art. 8)']
          : ['Derecho a reclamar por vía administrativa o judicial'],
        recommended_action: score >= 50 ? 'formal_claim' : 'consult_lawyer',
        urgency: time === 'Más de 3 meses' || time === 'Más de 1 año' ? 'high' : time === 'Entre 1 y 3 meses' ? 'medium' : 'low',
        urgency_reason: time === 'Más de 3 meses' || time === 'Más de 1 año'
          ? 'Han pasado más de 3 meses. Algunos plazos legales podrían estar por vencer.'
          : 'Estás dentro de los plazos legales recomendados.',
        risks: evidence.includes('Ninguna evidencia aún')
          ? ['Sin evidencia documental el proceso es más difícil', 'Podrías necesitar testigos o pruebas adicionales']
          : ['Verifica que toda tu documentación esté vigente'],
        next_steps: [
          'Reúne toda la documentación relevante',
          'Organiza los hechos en orden cronológico',
          score >= 50 ? 'Genera tu reclamación formal con ClaimPath' : 'Considera consultar con un abogado especializado',
          'Guarda copias de toda la comunicación',
        ],
      };

      setResult(diagnosticResult);

      // Save to DB
      const sessionId = sessionStorage.getItem('claimpath_session') || crypto.randomUUID();
      sessionStorage.setItem('claimpath_session', sessionId);

      await supabase.from('diagnostics').insert({
        user_id: user?.id || null,
        session_id: sessionId,
        answers: answers as any,
        result: diagnosticResult as any,
      } as any);

      // Animate score
      setStep(5);
      let current = 0;
      const target = diagnosticResult.viability_score;
      const interval = setInterval(() => {
        current += 2;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        setAnimatedScore(current);
      }, 15);

    } catch (err) {
      toast.error('Error al procesar el diagnóstico');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = result?.viability_color === 'green' ? 'text-emerald-600' : result?.viability_color === 'amber' ? 'text-amber-600' : 'text-red-600';
  const scoreRing = result?.viability_color === 'green' ? 'stroke-emerald-500' : result?.viability_color === 'amber' ? 'stroke-amber-500' : 'stroke-red-500';

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        {/* Background */}
        <div className="absolute inset-0 hero-base-gradient" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(79,70,229,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative z-10 w-full max-w-2xl">
          {step < 5 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-card border shadow-2xl shadow-primary/10 p-8"
            >
              <ProgressDots current={step} total={5} />
              <AnswerSummary answers={answers} />

              <AnimatePresence mode="wait">
                {/* Q1: Situation type */}
                {step === 0 && (
                  <motion.div key="q0" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="mt-6 space-y-4">
                    <h2 className="text-xl font-bold text-foreground">¿Qué tipo de problema tienes?</h2>
                    <p className="text-sm text-muted-foreground">Selecciona el que más se acerca a tu situación</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {situationTypes.map(st => {
                        const selected = answers[0]?.value === st.value;
                        return (
                          <button key={st.value} onClick={() => setAnswer(st)} className={cn(
                            'rounded-xl border p-4 text-left transition-all hover:shadow-md hover:border-primary/50',
                            selected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'bg-card'
                          )}>
                            <div className="flex items-start justify-between">
                              <span className="text-2xl">{st.emoji}</span>
                              {selected && <Check className="h-4 w-4 text-primary" />}
                            </div>
                            <h3 className="font-semibold text-foreground mt-2 text-sm">{st.label}</h3>
                            <p className="text-xs text-muted-foreground">{st.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Q2: Time */}
                {step === 1 && (
                  <motion.div key="q1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="mt-6 space-y-4">
                    <h2 className="text-xl font-bold text-foreground">¿Cuánto tiempo lleva este problema sin resolverse?</h2>
                    <div className="flex flex-wrap gap-2">
                      {timeOptions.map(opt => (
                        <button key={opt} onClick={() => setAnswer(opt)} className={cn(
                          'rounded-full border px-4 py-2.5 text-sm font-medium transition-all',
                          answers[1] === opt ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:border-primary/50'
                        )}>{opt}</button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Q3: Evidence */}
                {step === 2 && (
                  <motion.div key="q2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="mt-6 space-y-4">
                    <h2 className="text-xl font-bold text-foreground">¿Qué evidencia tienes de la situación?</h2>
                    <p className="text-sm text-muted-foreground">Selecciona todo lo que aplique</p>
                    <div className="flex flex-wrap gap-2">
                      {evidenceOptions.map(opt => {
                        const selected = (answers[2] || []).includes(opt);
                        return (
                          <button key={opt} onClick={() => {
                            const current = answers[2] || [];
                            setAnswer(selected ? current.filter((v: string) => v !== opt) : [...current, opt]);
                          }} className={cn(
                            'rounded-full border px-4 py-2.5 text-sm font-medium transition-all',
                            selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:border-primary/50'
                          )}>
                            {selected && <Check className="h-3 w-3 inline mr-1" />}{opt}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Q4: Previous attempts */}
                {step === 3 && (
                  <motion.div key="q3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="mt-6 space-y-4">
                    <h2 className="text-xl font-bold text-foreground">¿Has intentado resolver esto antes?</h2>
                    <div className="space-y-2">
                      {attemptOptions.map(opt => (
                        <button key={opt} onClick={() => setAnswer(opt)} className={cn(
                          'w-full rounded-xl border p-4 text-left text-sm transition-all',
                          answers[3] === opt ? 'bg-primary/5 border-primary ring-2 ring-primary/20 font-medium' : 'bg-card hover:border-primary/50'
                        )}>{opt}</button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Q5: Impact */}
                {step === 4 && (
                  <motion.div key="q4" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="mt-6 space-y-4">
                    <h2 className="text-xl font-bold text-foreground">¿Qué tanto te afecta esta situación?</h2>
                    <div className="space-y-2">
                      {impactOptions.map(opt => (
                        <button key={opt} onClick={() => setAnswer(opt)} className={cn(
                          'w-full rounded-xl border p-4 text-left text-sm transition-all',
                          answers[4] === opt ? 'bg-primary/5 border-primary ring-2 ring-primary/20 font-medium' : 'bg-card hover:border-primary/50'
                        )}>{opt}</button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                <Button variant="ghost" onClick={() => step > 0 ? setStep(step - 1) : navigate('/')} disabled={loading}>
                  <ArrowLeft className="h-4 w-4 mr-1" />{step === 0 ? 'Inicio' : 'Atrás'}
                </Button>
                <Button onClick={handleNext} disabled={!canProceed || loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {step === 4 ? 'Ver diagnóstico' : 'Siguiente'}
                  {step < 4 && <ArrowRight className="h-4 w-4 ml-1" />}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Results */}
          {step === 5 && result && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="rounded-2xl bg-card border shadow-2xl shadow-primary/10 p-8 text-center">
                <h2 className="text-2xl font-bold text-foreground mb-6">Tu diagnóstico</h2>
                
                {/* Circular score */}
                <div className="relative mx-auto w-40 h-40 mb-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" className={scoreRing} strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${(animatedScore / 100) * 264} 264`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn('text-4xl font-bold', scoreColor)}>{animatedScore}</span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>

                <span className={cn('inline-block rounded-full px-4 py-1.5 text-sm font-semibold',
                  result.viability_color === 'green' ? 'bg-emerald-100 text-emerald-700' :
                  result.viability_color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                )}>{result.viability_label}</span>

                <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto">{result.summary}</p>
              </div>

              {/* Urgency */}
              {result.urgency !== 'low' && (
                <div className={cn('rounded-xl border p-4 flex items-start gap-3',
                  result.urgency === 'high' ? 'bg-red-50 border-red-200 dark:bg-red-950/20' : 'bg-amber-50 border-amber-200 dark:bg-amber-950/20'
                )}>
                  <AlertTriangle className={cn('h-5 w-5 shrink-0 mt-0.5', result.urgency === 'high' ? 'text-red-600' : 'text-amber-600')} />
                  <div>
                    <p className={cn('text-sm font-medium', result.urgency === 'high' ? 'text-red-700' : 'text-amber-700')}>
                      {result.urgency === 'high' ? 'Urgencia alta' : 'Urgencia media'}
                    </p>
                    <p className="text-xs text-muted-foreground">{result.urgency_reason}</p>
                  </div>
                </div>
              )}

              {/* Rights */}
              <div className="rounded-xl bg-card border p-6">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Tus derechos aplicables</h3>
                <div className="flex flex-wrap gap-2">
                  {result.key_rights.map((r, i) => (
                    <span key={i} className="rounded-lg bg-primary/10 text-primary text-xs px-3 py-1.5 font-medium">{r}</span>
                  ))}
                </div>
              </div>

              {/* Risks */}
              {result.risks.length > 0 && (
                <div className="rounded-xl bg-card border p-6">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Riesgos a considerar</h3>
                  <div className="space-y-2">
                    {result.risks.map((r, i) => (
                      <div key={i} className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-700 dark:text-amber-300">{r}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next steps */}
              <div className="rounded-xl bg-card border p-6">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary" /> Próximos pasos recomendados</h3>
                <ol className="space-y-2">
                  {result.next_steps.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="rounded-full bg-primary text-primary-foreground h-5 w-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-foreground">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-xl" onClick={() => {
                  const type = answers[0]?.value;
                  navigate('/claims/new', { state: { prefilledType: type } });
                }}>
                  Crear mi reclamación ahora <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-xl" onClick={() => navigate('/register')}>
                  Guardar diagnóstico
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
