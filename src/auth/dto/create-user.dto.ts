import { IsEmail, IsString, MaxLength, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    password: string;

    @IsString()
    @MinLength(1)
    userName: string;

    @IsString()
    @IsOptional()
    rol?: string;

}