import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, Loader2, Eye, EyeOff, Mail, Sparkles, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { registerSchema, RegisterInput } from '@/schemas';
import { countries } from '@/constants';
import { toast } from 'sonner';
import { pageVariants, fadeInVariants } from '@/lib/motion';
import { AnimatedBackground } from '@/components/shared/AnimatedBackground';
import { FloatingParticles } from '@/components/shared/FloatingParticles';
import { GlassCard } from '@/components/shared/GlassCard';
import { FEATURES } from '@/lib/config';

export default function Register() {
  const { signUp, signInWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { country: 'Colombia', acceptTerms: false },
  });

  const password = watch('password', '');
  const getStrength = (pw: string) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const strength = getStrength(password);
  const strengthLabels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
  const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-amber-400', 'bg-green-500'];

  const onSubmit = async (data: RegisterInput) => {
    try {
      await signUp(data.email, data.password, { full_name: data.full_name, country: data.country });
      setRegisteredEmail(data.email);
      setVerificationSent(true);
    } catch (error: any) {
      toast.error(error.message || 'Error al registrarse');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      const msg = error?.message || '';
      if (msg.includes('provider is not enabled') || error?.code === 'validation_failed') {
        toast.error('El inicio de sesión con Google no está disponible. Usa tu correo y contraseña.');
      } else {
        toast.error('Error al iniciar sesión con Google');
      }
    }
  };

  if (verificationSent) {
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
        
        <GlassCard className="w-full max-w-md p-8 text-center space-y-6" glow>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mx-auto rounded-2xl bg-primary/10 p-4 w-fit"
          >
            <Mail className="h-12 w-12 text-primary" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-foreground"
          >
            Verifica tu correo electrónico
          </motion.h1>
          <p className="text-muted-foreground">
            Hemos enviado un correo a <strong className="text-foreground">{registeredEmail}</strong>
          </p>
          <p className="text-sm text-muted-foreground">Haz clic en el enlace para activar tu cuenta</p>
          <p className="text-sm text-muted-foreground">
            ¿No lo recibiste?{' '}
            <button className="text-primary hover:underline font-medium" onClick={() => toast.info('Correo reenviado')}>
              Reenviar correo
            </button>
          </p>
          <Button variant="ghost" asChild>
            <Link to="/login">Volver al inicio de sesión</Link>
          </Button>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden"
    >
      <AnimatedBackground />
      <FloatingParticles count={20} />

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
          <motion.h1
            className="text-2xl font-bold text-foreground flex items-center justify-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Crea tu cuenta
            <UserPlus className="h-5 w-5 text-primary" />
          </motion.h1>
        </motion.div>

        <GlassCard
          className="p-6 shadow-2xl"
          glow
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-foreground font-medium">Nombre completo</Label>
              <Input
                id="full_name"
                {...register('full_name')}
                placeholder="Tu nombre completo"
                className="bg-white/50 backdrop-blur-sm border-white/20 focus:border-primary/50 transition-all"
              />
              {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="tu@email.com"
                className="bg-white/50 backdrop-blur-sm border-white/20 focus:border-primary/50 transition-all"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-foreground font-medium">País</Label>
              <Select defaultValue="Colombia" onValueChange={(v) => setValue('country', v)}>
                <SelectTrigger className="bg-white/50 backdrop-blur-sm border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className="bg-white/50 backdrop-blur-sm border-white/20 focus:border-primary/50 transition-all pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-white/10"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Mostrar contraseña"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {password && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          i <= strength ? strengthColors[strength] : 'bg-muted'
                        }`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: i <= strength ? 1 : 0.3 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                      />
                    ))}
                  </div>
                  {strength > 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-muted-foreground flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3" />
                      Fuerza: {strengthLabels[strength]}
                    </motion.p>
                  )}
                </div>
              )}
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                placeholder="••••••••"
                className="bg-white/50 backdrop-blur-sm border-white/20 focus:border-primary/50 transition-all"
              />
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex items-start gap-2">
              <Checkbox id="terms" onCheckedChange={(v) => setValue('acceptTerms', v === true)} />
              <Label htmlFor="terms" className="text-sm leading-relaxed text-muted-foreground">
                Acepto los{' '}
                <Link to="/terms" target="_blank" className="text-primary hover:underline">
                  Términos y Condiciones
                </Link>{' '}
                y la{' '}
                <Link to="/privacy" target="_blank" className="text-primary hover:underline">
                  Política de Privacidad
                </Link>
              </Label>
            </div>
            {errors.acceptTerms && <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>}

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:brightness-110 shadow-lg shadow-primary/30"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Crear cuenta
              </Button>
            </motion.div>
          </form>

          {/* Google OAuth - Solo mostrar si está habilitado */}
          {FEATURES.GOOGLE_OAUTH && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card/50 backdrop-blur-sm px-2 text-muted-foreground">o continúa con</span>
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="w-full bg-white/50 backdrop-blur-sm border-white/20 hover:bg-white/70"
                  type="button"
                  onClick={handleGoogleSignIn}
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continuar con Google
                </Button>
              </motion.div>
            </>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Inicia sesión
            </Link>
          </p>
        </GlassCard>
      </div>
    </motion.div>
  );
}
