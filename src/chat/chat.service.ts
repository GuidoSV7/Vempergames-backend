import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { 
    ChatSession, 
    ChatMessage, 
    SupportAgent, 
    ChatSessionStatus, 
    ChatSessionPriority,
    MessageSender 
} from './entities';
import { 
    CreateChatSessionDto, 
    SendMessageDto, 
    AssignSessionDto, 
    UpdatePriorityDto,
    ChatSessionsQueryDto 
} from './dto';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(ChatSession)
        private readonly chatSessionRepository: Repository<ChatSession>,
        @InjectRepository(ChatMessage)
        private readonly chatMessageRepository: Repository<ChatMessage>,
        @InjectRepository(SupportAgent)
        private readonly supportAgentRepository: Repository<SupportAgent>,
    ) {}

    // ===== USER ENDPOINTS =====

    async getActiveChatSession(userId: string): Promise<ChatSession | null> {
        return await this.chatSessionRepository.findOne({
            where: { 
                userId, 
                status: ChatSessionStatus.ACTIVE 
            },
            relations: ['messages', 'supportAgent'],
            order: { messages: { timestamp: 'ASC' } }
        });
    }

    async createChatSession(userId: string, createChatSessionDto: CreateChatSessionDto): Promise<ChatSession> {
        // Verificar si ya existe una sesión activa
        const existingSession = await this.getActiveChatSession(userId);
        if (existingSession) {
            throw new ConflictException('Ya tienes una sesión de chat activa');
        }

        const session = this.chatSessionRepository.create({
            userId,
            status: ChatSessionStatus.PENDING,
            priority: createChatSessionDto.priority || ChatSessionPriority.MEDIUM,
            lastMessageAt: new Date()
        });

        return await this.chatSessionRepository.save(session);
    }

    async getChatMessages(sessionId: string, userId: string): Promise<ChatMessage[]> {
        const session = await this.chatSessionRepository.findOne({
            where: { id: sessionId, userId }
        });

        if (!session) {
            throw new NotFoundException('Sesión de chat no encontrada');
        }

        return await this.chatMessageRepository.find({
            where: { sessionId },
            order: { timestamp: 'ASC' }
        });
    }

    async sendUserMessage(sessionId: string, userId: string, sendMessageDto: SendMessageDto): Promise<ChatMessage> {
        const session = await this.chatSessionRepository.findOne({
            where: { id: sessionId, userId }
        });

        if (!session) {
            throw new NotFoundException('Sesión de chat no encontrada');
        }

        if (session.status === ChatSessionStatus.CLOSED) {
            throw new BadRequestException('No puedes enviar mensajes a una sesión cerrada');
        }

        const message = this.chatMessageRepository.create({
            sessionId,
            message: sendMessageDto.message,
            sender: MessageSender.USER,
            timestamp: new Date()
        });

        // Actualizar timestamp de la sesión
        session.lastMessageAt = new Date();
        if (session.status === ChatSessionStatus.PENDING) {
            session.status = ChatSessionStatus.ACTIVE;
        }

        await this.chatSessionRepository.save(session);
        return await this.chatMessageRepository.save(message);
    }

    async closeChatSession(sessionId: string, userId: string): Promise<void> {
        const session = await this.chatSessionRepository.findOne({
            where: { id: sessionId, userId }
        });

        if (!session) {
            throw new NotFoundException('Sesión de chat no encontrada');
        }

        session.status = ChatSessionStatus.CLOSED;
        await this.chatSessionRepository.save(session);
    }

    async markMessagesAsRead(sessionId: string, userId: string): Promise<void> {
        const session = await this.chatSessionRepository.findOne({
            where: { id: sessionId, userId }
        });

        if (!session) {
            throw new NotFoundException('Sesión de chat no encontrada');
        }

        await this.chatMessageRepository.update(
            { sessionId, sender: MessageSender.SUPPORT, isRead: false },
            { isRead: true }
        );
    }

    // ===== SUPPORT ENDPOINTS =====

    async getAllChatSessions(query: ChatSessionsQueryDto): Promise<{ sessions: ChatSession[], total: number }> {
        const { status, page = 1, limit = 20, sortBy = 'lastMessageAt', sortOrder = 'desc' } = query;
        
        const queryBuilder = this.chatSessionRepository
            .createQueryBuilder('session')
            .leftJoinAndSelect('session.user', 'user')
            .leftJoinAndSelect('session.supportAgent', 'supportAgent')
            .leftJoinAndSelect('session.messages', 'messages')
            .orderBy(`session.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

        if (status) {
            queryBuilder.where('session.status = :status', { status });
        }

        const [sessions, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { sessions, total };
    }

    async getChatSessionsByStatus(status: ChatSessionStatus): Promise<ChatSession[]> {
        return await this.chatSessionRepository.find({
            where: { status },
            relations: ['user', 'supportAgent', 'messages'],
            order: { lastMessageAt: 'DESC' }
        });
    }

    async assignChatSession(sessionId: string, assignSessionDto: AssignSessionDto): Promise<ChatSession> {
        const session = await this.chatSessionRepository.findOne({
            where: { id: sessionId }
        });

        if (!session) {
            throw new NotFoundException('Sesión de chat no encontrada');
        }

        const supportAgent = await this.supportAgentRepository.findOne({
            where: { id: assignSessionDto.supportAgentId, isActive: true }
        });

        if (!supportAgent) {
            throw new NotFoundException('Agente de soporte no encontrado o inactivo');
        }

        if (supportAgent.currentActiveChats >= supportAgent.maxConcurrentChats) {
            throw new ConflictException('El agente de soporte ha alcanzado su límite de chats concurrentes');
        }

        session.supportAgentId = assignSessionDto.supportAgentId;
        session.assignedAt = new Date();
        session.status = ChatSessionStatus.ACTIVE;

        // Actualizar contador del agente
        supportAgent.currentActiveChats += 1;
        await this.supportAgentRepository.save(supportAgent);

        return await this.chatSessionRepository.save(session);
    }

    async sendSupportMessage(sessionId: string, message: string, supportAgentId: string): Promise<ChatMessage> {
        const session = await this.chatSessionRepository.findOne({
            where: { id: sessionId, supportAgentId }
        });

        if (!session) {
            throw new NotFoundException('Sesión de chat no encontrada o no asignada a este agente');
        }

        const chatMessage = this.chatMessageRepository.create({
            sessionId,
            message,
            sender: MessageSender.SUPPORT,
            timestamp: new Date()
        });

        // Actualizar timestamp de la sesión
        session.lastMessageAt = new Date();
        await this.chatSessionRepository.save(session);

        return await this.chatMessageRepository.save(chatMessage);
    }

    async updateSessionPriority(sessionId: string, updatePriorityDto: UpdatePriorityDto): Promise<ChatSession> {
        const session = await this.chatSessionRepository.findOne({
            where: { id: sessionId }
        });

        if (!session) {
            throw new NotFoundException('Sesión de chat no encontrada');
        }

        session.priority = updatePriorityDto.priority;
        return await this.chatSessionRepository.save(session);
    }

    async getChatStats(): Promise<{
        totalSessions: number;
        activeSessions: number;
        pendingSessions: number;
        closedSessions: number;
        averageResponseTime: number;
        sessionsToday: number;
        sessionsThisWeek: number;
        sessionsThisMonth: number;
    }> {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [
            totalSessions,
            activeSessions,
            pendingSessions,
            closedSessions,
            sessionsToday,
            sessionsThisWeek,
            sessionsThisMonth
        ] = await Promise.all([
            this.chatSessionRepository.count(),
            this.chatSessionRepository.count({ where: { status: ChatSessionStatus.ACTIVE } }),
            this.chatSessionRepository.count({ where: { status: ChatSessionStatus.PENDING } }),
            this.chatSessionRepository.count({ where: { status: ChatSessionStatus.CLOSED } }),
            this.chatSessionRepository.count({ where: { createdAt: Between(startOfDay, now) } }),
            this.chatSessionRepository.count({ where: { createdAt: Between(startOfWeek, now) } }),
            this.chatSessionRepository.count({ where: { createdAt: Between(startOfMonth, now) } })
        ]);

        // Calcular tiempo promedio de respuesta (simplificado)
        const averageResponseTime = 5.2; // En minutos - esto debería calcularse basado en datos reales

        return {
            totalSessions,
            activeSessions,
            pendingSessions,
            closedSessions,
            averageResponseTime,
            sessionsToday,
            sessionsThisWeek,
            sessionsThisMonth
        };
    }

    async getSessionDetails(sessionId: string): Promise<{
        session: ChatSession;
        user: { id: string; email: string; userName: string };
        agent?: { id: string; name: string };
    }> {
        const session = await this.chatSessionRepository.findOne({
            where: { id: sessionId },
            relations: ['user', 'supportAgent', 'messages']
        });

        if (!session) {
            throw new NotFoundException('Sesión de chat no encontrada');
        }

        return {
            session,
            user: {
                id: session.user.id,
                email: session.user.email,
                userName: session.user.userName
            },
            agent: session.supportAgent ? {
                id: session.supportAgent.id,
                name: session.supportAgent.name
            } : undefined
        };
    }
}
