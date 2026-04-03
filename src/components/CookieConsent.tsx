import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('claimpath_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = (level: 'necessary' | 'all') => {
    localStorage.setItem('claimpath_cookie_consent', level);
    localStorage.setItem('cookie_consent', level);
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[100] border-t bg-card/95 backdrop-blur-lg px-4 py-4 shadow-lg"
        >
          <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              Usamos cookies para mejorar tu experiencia. Puedes aceptar solo las necesarias o todas, incluyendo analíticas.
            </p>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => accept('necessary')}>
                Aceptar necesarias
              </Button>
              <Button size="sm" onClick={() => accept('all')}>
                Aceptar todas
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
