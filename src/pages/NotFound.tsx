import { Link } from 'react-router-dom';
import { Shield, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="rounded-2xl bg-muted p-6 mb-6">
        <FileQuestion className="h-16 w-16 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Página no encontrada</h1>
      <p className="text-muted-foreground mb-8 max-w-md">La página que buscas no existe o ha sido movida.</p>
      <Button asChild>
        <Link to="/">
          <Shield className="h-4 w-4 mr-2" />
          Volver al inicio
        </Link>
      </Button>
    </div>
  );
}
