  import { Link } from 'react-router-dom';
import { Shield, MessageSquare, ShieldCheck, Send, Home, Briefcase, Umbrella, Landmark, Building, MoreHorizontal, Star, Check, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicNavbar } from '@/components/layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/shared/AnimatedBackground';
import { FloatingParticles } from '@/components/shared/FloatingParticles';
import { LegalOwl } from '@/components/shared/LegalOwl';
import { GlassCard } from '@/components/shared/GlassCard';
import { PremiumButton } from '@/components/shared/PremiumButton';
import { useTypewriter } from '@/hooks/useTypewriter';
import { pageVariants } from '@/lib/motion';

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

function HeroBackground() {
  return (
    <>
      {/* Layer 1: Base gradient */}
      <div className="absolute inset-0 z-0 hero-base-gradient" />

      {/* Layer 2: Animated mesh blobs */}
      <svg className="absolute inset-0 z-[1] w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 800">
        <defs>
          <filter id="mesh-blur">
            <feGaussianBlur stdDeviation="80" />
          </filter>
        </defs>
        <circle className="hero-blob-1" cx="200" cy="300" r="180" fill="#4F46E5" opacity="0.14" filter="url(#mesh-blur)" />
        <circle className="hero-blob-2" cx="800" cy="200" r="150" fill="#7C3AED" opacity="0.12" filter="url(#mesh-blur)" />
        <circle className="hero-blob-3" cx="600" cy="500" r="200" fill="#06B6D4" opacity="0.10" filter="url(#mesh-blur)" />
        <circle className="hero-blob-4" cx="1000" cy="600" r="160" fill="#10B981" opacity="0.12" filter="url(#mesh-blur)" />
        <circle className="hero-blob-5" cx="400" cy="700" r="140" fill="#4F46E5" opacity="0.08" filter="url(#mesh-blur)" />
        <circle className="hero-blob-6" cx="900" cy="400" r="170" fill="#7C3AED" opacity="0.10" filter="url(#mesh-blur)" />
      </svg>

      {/* Layer 3: Dot grid */}
      <div className="absolute inset-0 z-[2]" style={{
        backgroundImage: 'radial-gradient(circle, rgba(79,70,229,0.12) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Layer 4: Scales of justice watermark */}
      <svg className="absolute z-[1] opacity-[0.04] hero-scales-rotate" style={{ right: '-40px', top: '50%', transform: 'translateY(-50%)', width: '500px', height: '500px' }} viewBox="0 0 512 512" fill="#4F46E5">
        <path d="M256 32c-8.8 0-16 7.2-16 16v16H112c-8.8 0-16 7.2-16 16s7.2 16 16 16h12.7l-53.4 160c-1.5 4.4-0.8 9.3 1.8 13.1C85.5 288 115.5 320 176 320s90.5-32 102.9-50.9c2.6-3.8 3.3-8.7 1.8-13.1L227.3 96H240v320h-64c-8.8 0-16 7.2-16 16s7.2 16 16 16h160c8.8 0 16-7.2 16-16s-7.2-16-16-16h-64V96h12.7l-53.4 160c-1.5 4.4-0.8 9.3 1.8 13.1C245.5 288 275.5 320 336 320s90.5-32 102.9-50.9c2.6-3.8 3.3-8.7 1.8-13.1L387.3 96H400c8.8 0 16-7.2 16-16s-7.2-16-16-16H272V48c0-8.8-7.2-16-16-16zM176 288c-32.5 0-55.5-16-68-28l68-204 68 204c-12.5 12-35.5 28-68 28zm160 0c-32.5 0-55.5-16-68-28l68-204 68 204c-12.5 12-35.5 28-68 28z"/>
      </svg>

      {/* Layer 5: Noise texture */}
      <div className="absolute inset-0 z-[3] opacity-[0.025] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Particles */}
      <div className="absolute inset-0 z-[2] pointer-events-none hidden md:block">
        {/* Diamonds */}
        <div className="hero-particle" style={{ top: '15%', left: '8%', width: '4px', height: '4px', background: '#4F46E5', transform: 'rotate(45deg)', animationDuration: '8s' }} />
        <div className="hero-particle" style={{ top: '70%', left: '15%', width: '4px', height: '4px', background: '#7C3AED', transform: 'rotate(45deg)', animationDuration: '10s', animationDelay: '2s' }} />
        <div className="hero-particle" style={{ top: '25%', left: '85%', width: '4px', height: '4px', background: '#06B6D4', transform: 'rotate(45deg)', animationDuration: '7s', animationDelay: '1s' }} />
        <div className="hero-particle" style={{ top: '80%', left: '75%', width: '4px', height: '4px', background: '#10B981', transform: 'rotate(45deg)', animationDuration: '9s', animationDelay: '3s' }} />
        <div className="hero-particle" style={{ top: '45%', left: '5%', width: '4px', height: '4px', background: '#4F46E5', transform: 'rotate(45deg)', animationDuration: '11s', animationDelay: '4s' }} />
        <div className="hero-particle" style={{ top: '60%', left: '92%', width: '4px', height: '4px', background: '#7C3AED', transform: 'rotate(45deg)', animationDuration: '6s', animationDelay: '5s' }} />
        {/* Circles */}
        <div className="hero-particle" style={{ top: '20%', left: '40%', width: '6px', height: '6px', background: '#06B6D4', borderRadius: '50%', animationDuration: '9s', animationDelay: '1.5s' }} />
        <div className="hero-particle" style={{ top: '55%', left: '60%', width: '6px', height: '6px', background: '#10B981', borderRadius: '50%', animationDuration: '12s', animationDelay: '3.5s' }} />
        <div className="hero-particle" style={{ top: '35%', left: '70%', width: '6px', height: '6px', background: '#4F46E5', borderRadius: '50%', animationDuration: '8s', animationDelay: '0.5s' }} />
        <div className="hero-particle" style={{ top: '75%', left: '50%', width: '6px', height: '6px', background: '#7C3AED', borderRadius: '50%', animationDuration: '10s', animationDelay: '2.5s' }} />
        {/* Lines */}
        <div className="hero-particle" style={{ top: '30%', left: '25%', width: '20px', height: '2px', background: '#4F46E5', animationDuration: '7s', animationDelay: '4s' }} />
        <div className="hero-particle" style={{ top: '65%', left: '80%', width: '20px', height: '2px', background: '#06B6D4', animationDuration: '11s', animationDelay: '1s' }} />
      </div>
    </>
  );
}

export default function Landing() {
  const { displayedText, showCursor } = useTypewriter({
    text: 'Sin abogados. Sin burocracia.',
    speed: 45,
    delay: 1200,
  });

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-background"
    >
      {/* Fondo animado profesional */}
      <AnimatedBackground />
      <FloatingParticles count={25} />
      
      {/* Mascota búho */}
      <LegalOwl />
      
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        <HeroBackground />

        <div className="container relative z-10 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left column */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-[#C7D2FE] bg-white/80 backdrop-blur-sm px-4 py-1.5 text-[13px] font-medium text-[#4F46E5]">
                  <span className="text-[#6366F1]">✦</span> IA Legal • Colombia
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-[clamp(2.4rem,4.5vw,3.8rem)] font-extrabold leading-[1.1] tracking-tight text-foreground"
              >
                Reclama lo que te corresponde.
                <br />
                <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
                  {displayedText}
                  {showCursor && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.53, repeat: Infinity, repeatType: 'reverse' }}
                      className="inline-block w-1 h-12 bg-primary ml-1 align-middle"
                    />
                  )}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-lg text-muted-foreground leading-relaxed max-w-[480px]"
              >
                Describe tu problema en palabras simples. En minutos tendrás el documento legal correcto, listo para enviar.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex flex-wrap gap-4 pt-2"
              >
                <Link to="/register">
                  <PremiumButton size="lg">
                    Empezar gratis <ArrowRight className="ml-2 h-4 w-4" />
                  </PremiumButton>
                </Link>
                <a href="#como-funciona">
                  <PremiumButton size="lg" variant="secondary">
                    Ver cómo funciona
                  </PremiumButton>
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex flex-wrap gap-6 pt-4 text-sm text-muted-foreground"
              >
                <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#4F46E5]" /> Basado en ley colombiana</span>
                <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#4F46E5]" /> Documentos con IA legal</span>
                <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#4F46E5]" /> 100% confidencial</span>
              </motion.div>
            </div>

            {/* Right column — document card + floating badges */}
            <div className="hidden lg:block relative h-[480px]">
              {/* Background glow */}
              <div className="absolute -inset-[60px] bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.08),transparent_70%)] z-0" />

              {/* Floating Badge: Ley */}
              <span className="absolute top-4 right-[-16px] z-10 pointer-events-none rounded-full px-3.5 py-1.5 text-xs font-semibold bg-white border border-[#C7D2FE] text-[#4338CA] shadow-[0_4px_12px_rgba(79,70,229,0.15)] animate-float-b">
                Ley 820 Art. 29
              </span>

              {/* Floating Badge: PDF */}
              <span className="absolute bottom-20 right-[-24px] z-10 pointer-events-none rounded-full px-3.5 py-1.5 text-xs font-semibold bg-white border border-[#FDE68A] text-[#D97706] shadow-[0_4px_12px_rgba(245,158,11,0.15)] animate-float-c">
                PDF listo ✓
              </span>

              {/* Floating Badge: Derecho */}
              <span className="absolute bottom-5 left-[-16px] z-10 pointer-events-none rounded-full px-3.5 py-1.5 text-xs font-semibold bg-white border border-[#A7F3D0] text-[#059669] shadow-[0_4px_12px_rgba(16,185,129,0.15)] animate-float-a">
                Derecho sólido ✓
              </span>

              {/* Main card con glassmorphism */}
              <GlassCard
                className="absolute inset-10 p-7 z-[5]"
                glow
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: [0, -8, 0],
                }}
                transition={{ 
                  opacity: { duration: 0.5, delay: 0.3 },
                  scale: { duration: 0.5, delay: 0.3 },
                  y: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="rounded-full bg-primary/10 p-2.5">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-[15px] text-foreground">Documento Legal</p>
                    <p className="text-[13px] text-muted-foreground">Generado por ClaimPath</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {[85, 92, 78, 95, 65].map((w, i) => (
                    <motion.div
                      key={i}
                      className="h-2 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20"
                      initial={{ width: 0 }}
                      animate={{ width: `${w}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                    />
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="bg-[#FAFAFA] dark:bg-card border-y py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Tan simple como tres pasos</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center space-y-4"
              >
                <div className="mx-auto rounded-2xl bg-primary/10 p-4 w-fit">
                  <span className="absolute -top-2 -left-2 md:static md:mb-2 rounded-full bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center text-sm font-bold">{i + 1}</span>
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Claim Types */}
      <section id="tipos" className="container py-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">¿Cuál es tu situación?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {claimTypesData.map((ct, i) => (
            <GlassCard
              key={i}
              className="p-6 cursor-pointer group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <ct.icon className="h-10 w-10 text-primary mb-4" />
              </motion.div>
              <h3 className="font-semibold text-foreground mb-2">{ct.title}</h3>
              <p className="text-sm text-muted-foreground">{ct.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#F8FAFC] dark:bg-card border-y py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Personas que recuperaron lo suyo</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border bg-background p-6 space-y-4"
              >
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="container py-20">
        <h2 className="text-3xl font-bold text-center mb-4 text-foreground">Accede a tus derechos, sin barreras</h2>
        <p className="text-center text-muted-foreground mb-12">Elige el plan que mejor se adapte a ti</p>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
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
      <section id="faq" className="bg-[#FAFAFA] dark:bg-card border-y py-20">
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

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />
        </div>
        <div className="container relative z-10 text-center space-y-6">
          <h2 className="text-3xl font-bold text-white">¿Listo para reclamar lo tuyo?</h2>
          <p className="text-white/80 text-lg max-w-lg mx-auto">Miles de personas ya recuperaron lo que les correspondía. Tu turno.</p>
          <Button size="lg" asChild className="bg-white text-[#4F46E5] hover:bg-white/90 rounded-xl px-8 py-3.5 font-semibold shadow-lg">
            <Link to="/register">Empezar gratis <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white py-12">
        <div className="container">
          <div className="grid sm:grid-cols-4 gap-8 mb-8">
            <div className="sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-[#818CF8]" />
                <span className="font-bold">ClaimPath</span>
              </div>
              <p className="text-sm text-slate-400">Acceso a la justicia para todos.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Producto</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><a href="#tipos" className="hover:text-white transition-colors">Tipos de reclamación</a></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Precios</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/terms" className="hover:text-white transition-colors">Términos y condiciones</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Política de privacidad</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Contacto</h4>
              <p className="text-sm text-slate-400">contacto@claimpath.app</p>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 space-y-2">
            <p className="text-xs text-slate-500 text-center">© 2024 ClaimPath. Todos los derechos reservados.</p>
            <p className="text-xs text-slate-500 text-center max-w-2xl mx-auto">ClaimPath no es un servicio de asesoría legal. Los documentos generados son orientativos y no reemplazan la consulta con un abogado.</p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
