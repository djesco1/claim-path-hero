// Feature flags para la aplicación
export const FEATURES = {
  // Google OAuth - Cambiar a true después de configurar en Supabase
  GOOGLE_OAUTH: false,
  
  // Otras features
  VOICE_INPUT: true,
  DOCUMENT_SCANNER: true,
  AI_ASSISTANT: true,
} as const;
