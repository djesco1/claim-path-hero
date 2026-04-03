import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Send, Shield, RotateCcw, MessageSquare, FileText, Zap, Scale, ArrowUpRight, ChevronRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/components/layout';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useClaims } from '@/hooks/useClaims';
import { supabase } from '@/lib/supabase';
import { Claim } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const modes = [
  { id: 'general', label: 'Asistente general', icon: MessageSquare, desc: 'Preguntas generales sobre tus derechos' },
  { id: 'analyze', label: 'Analizar mi caso', icon: Scale, desc: 'Análisis profundo de tu reclamación' },
  { id: 'draft', label: 'Redactar mensaje', icon: FileText, desc: 'Redacta un mensaje de seguimiento' },
  { id: 'simulate', label: 'Simular respuesta', icon: Zap, desc: 'Qué podría responder la contraparte' },
  { id: 'escalate', label: 'Preparar escalamiento', icon: ArrowUpRight, desc: 'Siguiente paso legal si no responden' },
] as const;

const quickActions = [
  'Revisar mi documento',
  'Sugerir evidencia necesaria',
  'Calcular probabilidad de éxito',
  'Generar carta de seguimiento',
  'Identificar entidad de queja',
];

export default function Inteligencia() {
  const { user, profile } = useAuth();
  const { data: claims } = useClaims();
  const [mode, setMode] = useState<string>('general');
  const [selectedClaimId, setSelectedClaimId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedClaim = claims?.find(c => c.id === selectedClaimId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewConversation = () => {
    setConversationId(null);
    setMessages([]);
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming || !user) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setStreaming(true);

    let assistantContent = '';

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/legal-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            message: text.trim(),
            conversation_id: conversationId,
            claim_id: selectedClaimId || undefined,
            mode,
          }),
        }
      );

      const newConvId = resp.headers.get('X-Conversation-Id');
      if (newConvId) setConversationId(newConvId);

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al conectar con el asistente');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              const final = assistantContent;
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: 'assistant', content: final };
                return copy;
              });
            }
          } catch {}
        }
      }
    } catch (e: any) {
      setMessages(prev => [
        ...prev.filter(m => !(m.role === 'assistant' && m.content === '')),
        { role: 'assistant', content: `Lo siento, hubo un error: ${e.message}` },
      ]);
    } finally {
      setStreaming(false);
    }
  }, [streaming, user, conversationId, selectedClaimId, mode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const initials = profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-0px)] lg:h-screen">
        {/* Left: Chat */}
        <div className="flex-1 flex flex-col min-w-0 border-r">
          {/* Mode tabs */}
          <div className="border-b p-3 overflow-x-auto">
            <div className="flex gap-2">
              {modes.map(m => (
                <button key={m.id} onClick={() => setMode(m.id)} className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all whitespace-nowrap',
                  mode === m.id ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                )}>
                  <m.icon className="h-3.5 w-3.5" />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Simulate disclaimer */}
          {mode === 'simulate' && (
            <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/20 border-b text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Esta simulación es especulativa y tiene fines preparatorios. No predice el comportamiento real de la contraparte.
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 max-w-md mx-auto">
                <div className="rounded-2xl bg-primary/10 p-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h2 className="font-semibold text-foreground">Centro de Inteligencia Legal</h2>
                <p className="text-sm text-muted-foreground">
                  {modes.find(m => m.id === mode)?.desc}
                </p>
                {mode !== 'general' && !selectedClaimId && claims && claims.length > 0 && (
                  <div className="w-full">
                    <p className="text-xs text-muted-foreground mb-2">Selecciona un caso para contextualizar:</p>
                    <Select value={selectedClaimId} onValueChange={setSelectedClaimId}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar caso..." /></SelectTrigger>
                      <SelectContent>
                        {claims.map(c => <SelectItem key={c.id} value={c.id}>{c.title || c.counterparty_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div className={cn('rounded-xl px-3.5 py-2.5 text-sm max-w-[80%]', msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted border')}>
                  {msg.role === 'assistant' ? (
                    <div className="space-y-2">
                      <div className="prose prose-sm max-w-none dark:prose-invert [&_p]:mb-2 [&_p:last-child]:mb-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                        {streaming && i === messages.length - 1 && <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5" />}
                      </div>
                      {!streaming && <p className="text-[10px] text-muted-foreground mt-2">Orientación informativa. No reemplaza asesoría legal.</p>}
                    </div>
                  ) : msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1 text-[10px] font-medium text-primary-foreground">{initials}</div>
                )}
              </motion.div>
            ))}

            {streaming && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex gap-2 items-start">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><Shield className="h-3.5 w-3.5 text-primary" /></div>
                <div className="rounded-xl bg-muted border px-3.5 py-2.5">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-card">
            <div className="flex gap-2 items-end">
              <Button variant="ghost" size="icon" className="shrink-0" onClick={handleNewConversation} title="Nueva conversación"><RotateCcw className="h-4 w-4" /></Button>
              <Textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Escribe tu pregunta..." className="min-h-[40px] max-h-[100px] resize-none text-sm" rows={1} disabled={streaming} />
              <Button size="icon" className="shrink-0 h-10 w-10" onClick={() => sendMessage(input)} disabled={!input.trim() || streaming}><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        {/* Right: Context panel */}
        <div className="hidden lg:flex flex-col w-80 border-l bg-card/50">
          <Tabs defaultValue="context" className="flex flex-col h-full">
            <TabsList className="m-3 grid grid-cols-3">
              <TabsTrigger value="context" className="text-xs">Contexto</TabsTrigger>
              <TabsTrigger value="actions" className="text-xs">Acciones</TabsTrigger>
              <TabsTrigger value="docs" className="text-xs">Docs</TabsTrigger>
            </TabsList>

            <TabsContent value="context" className="flex-1 overflow-y-auto p-3 space-y-4 m-0">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Caso seleccionado</label>
                <Select value={selectedClaimId} onValueChange={setSelectedClaimId}>
                  <SelectTrigger className="text-xs"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {claims?.map(c => <SelectItem key={c.id} value={c.id}>{c.title || c.counterparty_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {selectedClaim && (
                <div className="rounded-xl border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">{selectedClaim.claim_type}</Badge>
                    <Badge variant="outline" className="text-xs">{selectedClaim.status}</Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground">{selectedClaim.title}</p>
                  <p className="text-xs text-muted-foreground">vs {selectedClaim.counterparty_name}</p>
                  {selectedClaim.amount_involved && (
                    <p className="text-xs text-muted-foreground">Monto: ${selectedClaim.amount_involved.toLocaleString()}</p>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="actions" className="flex-1 overflow-y-auto p-3 space-y-2 m-0">
              <p className="text-xs text-muted-foreground mb-2">Acciones rápidas — se ejecutan en el chat</p>
              {quickActions.map(action => (
                <button key={action} onClick={() => sendMessage(action)} disabled={streaming}
                  className="w-full text-left rounded-lg border p-3 text-xs hover:bg-accent transition-colors flex items-center justify-between group">
                  <span className="text-foreground">{action}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </TabsContent>

            <TabsContent value="docs" className="flex-1 overflow-y-auto p-3 m-0">
              <p className="text-xs text-muted-foreground text-center py-8">Los documentos generados en esta sesión aparecerán aquí.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
