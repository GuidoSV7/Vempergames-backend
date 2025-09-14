import { IsUUID, IsNotEmpty } from 'class-validator';

export class AssignSessionDto {
    @IsUUID()
    @IsNotEmpty()
    supportAgentId: string;
}
