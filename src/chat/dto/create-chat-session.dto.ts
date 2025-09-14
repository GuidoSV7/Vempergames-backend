import { IsOptional, IsEnum } from 'class-validator';
import { ChatSessionPriority } from '../entities';

export class CreateChatSessionDto {
    @IsOptional()
    @IsEnum(ChatSessionPriority)
    priority?: ChatSessionPriority;
}
