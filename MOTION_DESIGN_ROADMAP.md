# Motion Design System - Roadmap de Implementación

## ✅ Completado

### 1. Sistema Base de Motion
- ✅ `src/lib/motion.ts` - Variantes y configuraciones de animación
- ✅ `src/lib/confetti.ts` - Sistema de confetti para celebraciones
- ✅ Router actualizado con AnimatePresence

### 2. Custom Hooks
- ✅ `useTypewriter` - Efecto de máquina de escribir
- ✅ `useParallax` - Parallax con cursor
- ✅ `useCard3D` - Efecto 3D en cards
- ✅ `useAnimatedNumber` - Números animados

### 3. Componentes Mejorados
- ✅ `Card3D` - Cards con efecto 3D y shine
- ✅ `AnimatedNumber` - Números con animación spring
- ✅ `TypingText` - Texto con efecto typing
- ✅ `EnhancedToast` - Sistema de toasts mejorado
- ✅ `StatusBadge` actualizado con animaciones por tipo

## 🚧 Pendiente de Implementar

### 4. Landing Page - Hero Section

**Archivo**: `src/pages/Landing.tsx`

#### Hero Cursor Parallax
```tsx
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useParallax } from '@/hooks/useParallax';

// En el componente Hero:
const heroRef = useRef<HTMLDivElement>(null);
const parallax = useParallax({ containerRef: heroRef, strength: 0.08 });

// Aplicar a elementos:
<motion.div style={{ x: parallax.x, y: parallax.y }}>
  {/* Main card */}
</motion.div>

<motion.div style={{ 
  x: useTransform(parallax.x, (x) => x * 1.5),
  y: useTransform(parallax.y, (y) => y * 1.2)
}}>
  {/* Badge "Ley 820" */}
</motion.div>
```

#### Hero Typewriter
```tsx
import { useTypewriter } from '@/hooks/useTypewriter';

const { displayedText, showCursor } = useTypewriter({
  text: 'Sin abogados. Sin burocracia.',
  speed: 45,
  delay: 600,
});

<h2>
  {displayedText}
  {showCursor && <span className="animate-pulse">|</span>}
</h2>
```

### 5. Landing Page - Scroll Animations

**Usar**: `whileInView` de Framer Motion

```tsx
<motion.section
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.3 }}
  variants={sectionStaggerVariants}
>
  {/* Contenido */}
</motion.section>
```

#### Secciones a animar:
- "Cómo funciona" - stagger 150ms entre pasos
- "Tipos de reclamación" - cards caen desde arriba (y: -20px)
- Testimonios - scale desde 0.95
- Stats en pricing - números animados al entrar

### 6. Dashboard Enhancements

**Archivo**: `src/pages/Dashboard.tsx`

#### Stats con Números Animados
```tsx
import { AnimatedNumber } from '@/components/shared';

<AnimatedNumber 
  value={totalClaims} 
  format={(v) => v.toString()}
/>
```

#### Claim Cards con 3D Hover
```tsx
import { Card3D } from '@/components/shared';

<Card3D maxRotation={3}>
  <div className="claim-card-content">
    {/* Contenido del card */}
  </div>
</Card3D>
```

#### Skeleton con Shimmer Diagonal
```tsx
// En Skeleton component, agregar:
className="relative overflow-hidden before:absolute before:inset-0 
before:bg-gradient-to-br before:from-transparent before:via-white/10 
before:to-transparent before:animate-shimmer"

// En tailwind.config.ts agregar:
animation: {
  shimmer: 'shimmer 2s infinite',
},
keyframes: {
  shimmer: {
    '0%': { transform: 'translateX(-100%) translateY(-100%) rotate(45deg)' },
    '100%': { transform: 'translateX(100%) translateY(100%) rotate(45deg)' },
  },
}
```

### 7. Wizard (NewClaim) Enhancements

**Archivo**: `src/pages/NewClaim.tsx`

#### Step Transitions
```tsx
import { wizardStepVariants } from '@/lib/motion';

const [direction, setDirection] = useState(0);

<AnimatePresence mode="wait" custom={direction}>
  <motion.div
    key={currentStep}
    custom={direction}
    variants={wizardStepVariants}
    initial="enter"
    animate="center"
    exit="exit"
  >
    {/* Step content */}
  </motion.div>
</AnimatePresence>
```

#### Celebration al Completar
```tsx
import { fireSuccessConfetti } from '@/lib/confetti';
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

const handleComplete = async () => {
  // ... guardar claim
  
  // Check if already celebrated
  if (!sessionStorage.getItem('celebrated_claim')) {
    setTimeout(() => {
      fireSuccessConfetti();
      sessionStorage.setItem('celebrated_claim', 'true');
    }, 300);
  }
  
  navigate(`/claims/${claimId}`);
};
```

### 8. Document Viewer Enhancements

**Archivo**: `src/pages/ClaimDetail.tsx` (tab Documento)

#### Paper Effect CSS
```css
/* Agregar a index.css o component styles */
.document-paper {
  box-shadow: 
    0 1px 2px rgba(0,0,0,0.07),
    0 2px 4px rgba(0,0,0,0.07),
    0 4px 8px rgba(0,0,0,0.07),
    0 8px 16px rgba(0,0,0,0.07);
  
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  
  clip-path: polygon(
    0% 0.5%, 100% 0%, 100% 99.5%, 0% 100%
  );
}
```

#### Typing Effect en Documento
```tsx
import { TypingText } from '@/components/shared';

{claim.generated_document && (
  <TypingText
    text={claim.generated_document}
    speed={25}
    storageKey={`animated_${claim.id}`}
  />
)}
```

### 9. AI Assistant Enhancements

**Archivo**: `src/components/assistant/LegalAssistant.tsx`

#### Streaming Cursor
```tsx
{isStreaming && (
  <motion.span
    animate={{ opacity: [1, 0] }}
    transition={{ duration: 0.53, repeat: Infinity }}
    className="inline-block w-0.5 h-4 bg-primary ml-0.5"
  />
)}
```

#### Law Citation Chips
```tsx
function parseLawCitations(text: string) {
  const patterns = [
    /Ley \d+ de \d+, Art\. \d+/g,
    /Artículo \d+ del CST/g,
    /Art\. \d+ Ley \d+/g,
  ];
  
  let result = text;
  patterns.forEach(pattern => {
    result = result.replace(pattern, (match) => 
      `<span class="law-citation">${match}</span>`
    );
  });
  
  return result;
}

// Renderizar con dangerouslySetInnerHTML o react-markdown con plugin custom
```

#### Suggested Prompts
```tsx
import { motion } from 'framer-motion';
import { staggerContainerVariants, slideUpVariants } from '@/lib/motion';

const suggestedPrompts = [
  "¿Cuáles son mis derechos como arrendatario?",
  "¿Cómo recupero mi depósito?",
  "¿Qué dice la Ley 820 sobre terminación?",
];

<motion.div
  variants={staggerContainerVariants}
  initial="hidden"
  animate="visible"
  className="flex flex-wrap gap-2"
>
  {suggestedPrompts.map((prompt) => (
    <motion.button
      key={prompt}
      variants={slideUpVariants}
      whileHover={{ y: -2, scale: 1.02 }}
      className="px-4 py-2 rounded-full bg-muted hover:bg-muted/80"
    >
      {prompt}
    </motion.button>
  ))}
</motion.div>
```

### 10. Dark Mode Theming

**Archivo**: `tailwind.config.ts`

```ts
theme: {
  extend: {
    colors: {
      dark: {
        background: '#0A0E1A',
        surface: '#111827',
        'surface-2': '#1F2937',
        border: 'rgba(255,255,255,0.08)',
        'text-primary': '#F8FAFC',
        'text-muted': '#94A3B8',
      }
    }
  }
}
```

**Actualizar**: `src/index.css`

```css
.dark {
  --background: #0A0E1A;
  --surface: #111827;
  --surface-2: #1F2937;
  --border: rgba(255,255,255,0.08);
  --foreground: #F8FAFC;
  --muted-foreground: #94A3B8;
}

.dark .hero-mesh {
  opacity: 0.15;
}

.dark .floating-badge {
  background: rgba(17, 24, 39, 0.9);
  backdrop-filter: blur(8px);
}
```

### 11. Accessibility - Reduced Motion

**Agregar a**: `src/index.css`

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 12. Detalles Finales

#### Focus Rings Personalizados
```css
/* En index.css */
*:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
  border-radius: 4px;
}

.btn-primary:focus-visible {
  outline-color: var(--primary);
}
```

#### Scrollbar Custom
```css
.document-viewer::-webkit-scrollbar {
  width: 4px;
}

.document-viewer::-webkit-scrollbar-track {
  background: transparent;
}

.document-viewer::-webkit-scrollbar-thumb {
  background: var(--primary);
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}

.document-viewer:hover::-webkit-scrollbar-thumb {
  opacity: 1;
}
```

#### Tooltips con Framer Motion
```tsx
// Crear componente Tooltip mejorado
import { motion, AnimatePresence } from 'framer-motion';

export function Tooltip({ children, content, open }) {
  return (
    <div className="relative">
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute bottom-full mb-2 px-3 py-1.5 bg-popover text-popover-foreground rounded-md shadow-lg"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

## 📝 Notas de Implementación

### Orden Recomendado:
1. ✅ Sistema base (completado)
2. Landing Page Hero (parallax + typewriter)
3. Landing Page scroll animations
4. Dashboard (números animados + cards 3D)
5. Document viewer (paper effect + typing)
6. AI Assistant (streaming + citations)
7. Wizard (transitions + confetti)
8. Dark mode
9. Detalles finales

### Testing:
- Probar en diferentes navegadores
- Verificar performance (usar React DevTools Profiler)
- Testear con `prefers-reduced-motion`
- Validar en mobile (deshabilitar parallax)

### Performance Tips:
- Usar `will-change` con cuidado
- Lazy load Lottie animations
- Memoizar componentes pesados
- Usar `useCallback` para handlers de mouse

## 🎯 Próximos Pasos

Ejecuta el proyecto y verifica que las animaciones base funcionen:

```bash
npm run dev
```

Luego implementa las mejoras en el orden sugerido, probando cada una antes de continuar.
