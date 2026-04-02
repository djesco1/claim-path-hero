import { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const recognitionRef = useRef<any>(null);

  const isSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = useCallback(() => {
    if (!isSupported) {
      toast.error('Tu navegador no soporta reconocimiento de voz');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-CO';
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      setInterim(interimTranscript);
      if (finalTranscript) {
        onTranscript(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Permiso de micrófono denegado');
      }
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setInterim('');
      if (finalTranscript) {
        onTranscript(finalTranscript.trim());
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [isSupported, onTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  if (!isSupported) return null;

  return (
    <div className="relative inline-flex items-center gap-2">
      <Button
        type="button"
        variant={listening ? 'destructive' : 'outline'}
        size="sm"
        onClick={listening ? stopListening : startListening}
        disabled={disabled}
        className={cn('gap-2', listening && 'animate-pulse')}
      >
        {listening ? (
          <>
            <MicOff className="h-4 w-4" />
            Detener
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" />
            Dictar
          </>
        )}
      </Button>

      {listening && (
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
          </span>
          <span className="text-xs text-muted-foreground">Escuchando...</span>
        </div>
      )}

      {interim && (
        <p className="text-xs text-muted-foreground italic ml-2 max-w-[200px] truncate">
          {interim}
        </p>
      )}
    </div>
  );
}
