import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Shield, FileText, Scale, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/shared/GlassCard';
import { cn } from '@/lib/utils';

const demoQuestions = [
  '¿Cuáles son mis derechos como arrendatario?',
  '¿Qué pasa si no me devuelven el depósito?',
  '¿Puedo reclamar daños y perjuicios?',
  '¿Cuánto tiempo tengo para reclamar?',
];

const demoResponses: Record<string, { answer: string; sources: string[] }> = {
  '¿Cuáles son mis derechos como arrendatario?': {
    answer: 'Como arrendatario en Colombia, tienes varios derechos fundamentales protegidos por la **Ley 820 de 2003**:\n\n1. **Derecho a recibir el inmueble en buen estado** (Art. 8): El arrendador debe entregarte la vivienda en condiciones de seguridad, salubridad y habitabilidad.\n\n2. **Derecho a la devolución del depósito** (Art. 15): Al finalizar el contrato, tienes derecho a que te devuelvan el depósito o garantía, descontando únicamente daños comprobados que excedan el desgaste normal.\n\n3. **Derecho al respeto del plazo pactado** (Art. 22): Si el arrendador quiere terminar el contrato antes de tiempo sin causa legal, debe indemnizarte con el valor de tres meses de arriendo.\n\n4. **Derecho a la privacidad**: El arrendador no puede ingresar al inmueble sin tu autorización, salvo emergencias.\n\nEstos derechos son irrenunciables y cualquier cláusula que los limite es nula.',
    sources: ['Ley 820 de 2003 - Art. 8', 'Ley 820 de 2003 - Art. 15', 'Ley 820 de 2003 - Art. 22'],
  },
  '¿Qué pasa si no me devuelven el depósito?': {
    answer: 'Si el arrendador no te devuelve el depósito al finalizar el contrato, puedes tomar las siguientes acciones según la **Ley 820 de 2003**:\n\n1. **Enviar una reclamación formal** (Art. 15): Debes enviar una carta o correo certificado solicitando la devolución del depósito, explicando que no hay daños o que estos son menores al monto retenido.\n\n2. **Plazo de respuesta**: El arrendador tiene 15 días hábiles para responder y devolver el dinero o justificar los descuentos con evidencia (fotos, facturas de reparación).\n\n3. **Proceso judicial** (Art. 25): Si no responde o la respuesta no es satisfactoria, puedes iniciar un proceso de restitución de inmueble arrendado ante un juez civil, donde además puedes reclamar:\n   - El valor del depósito\n   - Intereses moratorios\n   - Costas del proceso\n\n4. **Indemnización adicional**: Si se comprueba mala fe del arrendador, puedes reclamar daños y perjuicios adicionales.\n\nRecuerda documentar todo: estado del inmueble al entregarlo, comunicaciones con el arrendador, y cualquier evidencia de que cumpliste tus obligaciones.',
    sources: ['Ley 820 de 2003 - Art. 15', 'Ley 820 de 2003 - Art. 25', 'Código Civil - Art. 1613'],
  },
  '¿Puedo reclamar daños y perjuicios?': {
    answer: 'Sí, puedes reclamar daños y perjuicios en Colombia bajo ciertas condiciones establecidas en el **Código Civil** y la **Ley 820 de 2003**:\n\n**Requisitos para reclamar** (Art. 1613 Código Civil):\n1. **Incumplimiento del contrato**: Debe existir una obligación incumplida por la otra parte.\n2. **Daño real y comprobable**: Debes demostrar que sufriste un perjuicio económico o moral.\n3. **Nexo causal**: El daño debe ser consecuencia directa del incumplimiento.\n4. **Culpa o dolo**: La otra parte actuó con negligencia o mala fe.\n\n**Tipos de daños reclamables**:\n- **Daño emergente**: Pérdida o gasto real (ej: costo de hotel por no poder habitar el inmueble)\n- **Lucro cesante**: Ganancia que dejaste de percibir (ej: si usabas el inmueble para negocio)\n- **Daño moral**: En casos excepcionales de grave afectación\n\n**Proceso**:\n1. Envía primero una reclamación extrajudicial\n2. Si no hay respuesta, puedes demandar ante juez civil\n3. Debes aportar pruebas: facturas, contratos, testimonios, fotos\n\nEl monto de la indemnización lo determina el juez según las pruebas presentadas.',
    sources: ['Código Civil - Art. 1613', 'Código Civil - Art. 1614', 'Ley 820 de 2003 - Art. 25'],
  },
  '¿Cuánto tiempo tengo para reclamar?': {
    answer: 'Los plazos para reclamar en Colombia varían según el tipo de reclamación, establecidos en el **Código Civil** y leyes especiales:\n\n**Arrendamiento de vivienda** (Ley 820 de 2003):\n- **Devolución de depósito**: 2 años desde la terminación del contrato (prescripción ordinaria)\n- **Incumplimiento contractual**: 2 años desde el incumplimiento\n\n**Reclamaciones generales** (Código Civil):\n- **Acciones ordinarias**: 10 años (Art. 2536)\n- **Acciones ejecutivas**: 5 años (Art. 2536)\n- **Responsabilidad extracontractual**: 2 años (Art. 2356)\n\n**Servicios públicos** (Ley 142 de 1994):\n- **Reclamaciones por facturación**: 5 años\n- **Devolución de pagos indebidos**: 5 años\n\n**Recomendaciones**:\n1. **Actúa rápido**: Aunque tengas años para reclamar, es mejor hacerlo pronto mientras las pruebas están frescas\n2. **Interrumpe la prescripción**: Enviar una reclamación formal interrumpe el conteo del plazo\n3. **Documenta todo**: Guarda todos los documentos desde el primer día\n\n⚠️ **Importante**: Estos plazos empiezan a contar desde que conociste o debiste conocer el hecho que da lugar a la reclamación.',
    sources: ['Código Civil - Art. 2536', 'Código Civil - Art. 2356', 'Ley 820 de 2003', 'Ley 142 de 1994'],
  },
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export default function RAGDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const simulateTyping = async (text: string, sources: string[]) => {
    setIsTyping(true);
    setShowSuggestions(false);
    
    // Add empty assistant message
    setMessages(prev => [...prev, { role: 'assistant', content: '', sources }]);
    
    // Simulate typing effect
    const words = text.split(' ');
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        lastMessage.content = words.slice(0, i + 1).join(' ');
        return newMessages;
      });
    }
    
    setIsTyping(false);
  };

  const handleSend = async (question?: string) => {
    const q = question || input;
    if (!q.trim() || isTyping) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setInput('');

    // Get response
    const response = demoResponses[q] || {
      answer: 'Esta es una demostración. Las preguntas disponibles son las sugeridas arriba. En la versión completa, podrás hacer cualquier pregunta sobre tus derechos legales en Colombia.',
      sources: ['Demo'],
    };

    await simulateTyping(response.answer, response.sources);
  };

  const handleReset = () => {
    setMessages([]);
    setShowSuggestions(true);
  };

  return (
    <GlassCard className="w-full max-w-4xl mx-auto p-6 space-y-6" glow>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="rounded-xl bg-primary/10 p-2"
          >
            <Shield className="h-6 w-6 text-primary" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              Asistente Legal con IA
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                DEMO
              </span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Pregunta sobre tus derechos legales en Colombia
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleReset}>
            Nueva conversación
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="min-h-[400px] max-h-[500px] overflow-y-auto space-y-4 pr-2">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 && showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="text-center space-y-3 py-8">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 p-4"
                >
                  <Sparkles className="h-12 w-12 text-primary" />
                </motion.div>
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    ¿En qué puedo ayudarte?
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Haz una pregunta o selecciona una sugerencia
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {demoQuestions.map((q, i) => (
                  <motion.button
                    key={q}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSend(q)}
                    className="text-left p-4 rounded-xl bg-white/50 dark:bg-muted/50 backdrop-blur-sm border border-white/20 hover:border-primary/50 transition-all"
                  >
                    <p className="text-sm text-foreground font-medium">{q}</p>
                  </motion.button>
                ))}
              </div>

              {/* Features */}
              <div className="grid sm:grid-cols-3 gap-4 pt-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Documentos legales</p>
                    <p className="text-xs text-muted-foreground">Genera reclamaciones formales</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Scale className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Basado en leyes</p>
                    <p className="text-xs text-muted-foreground">Cita normativa colombiana</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Explicaciones claras</p>
                    <p className="text-xs text-muted-foreground">Lenguaje fácil de entender</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.role === 'assistant' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="rounded-full bg-primary/10 p-2 h-fit"
                >
                  <Shield className="h-4 w-4 text-primary" />
                </motion.div>
              )}
              
              <div className={cn(
                'max-w-[85%] rounded-2xl px-4 py-3',
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-primary to-purple-600 text-primary-foreground shadow-lg'
                  : 'bg-white/50 dark:bg-muted/50 backdrop-blur-sm border border-white/20'
              )}>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {msg.content.split('\n').map((line, j) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={j} className="font-bold my-2">{line.replace(/\*\*/g, '')}</p>;
                    }
                    if (line.match(/^\d+\./)) {
                      return <p key={j} className="my-1 pl-2">{line}</p>;
                    }
                    if (line.startsWith('- ')) {
                      return <p key={j} className="my-1 pl-4">{line}</p>;
                    }
                    return line ? <p key={j} className="my-2">{line}</p> : <br key={j} />;
                  })}
                  {isTyping && i === messages.length - 1 && (
                    <span className="inline-block w-1 h-4 bg-primary animate-pulse ml-1" />
                  )}
                </div>
                
                {msg.sources && msg.sources.length > 0 && !isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-3 pt-3 border-t border-white/10 space-y-1"
                  >
                    <p className="text-xs font-semibold text-muted-foreground">Fuentes:</p>
                    {msg.sources.map((source, j) => (
                      <p key={j} className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="text-primary">•</span>
                        {source}
                      </p>
                    ))}
                  </motion.div>
                )}
              </div>

              {msg.role === 'user' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="rounded-full bg-gradient-to-br from-primary to-purple-600 p-2 h-fit text-primary-foreground text-xs font-bold flex items-center justify-center"
                  style={{ width: 32, height: 32 }}
                >
                  TÚ
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Escribe tu pregunta legal..."
          disabled={isTyping}
          className="bg-white/50 dark:bg-muted/50 backdrop-blur-sm border-white/20 focus:border-primary/50"
        />
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="bg-gradient-to-r from-primary to-purple-600 hover:brightness-110 shadow-lg shadow-primary/30"
          >
            <Send className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-center text-muted-foreground">
        ⚖️ Esta es una demostración. La información es orientativa y no reemplaza asesoría legal profesional.
      </p>
    </GlassCard>
  );
}
