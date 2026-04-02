import { useState, useRef } from 'react';
import { Camera, Loader2, Copy, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DocumentScannerProps {
  onTextExtracted?: (text: string) => void;
  claimId?: string;
}

export default function DocumentScanner({ onTextExtracted, claimId }: DocumentScannerProps) {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [extracting, setExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se aceptan imágenes');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('La imagen no debe superar 10MB');
      return;
    }

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setExtractedText(null);
      setOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleExtract = async () => {
    if (!image) return;
    setExtracting(true);

    try {
      const base64 = image.split(',')[1];
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-text`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ image_base64: base64, mime_type: mimeType }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Error al extraer texto');
      }

      const data = await resp.json();
      setExtractedText(data.extracted_text);
      setConfidence(data.confidence);
    } catch (e: any) {
      toast.error(e.message || 'Error al extraer texto');
    } finally {
      setExtracting(false);
    }
  };

  const handleCopy = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText);
      toast.success('Texto copiado');
    }
  };

  const handleAddToDescription = () => {
    if (extractedText && onTextExtracted) {
      onTextExtracted(extractedText);
      toast.success('Texto agregado a la descripción');
      setOpen(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setImage(null);
    setExtractedText(null);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="gap-2"
      >
        <Camera className="h-4 w-4" />
        Escanear documento
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Escanear documento</DialogTitle>
          </DialogHeader>

          {image && !extractedText && (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden border max-h-[300px] flex items-center justify-center bg-muted">
                <img src={image} alt="Documento" className="max-h-[300px] object-contain" />
              </div>
              <Button onClick={handleExtract} disabled={extracting} className="w-full">
                {extracting ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Extrayendo texto...</>
                ) : (
                  'Extraer texto'
                )}
              </Button>
            </div>
          )}

          {extractedText && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Confianza:</span>
                <span className={cn(
                  'text-xs font-medium rounded-md px-2 py-0.5',
                  confidence === 'high' ? 'bg-emerald-100 text-emerald-700' :
                  confidence === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                )}>
                  {confidence === 'high' ? 'Alta' : confidence === 'medium' ? 'Media' : 'Baja'}
                </span>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4 max-h-[250px] overflow-y-auto text-sm whitespace-pre-wrap">
                {extractedText}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                  <Copy className="h-4 w-4" />Copiar
                </Button>
                {onTextExtracted && (
                  <Button size="sm" onClick={handleAddToDescription} className="gap-2">
                    <Plus className="h-4 w-4" />Agregar a descripción
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
