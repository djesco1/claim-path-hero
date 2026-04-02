import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, X, Send, MessageSquare, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const suggestedPrompts = [
  '¿Cuáles son mis derechos en esta situación?',
  '¿Qué pasa si no responden en 15 días?',
  '¿Puedo pedir más de lo que me deben?',
  '¿Cuándo debo acudir a un juez?',
];

export default function LegalAssistant({ claimId, claimTitle }: { claimId?: string; claimTitle?: string }) {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [contextClaimId, setContextClaimId] = useState<string | undefined>(claimId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setContextClaimId(claimId); }, [claimId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation history
  useEffect(() => {
    if (!open || !user) return;
    if (conversationId) return;

    const loadConversation = async () => {
      const { data } = await supabase
        .from('assistant_conversations')
        .select('id, messages')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setConversationId(data.id);
        setMessages(data.messages || []);
      }
    };
    loadConversation();
  }, [open, user, conversationId]);

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
            claim_id: contextClaimId,
          }),
        }
      );

      // Get conversation ID from header
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
  }, [streaming, user, conversationId, contextClaimId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const initials = profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  const renderCitations = (text: string) => {
    return text.replace(/\[(Ley[^\]]+)\]/g, '**[$1]**');
  };

  if (!user) return null;

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed right-6 bottom-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow lg:bottom-6 bottom-20"
          >
            <Sparkles className="h-6 w-6" />
            <span className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed z-50 bg-card border rounded-2xl shadow-2xl flex flex-col overflow-hidden',
              'right-6 bottom-6 w-[400px] h-[600px]',
              'max-lg:inset-0 max-lg:w-full max-lg:h-full max-lg:rounded-none max-lg:right-0 max-lg:bottom-0'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground text-sm">Asistente Legal</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">IA</Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNewConversation} title="Nueva conversación">
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="px-4 py-2 bg-amber-50 border-b text-[11px] text-amber-700">
              ⚖️ Orientación informativa. No reemplaza asesoría legal profesional.
            </div>

            {/* Context chip */}
            {contextClaimId && claimTitle && (
              <div className="px-4 py-2 border-b flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Contexto:</span>
                <Badge variant="outline" className="text-[10px] gap-1">
                  {claimTitle.slice(0, 30)}{claimTitle.length > 30 ? '...' : ''}
                  <button onClick={() => setContextClaimId(undefined)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="rounded-2xl bg-primary/10 p-4">
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">¿En qué puedo ayudarte?</p>
                    <p className="text-xs text-muted-foreground mt-1">Pregúntame sobre tus derechos legales en Colombia</p>
                  </div>
                  <div className="space-y-2 w-full">
                    {suggestedPrompts.map(prompt => (
                      <button
                        key={prompt}
                        onClick={() => sendMessage(prompt)}
                        className="w-full text-left text-xs px-3 py-2 rounded-lg border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  {msg.role === 'assistant' && (
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <Shield className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  <div className={cn(
                    'rounded-xl px-3.5 py-2.5 text-sm max-w-[85%]',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted border'
                  )}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert [&_p]:mb-2 [&_p:last-child]:mb-0">
                        <ReactMarkdown>{renderCitations(msg.content)}</ReactMarkdown>
                        {streaming && i === messages.length - 1 && (
                          <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5" />
                        )}
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1 text-[10px] font-medium text-primary-foreground">
                      {initials}
                    </div>
                  )}
                </motion.div>
              ))}

              {streaming && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="flex gap-2 items-start">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                  </div>
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
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu pregunta..."
                  className="min-h-[40px] max-h-[100px] resize-none text-sm"
                  rows={1}
                  disabled={streaming}
                />
                <Button
                  size="icon"
                  className="shrink-0 h-10 w-10"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || streaming}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
