import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { MessageCircle, X, Sparkles } from 'lucide-react';

const owlMessages = [
  "¡Hola! Soy Justi, tu asistente legal 🦉",
  "¿Necesitas ayuda con tu reclamación?",
  "Estoy aquí para guiarte paso a paso",
  "¡Tus derechos son importantes!",
  "¿Sabías que puedo generar documentos legales?",
];

export function LegalOwl() {
  const [isVisible, setIsVisible] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Aparecer después de 3 segundos
    const timer = setTimeout(() => {
      setIsVisible(true);
      if (!hasInteracted) {
        setTimeout(() => setShowMessage(true), 1000);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [hasInteracted]);

  useEffect(() => {
    if (showMessage && !hasInteracted) {
      const messageTimer = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % owlMessages.length);
      }, 5000);

      return () => clearInterval(messageTimer);
    }
  }, [showMessage, hasInteracted]);

  const handleClick = () => {
    setHasInteracted(true);
    setShowMessage(!showMessage);
  };

  const handleClose = () => {
    setShowMessage(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute bottom-20 right-0 mb-2 mr-2"
          >
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 max-w-xs border border-primary/20">
              {/* Flecha del speech bubble */}
              <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white dark:bg-gray-800 border-r border-b border-primary/20 transform rotate-45" />
              
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>

              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                  {owlMessages[currentMessage]}
                </p>
              </div>

              {/* Indicador de mensajes */}
              <div className="flex gap-1 mt-3 justify-center">
                {owlMessages.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all ${
                      i === currentMessage
                        ? 'w-4 bg-primary'
                        : 'w-1 bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* El búho */}
      <motion.button
        onClick={handleClick}
        className="relative group"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Búho SVG */}
        <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full shadow-lg flex items-center justify-center">
          <motion.div
            animate={{
              y: [0, -4, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <svg
              viewBox="0 0 64 64"
              className="w-10 h-10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Cuerpo del búho */}
              <ellipse cx="32" cy="36" rx="18" ry="22" fill="white" opacity="0.9" />
              
              {/* Ojos */}
              <motion.circle
                cx="26"
                cy="30"
                r="5"
                fill="white"
                animate={{ scale: [1, 0.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              />
              <motion.circle
                cx="38"
                cy="30"
                r="5"
                fill="white"
                animate={{ scale: [1, 0.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              />
              <circle cx="26" cy="30" r="2.5" fill="#1f2937" />
              <circle cx="38" cy="30" r="2.5" fill="#1f2937" />
              
              {/* Pico */}
              <path d="M32 34 L28 38 L32 40 L36 38 Z" fill="#f59e0b" />
              
              {/* Orejas */}
              <path d="M18 20 L22 28 L20 28 Z" fill="white" opacity="0.9" />
              <path d="M46 20 L42 28 L44 28 Z" fill="white" opacity="0.9" />
              
              {/* Toga de abogado (pequeña) */}
              <path d="M20 48 L32 52 L44 48 L44 44 L20 44 Z" fill="#1f2937" opacity="0.8" />
            </svg>
          </motion.div>

          {/* Badge de notificación */}
          {!hasInteracted && (
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            />
          )}
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap">
            Justi, tu asistente legal
          </div>
        </div>
      </motion.button>
    </div>
  );
}
