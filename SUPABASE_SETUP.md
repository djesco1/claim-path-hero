# Configuración de Supabase para ClaimPath

## 🔐 Configuración de Google OAuth

Para habilitar el inicio de sesión con Google, sigue estos pasos:

### 1. Configurar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Navega a **APIs & Services > Credentials**
4. Haz clic en **Create Credentials > OAuth 2.0 Client ID**
5. Configura la pantalla de consentimiento si aún no lo has hecho
6. Selecciona **Web application** como tipo de aplicación
7. Agrega las siguientes URIs autorizadas:

**Authorized JavaScript origins:**
```
http://localhost:5173
https://tu-dominio.com
```

**Authorized redirect URIs:**
```
https://jmqetqycoysgwtuaiylg.supabase.co/auth/v1/callback
http://localhost:5173/auth/callback
```

8. Guarda el **Client ID** y **Client Secret**

### 2. Configurar Supabase

1. Ve a tu [Supabase Dashboard](https://app.supabase.com/)
2. Selecciona tu proyecto: `jmqetqycoysgwtuaiylg`
3. Navega a **Authentication > Providers**
4. Busca **Google** en la lista de proveedores
5. Habilita el toggle de Google
6. Ingresa tu **Client ID** y **Client Secret** de Google
7. Guarda los cambios

### 3. Verificar la Configuración

Una vez configurado:

1. Reinicia el servidor de desarrollo
2. Ve a la página de login
3. Haz clic en "Continuar con Google"
4. Deberías ser redirigido a la pantalla de consentimiento de Google
5. Después de autorizar, serás redirigido de vuelta a la aplicación

## 📧 Configuración de Email

La autenticación por email ya está configurada y funcionando. Supabase envía emails de verificación automáticamente.

### Personalizar Templates de Email

1. Ve a **Authentication > Email Templates** en Supabase
2. Personaliza los siguientes templates:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

## 🗄️ Base de Datos

### Tablas Principales

- `users` - Perfiles de usuario
- `claims` - Reclamaciones
- `documents` - Documentos adjuntos
- `claim_embeddings` - Embeddings para búsqueda semántica

### Políticas RLS (Row Level Security)

Todas las tablas tienen políticas RLS habilitadas para proteger los datos:

- Los usuarios solo pueden ver y editar sus propios datos
- Las reclamaciones compartidas tienen políticas especiales
- Los administradores tienen acceso completo

## 🔧 Edge Functions

Las siguientes Edge Functions están configuradas:

### 1. `extract-text`
Extrae texto de documentos PDF e imágenes usando OCR.

**Endpoint:** `https://jmqetqycoysgwtuaiylg.supabase.co/functions/v1/extract-text`

### 2. `generate-claim`
Genera documentos legales usando IA basándose en la información del usuario.

**Endpoint:** `https://jmqetqycoysgwtuaiylg.supabase.co/functions/v1/generate-claim`

### 3. `legal-assistant`
Asistente conversacional para consultas legales.

**Endpoint:** `https://jmqetqycoysgwtuaiylg.supabase.co/functions/v1/legal-assistant`

### 4. `embed-claim`
Genera embeddings para búsqueda semántica de reclamaciones.

**Endpoint:** `https://jmqetqycoysgwtuaiylg.supabase.co/functions/v1/embed-claim`

## 🔑 Variables de Entorno

Las siguientes variables ya están configuradas en `.env`:

```env
SUPABASE_URL=https://jmqetqycoysgwtuaiylg.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_URL=https://jmqetqycoysgwtuaiylg.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=jmqetqycoysgwtuaiylg
```

⚠️ **Importante**: Nunca compartas estas claves públicamente. El archivo `.env` debe estar en `.gitignore`.

## 🚀 Despliegue

### Variables de Entorno en Producción

Asegúrate de configurar las mismas variables de entorno en tu plataforma de hosting:

- Vercel: Settings > Environment Variables
- Netlify: Site settings > Build & deploy > Environment
- Railway: Variables tab

### URL de Callback en Producción

Después de desplegar, actualiza las URLs de callback en:

1. **Google Cloud Console**: Agrega tu dominio de producción
2. **Supabase**: Las URLs de callback se actualizan automáticamente

## 📊 Monitoreo

### Logs de Supabase

- **Database Logs**: Consultas SQL y errores
- **Auth Logs**: Intentos de login y registro
- **Edge Function Logs**: Ejecución de funciones

Accede a los logs en: **Project Settings > Logs**

## 🔒 Seguridad

### Mejores Prácticas Implementadas

✅ Row Level Security (RLS) habilitado en todas las tablas
✅ Validación de entrada con Zod
✅ Sanitización de datos
✅ HTTPS obligatorio en producción
✅ Tokens JWT con expiración
✅ Rate limiting en Edge Functions

### Recomendaciones Adicionales

- [ ] Configurar 2FA para cuentas de administrador
- [ ] Implementar rate limiting en el frontend
- [ ] Agregar CAPTCHA en formularios de registro
- [ ] Configurar alertas de seguridad
- [ ] Realizar auditorías de seguridad periódicas

## 📞 Soporte

Si tienes problemas con la configuración de Supabase:

1. Revisa la [documentación oficial](https://supabase.com/docs)
2. Consulta los logs en el dashboard
3. Contacta al equipo de desarrollo
