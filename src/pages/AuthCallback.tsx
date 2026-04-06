import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/shared';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Obtener el hash de la URL que contiene los tokens
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const errorCode = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        // Si hay un error en la URL
        if (errorCode) {
          console.error('OAuth error:', errorCode, errorDescription);
          setError(errorDescription || 'Error en la autenticación');
          toast.error(errorDescription || 'Error en la autenticación con Google');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        // Si tenemos tokens, establecer la sesión
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            toast.error('Error al establecer la sesión');
            navigate('/login');
            return;
          }

          toast.success('Sesión iniciada correctamente');
          navigate('/dashboard');
          return;
        }

        // Verificar sesión actual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Get session error:', sessionError);
          toast.error('Error al verificar la sesión');
          navigate('/login');
          return;
        }

        if (session) {
          navigate('/dashboard');
        } else {
          toast.error('No se pudo establecer la sesión');
          navigate('/login');
        }
      } catch (err) {
        console.error('Callback error:', err);
        toast.error('Error inesperado en la autenticación');
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <LoadingSpinner className="h-8 w-8 mx-auto" />
        <p className="text-sm text-muted-foreground">
          {error ? 'Redirigiendo...' : 'Completando autenticación...'}
        </p>
        {error && (
          <p className="text-sm text-destructive max-w-md">{error}</p>
        )}
      </div>
    </div>
  );
}
