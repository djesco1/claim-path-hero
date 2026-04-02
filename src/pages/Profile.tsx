import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { profileSchema, ProfileInput, changePasswordSchema, ChangePasswordInput } from '@/schemas';
import { countries } from '@/constants';
import { getInitials, getInitialsColor, cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Profile() {
  const { profile, updateProfile } = useAuth();

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting, isDirty } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    values: profile ? { full_name: profile.full_name, country: profile.country } : undefined,
  });

  const { register: registerPw, handleSubmit: handleSubmitPw, formState: { errors: pwErrors, isSubmitting: pwSubmitting }, reset: resetPw } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSaveProfile = async (data: ProfileInput) => {
    try {
      await updateProfile(data);
      toast.success('Perfil actualizado');
    } catch {
      toast.error('Error al actualizar');
    }
  };

  const onChangePw = async (data: ChangePasswordInput) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: data.newPassword });
      if (error) throw error;
      toast.success('Contraseña actualizada');
      resetPw();
    } catch (e: any) {
      toast.error(e.message || 'Error al cambiar contraseña');
    }
  };

  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  if (!profile) return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-2xl mx-auto flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Mi perfil</h1>

        {/* Personal Info */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <div className={cn('h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold text-primary-foreground', getInitialsColor(profile.full_name))}>
              {getInitials(profile.full_name)}
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{profile.full_name}</h2>
              <p className="text-sm text-muted-foreground capitalize">Plan {profile.plan}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre completo</Label>
              <Input {...register('full_name')} />
              {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>País</Label>
              <Select defaultValue={profile.country} onValueChange={v => setValue('country', v, { shouldDirty: true })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={!isDirty || isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Guardar cambios
            </Button>
          </form>
        </div>

        {/* Appearance */}
        <AppearanceSection />

        {/* Security */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Seguridad</h3>
          <form onSubmit={handleSubmitPw(onChangePw)} className="space-y-4">
            <div className="space-y-2">
              <Label>Contraseña actual</Label>
              <Input type="password" {...registerPw('currentPassword')} />
              {pwErrors.currentPassword && <p className="text-sm text-destructive">{pwErrors.currentPassword.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Nueva contraseña</Label>
              <Input type="password" {...registerPw('newPassword')} />
              {pwErrors.newPassword && <p className="text-sm text-destructive">{pwErrors.newPassword.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Confirmar nueva contraseña</Label>
              <Input type="password" {...registerPw('confirmNewPassword')} />
              {pwErrors.confirmNewPassword && <p className="text-sm text-destructive">{pwErrors.confirmNewPassword.message}</p>}
            </div>
            <Button type="submit" disabled={pwSubmitting}>
              {pwSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Cambiar contraseña
            </Button>
          </form>
        </div>

        {/* Plan */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Plan y uso</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Plan actual</span>
              <span className="text-sm font-medium capitalize text-foreground">{profile.plan}</span>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Reclamaciones usadas</span>
                <span className="text-foreground">{profile.claims_used}/{profile.plan === 'free' ? '2' : '∞'}</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${profile.plan === 'free' ? (profile.claims_used / 2) * 100 : 30}%` }} />
              </div>
            </div>
            {profile.plan === 'free' && <Button variant="outline" size="sm" asChild><a href="/pricing">Actualizar a Pro</a></Button>}
          </div>
        </div>

        {/* Danger */}
        <div className="rounded-xl border border-destructive bg-card p-6">
          <h3 className="font-semibold text-destructive mb-2">Zona de peligro</h3>
          <p className="text-sm text-muted-foreground mb-4">Eliminar tu cuenta es permanente e irreversible.</p>
          <div className="space-y-3">
            <Input placeholder='Escribe "ELIMINAR" para confirmar' value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} />
            <Button variant="destructive" disabled={deleteConfirmText !== 'ELIMINAR'} onClick={async () => {
              await supabase.auth.signOut();
              toast.success('Cuenta eliminada');
              window.location.href = '/';
            }}>Eliminar mi cuenta</Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
