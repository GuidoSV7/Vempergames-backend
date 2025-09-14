# Google Auth Module

Este módulo proporciona funcionalidad de autenticación con Google OAuth 2.0 para la aplicación, siguiendo las especificaciones del `backend-requirements-googleAuth.md`.

## 🚀 Características

- ✅ **Autenticación directa con Google** - Endpoint POST para autenticación con datos de Google
- ✅ **OAuth 2.0 tradicional** - Flujo completo de OAuth con redirecciones
- ✅ **Creación automática de usuarios** - Registro automático de nuevos usuarios
- ✅ **Gestión de usuarios existentes** - Vinculación de cuentas Google con usuarios existentes
- ✅ **Generación de JWT** - Tokens seguros para autenticación
- ✅ **Validaciones completas** - Validación de datos de entrada y unicidad
- ✅ **Manejo de errores robusto** - Códigos de error específicos y mensajes claros

## 📋 Endpoints Disponibles

### 1. [POST] /api/auth/google
**Descripción:** Autenticación directa con datos de Google
**Headers:** 
- Content-Type: application/json

**Body:**
```json
{
    "googleId": "google-user-id",
    "email": "user@gmail.com",
    "name": "Usuario Nombre",
    "picture": "https://lh3.googleusercontent.com/..."
}
```

**Response (Usuario Existente):**
```json
{
    "success": true,
    "data": {
        "id": "user-uuid",
        "email": "user@gmail.com",
        "roles": "member",
        "token": "jwt-token",
        "adminData": null,
        "isNewUser": false
    },
    "message": "Inicio de sesión exitoso"
}
```

**Response (Usuario Nuevo):**
```json
{
    "success": true,
    "data": {
        "id": "user-uuid",
        "email": "user@gmail.com",
        "roles": "member",
        "token": "jwt-token",
        "adminData": null,
        "isNewUser": true
    },
    "message": "Usuario creado e iniciado sesión exitosamente"
}
```

### 2. [GET] /api/auth/google
**Descripción:** Inicia el flujo de OAuth tradicional de Google

### 3. [GET] /api/auth/google/callback
**Descripción:** Maneja el callback de OAuth de Google

### 4. [GET] /api/auth/google/profile
**Descripción:** Obtiene el perfil del usuario (requiere JWT)

## ⚙️ Configuración

### Variables de Entorno Requeridas
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-jwt-secret
```

### Configuración en Google Cloud Console
- [ ] Crear proyecto en Google Cloud Console
- [ ] Habilitar Google+ API
- [ ] Crear credenciales OAuth 2.0
- [ ] Configurar URIs de redirección autorizadas
- [ ] Configurar dominios autorizados

## 🔐 Validaciones Implementadas

### Autenticación con Google
- ✅ Validar que googleId no esté vacío
- ✅ Validar formato de email
- ✅ Validar que name no esté vacío
- ✅ Verificar que el googleId sea único
- ✅ Verificar que el email sea único (si no es usuario de Google existente)

### Crear Usuario de Google
- ✅ Asignar rol 'member' por defecto
- ✅ Establecer isActive como true
- ✅ Establecer registrationDate como fecha actual
- ✅ No requerir password para usuarios de Google
- ✅ Usar name como userName inicial

### Login de Usuario Existente
- ✅ Verificar que el usuario existe por googleId o email
- ✅ Actualizar googleId si el usuario existe pero no tiene googleId
- ✅ Generar nuevo JWT token
- ✅ Mantener roles existentes

## 🚨 Códigos de Error

### 400 - Bad Request
```json
{
    "success": false,
    "message": ["Error de validación específico"],
    "errors": {
        "googleId": ["El ID de Google es requerido"],
        "email": ["El email no es válido"],
        "name": ["El nombre es requerido"]
    }
}
```

### 401 - Unauthorized
```json
{
    "success": false,
    "message": "Token de Google inválido o expirado"
}
```

### 409 - Conflict
```json
{
    "success": false,
    "message": "Ya existe un usuario con este email"
}
```

### 500 - Internal Server Error
```json
{
    "success": false,
    "message": "Error interno del servidor"
}
```

## 🗄️ Base de Datos

### Campos Agregados a User Entity
- ✅ `googleId` - ID único de Google (nullable, unique)
- ✅ `password` - Hacer nullable para usuarios de Google
- ✅ Índice único en `googleId`
- ✅ Índice en `email` para búsquedas rápidas

## 🔄 Flujo de Usuario

### Autenticación Directa (Recomendado)
1. **Usuario hace clic en "Iniciar sesión con Google"**
2. **Frontend obtiene datos de Google Identity Services**
3. **Frontend envía datos al backend** (`POST /api/auth/google`)
4. **Backend verifica/crea usuario**
5. **Backend devuelve JWT token**
6. **Frontend guarda token y redirige**

### OAuth Tradicional
1. **Usuario hace clic en "Iniciar sesión con Google"**
2. **Se redirige a Google OAuth**
3. **Usuario autoriza la aplicación**
4. **Google redirige al callback**
5. **Backend procesa datos y redirige al frontend**
6. **Frontend recibe token y redirige**

## 🛡️ Seguridad

### Validación de Datos
- ✅ Validación de entrada con class-validator
- ✅ Sanitización de emails (lowercase)
- ✅ Verificación de unicidad de googleId y email
- ✅ Protección contra inyección SQL

### JWT Tokens
- ✅ Tokens seguros con expiración (2h)
- ✅ Payload mínimo (solo ID del usuario)
- ✅ Firma con secret configurable

### Rate Limiting
- ⚠️ **Pendiente:** Implementar rate limiting para prevenir abuso

## 📊 Lógica de Negocio

### Casos de Uso
1. **Usuario nuevo con Google** → Crear usuario y login
2. **Usuario existente sin Google** → Vincular Google ID y login
3. **Usuario existente con Google** → Login directo
4. **Conflicto de Google ID** → Error 409
5. **Conflicto de email** → Error 409

### Roles y Permisos
- ✅ Nuevos usuarios reciben rol 'member' por defecto
- ✅ Usuarios existentes mantienen sus roles
- ✅ No se permite cambio de email en usuarios de Google

## 🧪 Testing

### Casos de Prueba Recomendados
- [ ] Autenticación con usuario nuevo
- [ ] Autenticación con usuario existente
- [ ] Vinculación de Google ID a usuario existente
- [ ] Validación de datos de entrada
- [ ] Manejo de errores de validación
- [ ] Manejo de errores de base de datos
- [ ] Generación de JWT tokens

## 📦 Dependencias

```json
{
  "@nestjs/passport": "^10.0.0",
  "passport-google-oauth20": "^2.0.0",
  "@nestjs/jwt": "^10.0.0",
  "@nestjs/typeorm": "^10.0.0",
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.0"
}
```

## 🚀 Instalación

1. **Instalar dependencias:**
```bash
npm install @nestjs/passport passport-google-oauth20 @nestjs/jwt
```

2. **Configurar variables de entorno:**
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-jwt-secret
```

3. **El módulo ya está integrado en AppModule**

## 📝 Notas de Desarrollo

### Estructura del Módulo
```
src/google-auth/
├── dto/
│   ├── google-auth.dto.ts
│   └── index.ts
├── strategies/
│   └── google.strategy.ts
├── google-auth.controller.ts
├── google-auth.service.ts
├── google-auth.module.ts
├── google-oauth.config.ts
└── README.md
```

### Integración con Frontend
El módulo está diseñado para trabajar con:
- `GoogleLoginButton.tsx` - Componente de login con Google
- `LoginView.tsx` - Vista de login principal
- `authService.ts` - Servicio de autenticación del frontend

---

**Fecha de Actualización:** 2024-12-19
**Desarrollador:** AI Assistant
**Estado:** ✅ Completado según especificaciones
**Prioridad:** Alta
**Estimación:** 2-3 días (Completado)