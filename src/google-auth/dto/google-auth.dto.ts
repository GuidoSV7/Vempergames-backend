import { IsEmail, IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty()
  googleId: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsUrl()
  picture?: string;
}

export class GoogleAuthResponseDto {
  success: boolean;
  data: {
    id: string;
    email: string;
    roles: string;
    token: string;
    adminData: any;
    isNewUser: boolean;
  };
  message: string;
}

export class GoogleCallbackDto {
  @IsString()
  token: string;
}
