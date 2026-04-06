import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface TypingTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  storageKey?: string;
}

export function TypingText({ text, speed = 25, onComplete, storageKey }: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  // Check if animation was already played
  useEffect(() => {
    if (storageKey && localStorage.getItem(storageKey)) {
      setDisplayedText(text);
      setIsTyping(false);
      setShowCursor(false);
      onComplete?.();
      return;
    }

    let currentIndex = 0;
    let timeout: NodeJS.Timeout;
    let cursorInterval: NodeJS.Timeout;

    const typeNextChar = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
        timeout = setTimeout(typeNextChar, speed);
      } else {
        setIsTyping(false);
        setTimeout(() => setShowCursor(false), 500);
        if (storageKey) {
          localStorage.setItem(storageKey, 'true');
        }
        onComplete?.();
      }
    };

    // Blinking cursor
    cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    timeout = setTimeout(typeNextChar, 100);

    return () => {
      clearTimeout(timeout);
      clearInterval(cursorInterval);
    };
  }, [text, speed, onComplete, storageKey]);

  const skipAnimation = () => {
    setDisplayedText(text);
    setIsTyping(false);
    setShowCursor(false);
    if (storageKey) {
      localStorage.setItem(storageKey, 'true');
    }
    onComplete?.();
  };

  return (
    <div className="relative">
      {isTyping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-0 right-0 z-10"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={skipAnimation}
            className="text-xs"
          >
            Saltar animación
          </Button>
        </motion.div>
      )}
      
      <div className="whitespace-pre-wrap">
        {displayedText}
        {showCursor && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.53, repeat: Infinity, repeatType: 'reverse' }}
            className="inline-block w-0.5 h-5 bg-primary ml-0.5 align-middle"
          />
        )}
      </div>
    </div>
  );
}
