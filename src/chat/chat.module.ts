import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { SupportAgentService } from './support-agent.service';
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
        ])
    ],
    controllers: [ChatController],
    providers: [ChatService, SupportAgentService],
    exports: [ChatService, SupportAgentService]
})
export class ChatModule {}
