import { Link } from 'react-router-dom';
import { Shield, MessageSquare, ShieldCheck, Send, Home, Briefcase, Umbrella, Landmark, Building, MoreHorizontal, Star, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicNavbar } from '@/components/layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const steps = [
  { icon: MessageSquare, title: 'Describe tu situación', desc: 'Cuéntanos qué pasó con tus propias palabras. No necesitas conocer términos legales.' },
  { icon: ShieldCheck, title: 'Revisamos tus derechos', desc: 'Nuestra IA analiza tu caso e identifica las leyes que te protegen.' },
  { icon: Send, title: 'Descarga y envía', desc: 'Recibe un documento legal formal listo para enviar, con instrucciones paso a paso.' },
];

const claimTypesData = [
  { icon: Home, title: 'Arrendamiento', desc: 'Depósito no devuelto, daños injustificados, desalojo irregular' },
  { icon: Briefcase, title: 'Laboral', desc: 'Despido sin justa causa, liquidación incorrecta, acoso laboral' },
  { icon: Umbrella, title: 'Seguros', desc: 'Reclamación negada, demora injustificada, póliza mal aplicada' },
  { icon: Landmark, title: 'Entidad pública', desc: 'Derechos de petición, silencio administrativo, negación de trámites' },
  { icon: Building, title: 'Empresa/Servicio', desc: 'Reembolsos, garantías, servicios no prestados' },
  { icon: MoreHorizontal, title: 'Otros', desc: 'Cualquier situación que vulnere tus derechos' },
];

const testimonials = [
  { name: 'María F.', city: 'Bogotá', text: 'Recuperé mi depósito de $2.8M en 3 semanas. La carta que generó ClaimPath fue tomada muy en serio.', stars: 5, initials: 'MF', color: 'bg-rose-500' },
  { name: 'Andrés M.', city: 'Medellín', text: 'Mi empleador me debía 4 meses de prestaciones. Con el documento legal, llegamos a un acuerdo en 10 días.', stars: 5, initials: 'AM', color: 'bg-blue-500' },
  { name: 'Luisa C.', city: 'Cali', text: 'La EPS me había negado un procedimiento. Con el derecho de petición lo autorizaron en una semana.', stars: 4, initials: 'LC', color: 'bg-emerald-500' },
];

const freeFeatures = ['2 reclamaciones', 'Todos los tipos de reclamación', 'Generación de documento legal', 'Descarga en PDF', 'Instrucciones de envío'];
const freeDisabled = ['Recordatorios automáticos', 'Soporte prioritario', 'Reclamaciones ilimitadas'];
const proFeatures = ['Reclamaciones ilimitadas', 'Todos los tipos de reclamación', 'Generación de documento legal', 'Descarga en PDF', 'Instrucciones de envío', 'Recordatorios automáticos antes del vencimiento', 'Soporte prioritario por email', 'Historial completo de casos'];

const faqs = [
  { q: '¿Los documentos tienen validez legal?', a: 'Sí, son documentos formales redactados con base en la legislación colombiana vigente. Su validez depende de que los hechos descritos sean verídicos y del contexto específico.' },
  { q: '¿ClaimPath es un servicio de asesoría legal?', a: 'No. ClaimPath es una herramienta de asistencia documental. No reemplaza a un abogado y no constituye asesoría legal formal.' },
  { q: '¿Qué pasa si la otra parte no responde?', a: 'Las instrucciones incluyen los pasos de escalamiento correspondientes, desde organismos de control hasta instancias judiciales.' },
  { q: '¿Es confidencial mi información?', a: 'Sí. Tu información está cifrada y nunca es compartida con terceros. Solo tú tienes acceso a tus reclamaciones.' },
  { q: '¿Puedo editar el documento generado?', a: 'Por ahora el documento se genera automáticamente. Puedes copiarlo y editarlo en cualquier procesador de texto antes de enviarlo.' },
  { q: '¿Qué tipos de reclamaciones soportan?', a: 'Actualmente: arrendamiento, laboral, seguros, entidades públicas, empresas de servicios, y otros casos generales.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Hero */}
      <section className="container py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-foreground">
              Reclama lo que te corresponde.
              <br />
              <span className="text-primary">Sin abogados. Sin burocracia.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Describe tu problema en palabras simples. En minutos tendrás el documento legal correcto, listo para enviar.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild><Link to="/register">Empezar gratis</Link></Button>
              <Button size="lg" variant="outline" asChild><a href="#como-funciona">Ver cómo funciona</a></Button>
            </div>
            <div className="flex flex-wrap gap-6 pt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Basado en legislación colombiana vigente</span>
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Documentos generados con IA legal</span>
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> 100% confidencial</span>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="rounded-2xl border bg-card p-8 shadow-lg rotate-1 hover:rotate-0 transition-transform">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Documento Legal</p>
                    <p className="text-xs text-muted-foreground">Generado por ClaimPath</p>
                  </div>
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="h-3 rounded bg-muted w-full" />
                  <div className="h-3 rounded bg-muted w-5/6" />
                  <div className="h-3 rounded bg-muted w-4/6" />
                  <div className="h-3 rounded bg-muted w-full" />
                  <div className="h-3 rounded bg-muted w-3/4" />
                </div>
                <div className="flex gap-2 pt-2">
                  <span className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary font-medium">Ley 820 Art. 29</span>
                  <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs text-emerald-700 font-medium">Derecho sólido</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="bg-card border-y py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Tan simple como tres pasos</h2>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center space-y-4">
                <div className="mx-auto rounded-2xl bg-primary/10 p-4 w-fit">
                  <span className="absolute -top-2 -left-2 md:static md:mb-2 rounded-full bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center text-sm font-bold">{i + 1}</span>
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Claim Types */}
      <section id="tipos" className="container py-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">¿Cuál es tu situación?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {claimTypesData.map((ct, i) => (
            <div key={i} className="rounded-xl border bg-card p-6 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group">
              <ct.icon className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground mb-2">{ct.title}</h3>
              <p className="text-sm text-muted-foreground">{ct.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-card border-y py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Personas que recuperaron lo suyo</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="rounded-xl border bg-background p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground ${t.color}`}>{t.initials}</div>
                  <div>
                    <p className="font-medium text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.city}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">"{t.text}"</p>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} className={`h-4 w-4 ${si < t.stars ? 'text-warning fill-warning' : 'text-muted'}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="container py-20">
        <h2 className="text-3xl font-bold text-center mb-4 text-foreground">Accede a tus derechos, sin barreras</h2>
        <p className="text-center text-muted-foreground mb-12">Elige el plan que mejor se adapte a ti</p>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <div className="rounded-xl border bg-card p-8 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-foreground">Gratis</h3>
              <p className="text-sm text-muted-foreground">Para empezar</p>
            </div>
            <ul className="space-y-3">
              {freeFeatures.map(f => <li key={f} className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-success shrink-0" />{f}</li>)}
              {freeDisabled.map(f => <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground"><X className="h-4 w-4 shrink-0" />{f}</li>)}
            </ul>
            <Button variant="outline" className="w-full" asChild><Link to="/register">Empezar gratis</Link></Button>
          </div>
          {/* Pro */}
          <div className="rounded-xl border-2 border-primary bg-card p-8 space-y-6 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Más popular</span>
            <div>
              <h3 className="text-2xl font-bold text-foreground">$12<span className="text-base font-normal text-muted-foreground">/mes</span></h3>
              <p className="text-sm text-muted-foreground">Para quienes necesitan más</p>
            </div>
            <ul className="space-y-3">
              {proFeatures.map(f => <li key={f} className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-success shrink-0" />{f}</li>)}
            </ul>
            <Button className="w-full" asChild><Link to="/pricing">Empezar con Pro</Link></Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-card border-y py-20">
        <div className="container max-w-2xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Preguntas frecuentes</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border rounded-xl px-4">
                <AccordionTrigger className="text-left text-foreground">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="grid sm:grid-cols-4 gap-8 mb-8">
            <div className="sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-bold text-foreground">ClaimPath</span>
              </div>
              <p className="text-sm text-muted-foreground">Acceso a la justicia para todos.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Producto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
                <li><a href="#tipos" className="hover:text-foreground">Tipos de reclamación</a></li>
                <li><Link to="/pricing" className="hover:text-foreground">Precios</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/terms" className="hover:text-foreground">Términos y condiciones</Link></li>
                <li><Link to="/privacy" className="hover:text-foreground">Política de privacidad</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Contacto</h4>
              <p className="text-sm text-muted-foreground">contacto@claimpath.app</p>
            </div>
          </div>
          <div className="border-t pt-6 space-y-2">
            <p className="text-xs text-muted-foreground text-center">© 2024 ClaimPath. Todos los derechos reservados.</p>
            <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">ClaimPath no es un servicio de asesoría legal. Los documentos generados son orientativos y no reemplazan la consulta con un abogado.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
