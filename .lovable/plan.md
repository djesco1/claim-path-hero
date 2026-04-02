
## Feature 1: 🗣️ Entrada por Voz
- Añadir botón de micrófono en el textarea de descripción (Step 2 del wizard)
- Usar Web Speech API (gratis, sin API key) para transcripción en tiempo real
- Enviar texto transcrito a la IA para que lo limpie y estructure
- Animación visual del micrófono mientras graba

## Feature 2: 📧 Envío Directo por Email  
- Necesita un dominio de email configurado
- Botón "Enviar reclamación" en el detalle del claim
- Edge function que envía el documento generado al email de la contraparte
- Registro del envío en el timeline del claim

## Feature 3: 📊 Probabilidad de Éxito
- Después de generar la reclamación, la IA calcula un % de éxito
- Se muestra como un gauge/medidor visual animado en el detalle del claim
- Basado en: tipo de caso, monto, derechos legales identificados, solidez de argumentos
- Se calcula en el mismo edge function `generate-claim` y se guarda en la tabla claims

## Orden de implementación
1. Probabilidad de éxito (requiere migración DB + cambio en edge function)
2. Entrada por voz (solo frontend)
3. Envío por email (requiere setup de email infrastructure)
