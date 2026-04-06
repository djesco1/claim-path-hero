import { useState, useEffect } from 'react';

interface UseTypewriterOptions {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
}

export function useTypewriter({
  text,
  speed = 45,
  delay = 600,
  onComplete,
}: UseTypewriterOptions) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let cursorInterval: NodeJS.Timeout;

    const startTyping = () => {
      let currentIndex = 0;

      const typeNextChar = () => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
          timeout = setTimeout(typeNextChar, speed);
        } else {
          setIsComplete(true);
          // Hide cursor after 500ms
          setTimeout(() => setShowCursor(false), 500);
          onComplete?.();
        }
      };

      timeout = setTimeout(typeNextChar, delay);
    };

    // Blinking cursor
    cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    startTyping();

    return () => {
      clearTimeout(timeout);
      clearInterval(cursorInterval);
    };
  }, [text, speed, delay, onComplete]);

  return { displayedText, isComplete, showCursor };
}
