import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class SendMessageDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000, { message: 'El mensaje no puede exceder los 1000 caracteres' })
    message: string;
}
