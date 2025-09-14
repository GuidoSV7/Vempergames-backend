import { IsUUID, IsString, IsNotEmpty, IsInt, Min, Max } from 'class-validator';

export class CreateSupportAgentDto {
    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsInt()
    @Min(1)
    @Max(20)
    maxConcurrentChats: number;
}
