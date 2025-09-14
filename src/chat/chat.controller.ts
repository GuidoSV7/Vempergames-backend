import { 
    Controller, 
    Get, 
    Post, 
    Patch, 
    Param, 
    Body, 
    Query, 
    UseGuards, 
    Request 
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { SupportAgentService } from './support-agent.service';
import { 
    CreateChatSessionDto, 
    SendMessageDto, 
    AssignSessionDto, 
    UpdatePriorityDto,
    ChatSessionsQueryDto,
    CreateSupportAgentDto 
} from './dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleProtected } from '../auth/decorators/role-protected.decorator';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { UserRoleGuard } from '../auth/guards/user-role.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';

@Controller('api/chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private readonly supportAgentService: SupportAgentService,
    ) {}

    // ===== USER ENDPOINTS =====

    @Get('session/active')
    async getActiveChatSession(@GetUser() user: User) {
        const session = await this.chatService.getActiveChatSession(user.id);
        return {
            success: true,
            data: session,
            message: 'Sesión obtenida exitosamente'
        };
    }

    @Post('session')
    async createChatSession(
        @GetUser() user: User,
        @Body() createChatSessionDto: CreateChatSessionDto
    ) {
        const session = await this.chatService.createChatSession(user.id, createChatSessionDto);
        return {
            success: true,
            data: session,
            message: 'Sesión creada exitosamente'
        };
    }

    @Get('session/:id/messages')
    async getChatMessages(
        @Param('id') sessionId: string,
        @GetUser() user: User
    ) {
        const messages = await this.chatService.getChatMessages(sessionId, user.id);
        return {
            success: true,
            data: messages,
            message: 'Mensajes obtenidos exitosamente'
        };
    }

    @Post('message')
    async sendUserMessage(
        @Body() sendMessageDto: SendMessageDto,
        @GetUser() user: User
    ) {
        // En un caso real, necesitarías obtener el sessionId de alguna manera
        // Por simplicidad, asumimos que se pasa en el body
        const { sessionId, ...messageData } = sendMessageDto as any;
        
        const message = await this.chatService.sendUserMessage(sessionId, user.id, messageData);
        return {
            success: true,
            data: message,
            message: 'Mensaje enviado exitosamente'
        };
    }

    @Patch('session/:id/close')
    async closeChatSession(
        @Param('id') sessionId: string,
        @GetUser() user: User
    ) {
        await this.chatService.closeChatSession(sessionId, user.id);
        return {
            success: true,
            message: 'Sesión cerrada exitosamente'
        };
    }

    @Patch('session/:id/mark-read')
    async markMessagesAsRead(
        @Param('id') sessionId: string,
        @GetUser() user: User
    ) {
        await this.chatService.markMessagesAsRead(sessionId, user.id);
        return {
            success: true,
            message: 'Mensajes marcados como leídos'
        };
    }

    // ===== SUPPORT ENDPOINTS =====

    @Get('sessions/all')
    @RoleProtected(ValidRoles.admin, ValidRoles.superUser)
    @UseGuards(UserRoleGuard)
    async getAllChatSessions(@Query() query: ChatSessionsQueryDto) {
        const { sessions, total } = await this.chatService.getAllChatSessions(query);
        return {
            success: true,
            data: {
                sessions,
                pagination: {
                    page: query.page || 1,
                    limit: query.limit || 20,
                    total,
                    totalPages: Math.ceil(total / (query.limit || 20))
                }
            },
            message: 'Sesiones obtenidas exitosamente'
        };
    }

    @Get('sessions/status/:status')
    @RoleProtected(ValidRoles.admin, ValidRoles.superUser)
    @UseGuards(UserRoleGuard)
    async getChatSessionsByStatus(@Param('status') status: string) {
        const sessions = await this.chatService.getChatSessionsByStatus(status as any);
        return {
            success: true,
            data: sessions,
            message: 'Sesiones obtenidas exitosamente'
        };
    }

    @Patch('session/:id/assign')
    @RoleProtected(ValidRoles.admin, ValidRoles.superUser)
    @UseGuards(UserRoleGuard)
    async assignChatSession(
        @Param('id') sessionId: string,
        @Body() assignSessionDto: AssignSessionDto
    ) {
        const session = await this.chatService.assignChatSession(sessionId, assignSessionDto);
        return {
            success: true,
            data: session,
            message: 'Sesión asignada exitosamente'
        };
    }

    @Post('session/:id/support-message')
    @RoleProtected(ValidRoles.admin, ValidRoles.superUser)
    @UseGuards(UserRoleGuard)
    async sendSupportMessage(
        @Param('id') sessionId: string,
        @Body() sendMessageDto: SendMessageDto,
        @GetUser() user: User
    ) {
        // En un caso real, necesitarías obtener el supportAgentId del usuario actual
        const supportAgentId = 'current-support-agent-id'; // Esto debería venir del usuario autenticado
        const message = await this.chatService.sendSupportMessage(sessionId, sendMessageDto.message, supportAgentId);
        return {
            success: true,
            data: message,
            message: 'Mensaje enviado exitosamente'
        };
    }

    @Get('stats')
    @RoleProtected(ValidRoles.admin, ValidRoles.superUser)
    @UseGuards(UserRoleGuard)
    async getChatStats() {
        const stats = await this.chatService.getChatStats();
        return {
            success: true,
            data: stats,
            message: 'Estadísticas obtenidas exitosamente'
        };
    }

    @Get('session/:id/details')
    @RoleProtected(ValidRoles.admin, ValidRoles.superUser)
    @UseGuards(UserRoleGuard)
    async getSessionDetails(@Param('id') sessionId: string) {
        const details = await this.chatService.getSessionDetails(sessionId);
        return {
            success: true,
            data: details,
            message: 'Detalles obtenidos exitosamente'
        };
    }

    @Patch('session/:id/priority')
    @RoleProtected(ValidRoles.admin, ValidRoles.superUser)
    @UseGuards(UserRoleGuard)
    async updateSessionPriority(
        @Param('id') sessionId: string,
        @Body() updatePriorityDto: UpdatePriorityDto
    ) {
        const session = await this.chatService.updateSessionPriority(sessionId, updatePriorityDto);
        return {
            success: true,
            data: session,
            message: 'Prioridad actualizada exitosamente'
        };
    }

    // ===== SUPPORT AGENTS ENDPOINTS =====

    @Get('support/agents')
    @RoleProtected(ValidRoles.admin, ValidRoles.superUser)
    @UseGuards(UserRoleGuard)
    async getAllSupportAgents() {
        const agents = await this.supportAgentService.getAllSupportAgents();
        return {
            success: true,
            data: agents,
            message: 'Agentes obtenidos exitosamente'
        };
    }

    @Post('support/agents')
    @RoleProtected(ValidRoles.admin, ValidRoles.superUser)
    @UseGuards(UserRoleGuard)
    async createSupportAgent(@Body() createSupportAgentDto: CreateSupportAgentDto) {
        const agent = await this.supportAgentService.createSupportAgent(createSupportAgentDto);
        return {
            success: true,
            data: agent,
            message: 'Agente creado exitosamente'
        };
    }
}
