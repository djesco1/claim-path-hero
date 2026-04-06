import { Link } from 'react-router-dom';
import { Shield, Check, X, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PublicNavbar } from '@/components/layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AnimatedBackground } from '@/components/shared/AnimatedBackground';
import { FloatingParticles } from '@/components/shared/FloatingParticles';
import { GlassCard } from '@/components/shared/GlassCard';
import { pageVariants, fadeInVariants, staggerContainer } from '@/lib/motion';

const freeFeatures = ['2 reclamaciones', 'Todos los tipos de reclamación', 'Generación de documento legal', 'Descarga en PDF', 'Instrucciones de envío'];
const freeDisabled = ['Recordatorios automáticos', 'Soporte prioritario', 'Reclamaciones ilimitadas'];
const proFeatures = ['Reclamaciones ilimitadas', 'Todos los tipos de reclamación', 'Generación de documento legal', 'Descarga en PDF', 'Instrucciones de envío', 'Recordatorios automáticos antes del vencimiento', 'Soporte prioritario por email', 'Historial completo de casos'];

const faqs = [
  { q: '¿Puedo cancelar en cualquier momento?', a: 'Sí, puedes cancelar tu suscripción en cualquier momento. Tu acceso Pro continuará hasta el final del período de facturación.' },
  { q: '¿Hay período de prueba?', a: 'Ofrecemos 2 reclamaciones gratuitas para que pruebes la plataforma antes de decidir si el plan Pro es para ti.' },
  { q: '¿Qué métodos de pago aceptan?', a: 'Próximamente aceptaremos tarjetas de crédito y débito a través de nuestra pasarela de pago segura.' },
];

export default function Pricing() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-background relative overflow-hidden"
    >
      <AnimatedBackground />
      <FloatingParticles count={20} />
      
      <PublicNavbar />
      <div className="container py-16 relative z-10">
        <motion.div
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-foreground mb-3">Elige tu plan</h1>
          <p className="text-muted-foreground">Accede a tus derechos sin barreras económicas</p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16"
        >
          <GlassCard className="p-8 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-foreground">Gratis</h3>
              <p className="text-sm text-muted-foreground">Para empezar</p>
            </div>
            <ul className="space-y-3">
              {freeFeatures.map(f => <li key={f} className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-success shrink-0" />{f}</li>)}
              {freeDisabled.map(f => <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground"><X className="h-4 w-4 shrink-0" />{f}</li>)}
            </ul>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" className="w-full" asChild><Link to="/register">Crear cuenta gratis</Link></Button>
            </motion.div>
          </GlassCard>

          <GlassCard className="p-8 space-y-6 relative ring-2 ring-primary/50" glow>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-purple-600 px-3 py-1 text-xs font-medium text-primary-foreground flex items-center gap-1 shadow-lg"
            >
              <Sparkles className="h-3 w-3" />
              Más popular
            </motion.span>
            <div>
              <h3 className="text-2xl font-bold text-foreground">$12<span className="text-base font-normal text-muted-foreground">/mes</span></h3>
              <p className="text-sm text-muted-foreground">Para quienes necesitan más</p>
            </div>
            <ul className="space-y-3">
              {proFeatures.map(f => <li key={f} className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-success shrink-0" />{f}</li>)}
            </ul>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:brightness-110 shadow-lg shadow-primary/30">Próximamente — Empezar con Pro</Button>
            </motion.div>
          </GlassCard>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-center mb-8 text-foreground"
          >
            Preguntas sobre precios
          </motion.h2>
          <GlassCard className="p-4">
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-b border-white/10 last:border-0">
                  <AccordionTrigger className="text-left text-foreground hover:no-underline">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
