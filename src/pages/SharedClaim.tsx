import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { ClaimTypeBadge, LoadingSpinner } from '@/components/shared';
import { PublicNavbar } from '@/components/layout';
import { formatDate, cn } from '@/lib/utils';
import { Claim } from '@/types';
import { Link } from 'react-router-dom';

export default function SharedClaim() {
  const { token } = useParams<{ token: string }>();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchClaim = async () => {
      if (!token) { setNotFound(true); setLoading(false); return; }
      const { data, error } = await supabase
        .from('claims')
        .select('id, title, claim_type, generated_document, created_at, status, legal_rights')
        .eq('share_token', token)
        .eq('share_enabled', true)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setClaim(data as any);
      }
      setLoading(false);
    };
    fetchClaim();
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="container py-20 text-center">
        <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Reclamación no encontrada</h1>
        <p className="text-muted-foreground mb-6">Este enlace no es válido o la reclamación ya no está compartida.</p>
        <Button asChild><Link to="/">Ir a ClaimPath</Link></Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="container max-w-3xl py-12 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ClaimTypeBadge type={claim!.claim_type} />
            <span className="text-sm text-muted-foreground">Generado el {formatDate(claim!.created_at)}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{claim!.title}</h1>
        </div>

        {claim!.generated_document && (
          <div className="relative rounded-xl border bg-card p-8 font-serif text-sm leading-relaxed whitespace-pre-wrap text-foreground shadow-sm">
            {claim!.status === 'draft' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-6xl font-bold text-destructive/[0.04] rotate-[-30deg] select-none">BORRADOR</span>
              </div>
            )}
            {claim!.generated_document}
          </div>
        )}

        {claim!.legal_rights && (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Derechos aplicados</h3>
            <div className="flex flex-wrap gap-2">
              {(claim!.legal_rights as any[]).map((r: any, i: number) => (
                <span key={i} className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {r.legal_basis}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border bg-primary/5 p-6 text-center space-y-3">
          <Shield className="h-10 w-10 text-primary mx-auto" />
          <h3 className="font-semibold text-foreground">¿Necesitas reclamar tus derechos?</h3>
          <p className="text-sm text-muted-foreground">Crea tu reclamación legal en minutos con ClaimPath</p>
          <Button asChild>
            <Link to="/register">
              Crear mi reclamación <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
