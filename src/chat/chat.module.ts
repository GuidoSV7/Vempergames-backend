import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { SupportAgentService } from './support-agent.service';
import { ChatGateway } from './chat.gateway';
import { 
    ChatSession, 
    ChatMessage, 
    SupportAgent 
} from './entities';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ChatSession,
            ChatMessage,
            SupportAgent
        ]),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-secret-key',
            signOptions: { expiresIn: '24h' },
        })
    ],
    controllers: [ChatController],
    providers: [ChatService, SupportAgentService, ChatGateway],
    exports: [ChatService, SupportAgentService, ChatGateway]
})
export class ChatModule {}
