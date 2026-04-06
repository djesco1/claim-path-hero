import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, Loader2, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { forgotPasswordSchema, ForgotPasswordInput } from '@/schemas';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { AnimatedBackground } from '@/components/shared/AnimatedBackground';
import { FloatingParticles } from '@/components/shared/FloatingParticles';
import { GlassCard } from '@/components/shared/GlassCard';
import { pageVariants, fadeInVariants } from '@/lib/motion';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSent(true);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden"
    >
      <AnimatedBackground />
      <FloatingParticles count={15} />
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        <motion.div variants={fadeInVariants} initial="hidden" animate="visible" className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Shield className="h-8 w-8 text-primary" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              ClaimPath
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Recuperar contraseña</h1>
        </motion.div>

        <GlassCard
          className="p-6 shadow-2xl"
          glow
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="mx-auto rounded-2xl bg-primary/10 p-4 w-fit"
              >
                <Mail className="h-12 w-12 text-primary" />
              </motion.div>
              <p className="text-muted-foreground">Si existe una cuenta con ese correo, recibirás las instrucciones para restablecer tu contraseña.</p>
              <Button variant="ghost" asChild><Link to="/login">Volver al inicio de sesión</Link></Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="tu@email.com"
                  className="bg-white/50 backdrop-blur-sm border-white/20 focus:border-primary/50 transition-all"
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:brightness-110 shadow-lg shadow-primary/30"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Enviar instrucciones
                </Button>
              </motion.div>
              <p className="text-center text-sm text-muted-foreground">
                <Link to="/login" className="text-primary hover:underline">Volver al inicio de sesión</Link>
              </p>
            </form>
          )}
        </GlassCard>
      </div>
    </motion.div>
  );
}
