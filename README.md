# ClaimPath - Plataforma de Reclamaciones Legales

ClaimPath es una aplicación web para gestionar reclamaciones legales en Colombia, con generación automática de documentos legales usando IA.

## 🚀 Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Estado**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Formularios**: React Hook Form + Zod

## 📋 Requisitos Previos

- Node.js 18+ o Bun
- Cuenta de Supabase (ya configurada en `.env`)

## 🛠️ Instalación

1. Instalar dependencias:

```bash
npm install
```

o con Bun:

```bash
bun install
```

2. Las variables de entorno ya están configuradas en el archivo `.env`

## 🏃 Ejecutar el Proyecto

### Modo Desarrollo

```bash
npm run dev
```

o con Bun:

```bash
bun run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Build de Producción

```bash
npm run build
```

### Preview del Build

```bash
npm run preview
```

## 📜 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo con hot reload
- `npm run build` - Build optimizado para producción
- `npm run build:dev` - Build en modo desarrollo
- `npm run preview` - Preview del build de producción
- `npm run lint` - Ejecutar ESLint
- `npm run test` - Ejecutar tests una vez
- `npm run test:watch` - Ejecutar tests en modo watch

## ⚠️ Problemas Conocidos y Soluciones

### 1. Error "Unsupported provider: provider is not enabled"

**Problema**: El proveedor de autenticación de Google no está habilitado en Supabase.

**Solución**: 
- Ve a tu proyecto en Supabase Dashboard
- Navega a Authentication > Providers
- Habilita el proveedor de Google
- Configura las credenciales OAuth de Google Cloud Console
- Mientras tanto, usa autenticación por correo y contraseña

### 2. Pantalla en Blanco Después del Login

**Corrección aplicada**: Se mejoró el componente `AuthCallback.tsx` para manejar correctamente:
- Tokens de OAuth en el hash de la URL
- Errores de autenticación
- Redirección al dashboard
- Mensajes de error informativos

### 3. Mensaje "Publish or update your Lovable project"

Este mensaje aparece cuando el proyecto no está publicado en Lovable. No afecta el funcionamiento local.

## 🏗️ Estructura del Proyecto

```
src/
├── components/       # Componentes reutilizables
│   ├── assistant/   # Asistente legal con IA
│   ├── auth/        # Componentes de autenticación
│   ├── claim/       # Componentes de reclamaciones
│   ├── scanner/     # Escáner de documentos
│   ├── shared/      # Componentes compartidos
│   ├── ui/          # Componentes de UI (Shadcn)
│   └── voice/       # Input de voz
├── hooks/           # Custom hooks
├── integrations/    # Integraciones (Supabase)
├── lib/             # Utilidades y configuración
├── pages/           # Páginas de la aplicación
├── schemas/         # Esquemas de validación (Zod)
├── types/           # Tipos de TypeScript
└── __tests__/       # Tests

supabase/
├── functions/       # Edge Functions
│   ├── embed-claim/
│   ├── extract-text/
│   ├── generate-claim/
│   └── legal-assistant/
└── migrations/      # Migraciones de base de datos
```

## 🔑 Funcionalidades Principales

- ✅ Autenticación (Email/Password + Google OAuth)
- ✅ Dashboard de reclamaciones
- ✅ Creación de reclamaciones con asistente IA
- ✅ Escaneo y procesamiento de documentos
- ✅ Generación automática de documentos legales
- ✅ Asistente legal conversacional
- ✅ Compartir reclamaciones
- ✅ Analytics y estadísticas
- ✅ Gestión de perfil de usuario

## 🔐 Autenticación

La aplicación soporta dos métodos de autenticación:

1. **Email y Contraseña**: Totalmente funcional
2. **Google OAuth**: Requiere configuración adicional en Supabase

## 📱 Responsive Design

La aplicación está optimizada para:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🧪 Testing

El proyecto incluye configuración para:
- Vitest (unit tests)
- Playwright (e2e tests)
- Testing Library (component tests)

## 📄 Licencia

Este proyecto es privado y confidencial.

## 🤝 Soporte

Para problemas o preguntas, contacta al equipo de desarrollo.
