# ClaimPath — Plataforma de Reclamaciones Legales con IA

> Acceso a la justicia para todos. Sin abogados. Sin burocracia.

## Estado del proyecto
- **Web App**: ✅ React SPA (Vite + TypeScript + Tailwind CSS)
- **Backend**: ✅ Lovable Cloud (PostgreSQL + Edge Functions)
- **Analytics Engine**: 🏗️ Fundación lista — ML pipeline en roadmap

## Arquitectura

```
Browser → Lovable (React SPA)
             ↓
        Auth System
             ↓
        Database (PostgreSQL + pgvector)
             ↓ (via Backend Functions)
        AI Models (GPT-4o + text-embedding-3-small)
             ↓
        Resend (Email delivery)
             ↓ (future)
        Python ML Service (success predictor)
             ↓
        analytics_events table (event store)
```

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui
- **State**: TanStack Query v5
- **Backend**: Lovable Cloud (Supabase — Auth, PostgreSQL, Storage, Edge Functions)
- **AI**: GPT-4o for document generation, text-embedding-3-small for RAG
- **Email**: Resend
- **Charts**: Recharts
- **PDF**: jsPDF
- **Animation**: Framer Motion
- **Mobile**: Capacitor (iOS/Android)
- **Testing**: Vitest

## Setup

```bash
npm install
npm run dev
```

### Environment Variables

See `.env.example` for required variables.

### Google OAuth (opcional)

1. Go to `console.cloud.google.com`
2. Create OAuth 2.0 Client ID (Web application)
3. Add redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
4. Enable Google provider in Authentication settings
5. Set `VITE_GOOGLE_OAUTH_ENABLED=true` in `.env`

## Features

- ✅ Email + password authentication
- ✅ Google OAuth (configurable via feature flag)
- ✅ Claim creation wizard with voice input
- ✅ AI document generation (GPT-4o)
- ✅ RAG legal assistant
- ✅ Email sending to counterparty
- ✅ Document scanning (OCR)
- ✅ Success probability gauge
- ✅ Analytics dashboard
- ✅ Dark mode
- ✅ Mobile responsive
- ✅ Analytics event store (ML pipeline foundation)

## Troubleshooting

| Error | Causa | Solución |
|-------|-------|----------|
| "Unsupported provider" en Google OAuth | Google no configurado | Ver sección Google OAuth |
| "User profile not created" | Trigger no ejecutado | Verificar trigger handle_new_user |
| Edge Function 500 | API key no configurada | Configurar secret en backend |
| RLS error en insert | user_id no incluido | Verificar que inserts incluyen auth.uid() |

## Roadmap

### v1.0 (actual)
- ✅ Auth completo (email + Google OAuth)
- ✅ Wizard de reclamaciones
- ✅ Generación de documentos con IA
- ✅ RAG legal assistant
- ✅ Envío de email a contraparte
- ✅ Analíticas básicas
- ✅ Analytics event store (fundación ML)

### v2.0 (futuro)
- Python ML service: predictor de éxito
- Multi-país: Ecuador, Perú, Venezuela
- Marketplace de abogados para casos escalados
