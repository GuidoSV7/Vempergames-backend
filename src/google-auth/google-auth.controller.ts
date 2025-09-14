import { Controller, Get, Post, Req, Res, UseGuards, Body, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthService } from './google-auth.service';
import { GoogleAuthDto, GoogleAuthResponseDto } from './dto/google-auth.dto';

@Controller('auth/google')
export class GoogleAuthController {
  constructor(
    private readonly googleAuthService: GoogleAuthService,
    private readonly configService: ConfigService
  ) {}

  @Post()
  async googleAuth(@Body(ValidationPipe) googleAuthDto: GoogleAuthDto): Promise<GoogleAuthResponseDto> {
    try {
      const result = await this.googleAuthService.authenticateWithGoogle(googleAuthDto);
      
      return {
        success: true,
        data: result,
        message: result.isNewUser 
          ? 'Usuario creado e iniciado sesión exitosamente' 
          : 'Inicio de sesión exitoso'
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      console.error('Google auth error:', error);
      throw new HttpException(
        'Error interno del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuthInit(@Req() req) {
    // This endpoint initiates the Google OAuth flow
    // The user will be redirected to Google for authentication
  }

  @Get('callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res) {
    try {
      // The user data is available in req.user after Google authentication
      const googleUser = req.user;
      
      // Validate and create/find user
      const result = await this.googleAuthService.findOrCreateUser(googleUser);
      
      // Get frontend URL from environment variables
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      
      // Redirect to frontend with token
      res.redirect(`${frontendUrl}/auth/google/callback?token=${result.token}`);
    } catch (error) {
      console.error('Google auth callback error:', error);
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      res.redirect(`${frontendUrl}/auth/google/callback?error=authentication_failed`);
    }
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req) {
    // This endpoint can be used to get user profile after Google auth
    return req.user;
  }
}
