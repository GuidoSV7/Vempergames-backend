import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { ChatMessage, MessageSender } from './entities';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId
  private connectedAgents = new Map<string, string>(); // agentId -> socketId
  private userSessions = new Map<string, string>(); // socketId -> sessionId

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      client.userRole = payload.roles;

      if (payload.roles === 'support' || payload.roles === 'admin' || payload.roles === 'superadmin') {
        this.connectedAgents.set(payload.sub, client.id);
        client.join('support-room');
        console.log(`Agente conectado: ${payload.sub}`);
        
        // Notificar al agente sobre sesiones pendientes
        this.notifyPendingSessions(client);
      } else {
        this.connectedUsers.set(payload.sub, client.id);
        client.join(`user-${payload.sub}`);
        console.log(`Usuario conectado: ${payload.sub}`);
      }

      client.emit('connected', { 
        message: 'Conectado al chat', 
        userId: payload.sub,
        role: payload.roles 
      });

    } catch (error) {
      console.error('Error de autenticación WebSocket:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    // Limpiar conexiones
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
    for (const [agentId, socketId] of this.connectedAgents.entries()) {
      if (socketId === client.id) {
        this.connectedAgents.delete(agentId);
        break;
      }
    }
    this.userSessions.delete(client.id);
    console.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('join-session')
  async handleJoinSession(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      client.join(`session-${data.sessionId}`);
      this.userSessions.set(client.id, data.sessionId);
      
      // Obtener mensajes existentes
      const messages = await this.chatService.getChatMessages(data.sessionId, client.userId!);
      client.emit('session-joined', { sessionId: data.sessionId, messages });
      
      console.log(`Cliente ${client.id} se unió a la sesión ${data.sessionId}`);
    } catch (error) {
      client.emit('error', { message: 'Error al unirse a la sesión' });
    }
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody() data: { sessionId: string; message: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const sender = client.userRole === 'support' || client.userRole === 'admin' || client.userRole === 'superadmin' 
        ? MessageSender.SUPPORT 
        : MessageSender.USER;

      // Guardar mensaje en BD
      const message = await this.chatService.sendMessage(
        data.sessionId,
        data.message,
        sender,
        client.userId!
      );

      // Emitir a todos los conectados a la sesión
      this.server.to(`session-${data.sessionId}`).emit('new-message', message);
      
      // Notificar a agentes si es mensaje de usuario
      if (sender === MessageSender.USER) {
        this.server.to('support-room').emit('new-user-message', {
          sessionId: data.sessionId,
          message,
          userId: client.userId,
        });
      }

      // Notificar al usuario si es mensaje de soporte
      if (sender === MessageSender.SUPPORT) {
        const session = await this.chatService.getSessionById(data.sessionId);
        if (session) {
          const userSocketId = this.connectedUsers.get(session.userId);
          if (userSocketId) {
            this.server.to(userSocketId).emit('new-support-message', {
              sessionId: data.sessionId,
              message,
            });
          }
        }
      }

    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      client.emit('error', { message: 'Error al enviar mensaje' });
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { sessionId: string; isTyping: boolean },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.to(`session-${data.sessionId}`).emit('user-typing', {
      isTyping: data.isTyping,
      userId: client.userId,
      userRole: client.userRole,
    });
  }

  @SubscribeMessage('mark-read')
  async handleMarkRead(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      await this.chatService.markMessagesAsRead(data.sessionId, client.userId!);
      client.emit('messages-marked-read', { sessionId: data.sessionId });
    } catch (error) {
      client.emit('error', { message: 'Error al marcar mensajes como leídos' });
    }
  }

  // Método para notificar cuando se asigna una sesión
  async notifySessionAssigned(sessionId: string, agentId: string) {
    const agentSocketId = this.connectedAgents.get(agentId);
    if (agentSocketId) {
      this.server.to(agentSocketId).emit('session-assigned', { sessionId });
    }
  }

  // Método para notificar nuevos chats pendientes
  async notifyNewPendingSession(sessionId: string, userId: string) {
    this.server.to('support-room').emit('new-pending-session', { 
      sessionId, 
      userId,
      timestamp: new Date().toISOString()
    });
  }

  // Método para notificar cuando se cierra una sesión
  async notifySessionClosed(sessionId: string, userId: string) {
    this.server.to(`session-${sessionId}`).emit('session-closed', { sessionId });
    this.server.to('support-room').emit('session-closed', { sessionId, userId });
  }

  // Notificar sesiones pendientes a un agente recién conectado
  private async notifyPendingSessions(client: AuthenticatedSocket) {
    try {
      const pendingSessions = await this.chatService.getChatSessionsByStatus('pending' as any);
      if (pendingSessions.length > 0) {
        client.emit('pending-sessions', { sessions: pendingSessions });
      }
    } catch (error) {
      console.error('Error al obtener sesiones pendientes:', error);
    }
  }

  // Método para obtener estadísticas en tiempo real
  async broadcastStats() {
    try {
      const stats = await this.chatService.getChatStats();
      this.server.to('support-room').emit('stats-update', stats);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
    }
  }

  // Método para notificar cambios en el estado de una sesión
  async notifySessionStatusChange(sessionId: string, status: string) {
    this.server.to(`session-${sessionId}`).emit('session-status-changed', { 
      sessionId, 
      status 
    });
    this.server.to('support-room').emit('session-status-changed', { 
      sessionId, 
      status 
    });
  }
}
