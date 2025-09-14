import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ChatSessionStatus } from '../entities';

export class ChatSessionsQueryDto {
    @IsOptional()
    @IsEnum(ChatSessionStatus)
    status?: ChatSessionStatus;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @IsOptional()
    @IsEnum(['createdAt', 'lastMessageAt', 'priority'])
    sortBy?: string = 'lastMessageAt';

    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'desc';
}
