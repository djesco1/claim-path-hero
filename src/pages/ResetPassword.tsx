import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, Loader2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetPasswordSchema, ResetPasswordInput } from '@/schemas';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { AnimatedBackground } from '@/components/shared/AnimatedBackground';
import { FloatingParticles } from '@/components/shared/FloatingParticles';
import { GlassCard } from '@/components/shared/GlassCard';
import { pageVariants, fadeInVariants } from '@/lib/motion';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) throw error;
      toast.success('Contraseña actualizada correctamente');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar la contraseña');
    }
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
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="mx-auto rounded-2xl bg-primary/10 p-4 w-fit mb-4"
          >
            <Lock className="h-8 w-8 text-primary" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground">Nueva contraseña</h1>
        </motion.div>
        
        <GlassCard
          className="p-6 shadow-2xl"
          glow
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className="bg-white/50 backdrop-blur-sm border-white/20 focus:border-primary/50 transition-all"
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className="bg-white/50 backdrop-blur-sm border-white/20 focus:border-primary/50 transition-all"
              />
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:brightness-110 shadow-lg shadow-primary/30"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Actualizar contraseña
              </Button>
            </motion.div>
          </form>
        </GlassCard>
      </div>
    </motion.div>
  );
}
