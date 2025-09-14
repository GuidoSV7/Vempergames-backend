import { IsEnum, IsNotEmpty } from 'class-validator';
import { ChatSessionPriority } from '../entities';

export class UpdatePriorityDto {
    @IsEnum(ChatSessionPriority)
    @IsNotEmpty()
    priority: ChatSessionPriority;
}
