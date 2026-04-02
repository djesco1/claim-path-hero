import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { forgotPasswordSchema, ForgotPasswordInput } from '@/schemas';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">ClaimPath</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Recuperar contraseña</h1>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Si existe una cuenta con ese correo, recibirás las instrucciones para restablecer tu contraseña.</p>
              <Button variant="ghost" asChild><Link to="/login">Volver al inicio de sesión</Link></Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" {...register('email')} placeholder="tu@email.com" />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Enviar instrucciones
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                <Link to="/login" className="text-primary hover:underline">Volver al inicio de sesión</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
