# Chat Module

## 📋 Descripción
Módulo completo de chat y soporte al cliente que permite a los usuarios comunicarse con agentes de soporte y gestionar conversaciones en tiempo real.

## 🗄️ Entidades

### ChatSession
- **id**: UUID único de la sesión
- **userId**: ID del usuario que inició la sesión
- **supportAgentId**: ID del agente asignado (opcional)
- **status**: Estado de la sesión (active, closed, pending)
- **priority**: Prioridad de la sesión (low, medium, high)
- **assignedAt**: Fecha de asignación al agente
- **createdAt**: Fecha de creación
- **updatedAt**: Fecha de última actualización
- **lastMessageAt**: Fecha del último mensaje

### ChatMessage
- **id**: UUID único del mensaje
- **sessionId**: ID de la sesión a la que pertenece
- **message**: Contenido del mensaje
- **sender**: Quien envió el mensaje (user, support)
- **timestamp**: Fecha y hora del mensaje
- **isRead**: Si el mensaje ha sido leído
- **createdAt**: Fecha de creación

### SupportAgent
- **id**: UUID único del agente
- **userId**: ID del usuario asociado
- **name**: Nombre del agente
- **email**: Email del agente
- **isActive**: Si el agente está activo
- **maxConcurrentChats**: Máximo de chats simultáneos
- **currentActiveChats**: Chats activos actuales
- **createdAt**: Fecha de creación
- **updatedAt**: Fecha de última actualización

## 🔗 Endpoints

### Usuario (Autenticado)

#### GET /api/chat/session/active
Obtener sesión de chat activa del usuario

#### POST /api/chat/session
Crear nueva sesión de chat

#### GET /api/chat/session/:id/messages
Obtener mensajes de una sesión

#### POST /api/chat/message
Enviar mensaje (requiere sessionId en el body)

#### PATCH /api/chat/session/:id/close
Cerrar sesión de chat

#### PATCH /api/chat/session/:id/mark-read
Marcar mensajes como leídos

### Soporte (Rol: support, admin, superadmin)

#### GET /api/chat/sessions/all
Obtener todas las sesiones de chat con paginación

#### GET /api/chat/sessions/status/:status
Obtener sesiones por estado específico

#### PATCH /api/chat/session/:id/assign
Asignar sesión a un agente de soporte

#### POST /api/chat/session/:id/support-message
Enviar mensaje como agente de soporte

#### GET /api/chat/stats
Obtener estadísticas del dashboard

#### GET /api/chat/session/:id/details
Obtener detalles completos de una sesión

#### PATCH /api/chat/session/:id/priority
Cambiar prioridad de una sesión

### Gestión de Agentes (Rol: admin, superadmin)

#### GET /api/chat/support/agents
Obtener lista de agentes de soporte

#### POST /api/chat/support/agents
Crear nuevo agente de soporte

## 🔐 Autenticación y Autorización

- Todos los endpoints requieren autenticación JWT
- Los endpoints de soporte requieren rol `support`, `admin` o `superadmin`
- Los endpoints de gestión de agentes requieren rol `admin` o `superadmin`

## 📊 Características

### Tiempo Real
- Refetch automático de mensajes cada 5 segundos
- Refetch de sesiones cada 30 segundos
- Refetch de estadísticas cada minuto

### Validaciones
- Mensajes máximo 1000 caracteres
- Validación de sesiones activas
- Control de límites de chats concurrentes por agente
- Validación de permisos por rol

### Estadísticas
- Total de sesiones
- Sesiones activas, pendientes y cerradas
- Tiempo promedio de respuesta
- Sesiones por período (día, semana, mes)

## 🚀 Instalación

1. El módulo se importa automáticamente en `AppModule`
2. Las entidades se sincronizan automáticamente con la base de datos
3. Ejecutar migraciones si es necesario
4. Ejecutar seed para crear agentes de soporte iniciales

## 📝 Notas de Desarrollo

### DTOs
- Todos los DTOs incluyen validaciones con `class-validator`
- Transformaciones automáticas con `class-transformer`

### Servicios
- `ChatService`: Lógica principal de chat
- `SupportAgentService`: Gestión de agentes de soporte

### Base de Datos
- PostgreSQL con TypeORM
- Índices optimizados para consultas frecuentes
- Foreign keys con cascada apropiada

## 🔄 Flujo de Trabajo

1. **Usuario inicia chat** → Se crea sesión con estado `pending`
2. **Agente asigna sesión** → Estado cambia a `active`
3. **Comunicación bidireccional** → Mensajes entre usuario y agente
4. **Sesión se cierra** → Estado cambia a `closed`

## 📈 Métricas y Monitoreo

- Contador de chats activos por agente
- Tiempo de respuesta promedio
- Distribución de sesiones por estado
- Carga de trabajo por agente

## 🛠️ Extensibilidad

El módulo está diseñado para ser fácilmente extensible:

- Agregar nuevos tipos de mensaje
- Implementar WebSocket para tiempo real
- Agregar sistema de templates de respuestas
- Implementar notificaciones push
- Agregar sistema de calificaciones
