import { Injectable, BadRequestException, InternalServerErrorException, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../auth/entities/user.entity';
import { Member } from '../users/entities/member.entity';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { GoogleAuthDto } from './dto/google-auth.dto';

@Injectable()
export class GoogleAuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private readonly jwtService: JwtService,
  ) {}

  async validateGoogleUser(googleUser: any) {
    try {
      const { email, name, googleId } = googleUser;

      // Check if user already exists
      let existingUser = await this.userRepository.findOne({
        where: { email }
      });

      if (existingUser) {
        // Update Google ID if not set
        if (!existingUser.googleId) {
          existingUser.googleId = googleId;
          await this.userRepository.save(existingUser);
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = existingUser;

        return {
          ...userWithoutPassword,
          token: this.getJwtToken({ id: existingUser.id })
        };
      }

      // Create new user with Google data
      const newUser = this.userRepository.create({
        email,
        userName: name, // Use name as userName
        googleId,
        roles: 'member', // Default role for Google users
        isActive: true,
        password: null // No password for Google users
      });

      const savedUser = await this.userRepository.save(newUser);

      // Create corresponding member record
      const member = this.memberRepository.create({
        email,
        userName: name, // Use name as userName
        googleId,
        roles: 'member',
        balance: 0,
        discount: 0,
        isActive: true,
        password: null
      });

      await this.memberRepository.save(member);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = savedUser;

      return {
        ...userWithoutPassword,
        token: this.getJwtToken({ id: savedUser.id })
      };

    } catch (error) {
      console.error('Error validating Google user:', error);
      throw new InternalServerErrorException('Error processing Google authentication');
    }
  }

  async findOrCreateUser(googleProfile: any) {
    try {
      const { emails, displayName, id: googleId } = googleProfile;
      const email = emails[0]?.value;
      const name = displayName;

      if (!email) {
        throw new BadRequestException('Email not provided by Google');
      }

      // Check if user exists
      let user = await this.userRepository.findOne({
        where: { email }
      });

      if (user) {
        // Update Google ID if not set
        if (!user.googleId) {
          user.googleId = googleId;
          await this.userRepository.save(user);
        }

        const { password: _, ...userWithoutPassword } = user;
        return {
          ...userWithoutPassword,
          token: this.getJwtToken({ id: user.id })
        };
      }

      // Create new user
      const newUser = this.userRepository.create({
        email,
        userName: name,
        googleId,
        roles: 'member',
        isActive: true,
        password: null
      });

      const savedUser = await this.userRepository.save(newUser);

      // Create corresponding member record
      const member = this.memberRepository.create({
        email,
        userName: name,
        googleId,
        roles: 'member',
        balance: 0,
        discount: 0,
        isActive: true,
        password: null
      });

      await this.memberRepository.save(member);

      const { password: _, ...userWithoutPassword } = savedUser;
      return {
        ...userWithoutPassword,
        token: this.getJwtToken({ id: savedUser.id })
      };

    } catch (error) {
      console.error('Error finding or creating user:', error);
      throw new InternalServerErrorException('Error processing Google authentication');
    }
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };
  }

  async authenticateWithGoogle(googleAuthDto: GoogleAuthDto) {
    try {
      const { googleId, email, name, picture } = googleAuthDto;

      // Validar que googleId no esté vacío
      if (!googleId || googleId.trim() === '') {
        throw new BadRequestException('El ID de Google es requerido');
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new BadRequestException('El email no es válido');
      }

      // Validar que name no esté vacío
      if (!name || name.trim() === '') {
        throw new BadRequestException('El nombre es requerido');
      }

      // Verificar que el googleId sea único
      const existingUserByGoogleId = await this.userRepository.findOne({
        where: { googleId }
      });

      if (existingUserByGoogleId && existingUserByGoogleId.email !== email) {
        throw new ConflictException('Ya existe un usuario con este Google ID');
      }

      // Buscar usuario existente por email
      let existingUser = await this.userRepository.findOne({
        where: { email: email.toLowerCase() }
      });

      let isNewUser = false;

      if (existingUser) {
        // Usuario existe - verificar si ya tiene googleId
        if (existingUser.googleId && existingUser.googleId !== googleId) {
          throw new ConflictException('Ya existe un usuario con este email vinculado a otra cuenta de Google');
        }

        // Actualizar googleId si no lo tiene
        if (!existingUser.googleId) {
          existingUser.googleId = googleId;
          await this.userRepository.save(existingUser);
        }

        // Actualizar userName si es diferente
        if (existingUser.userName !== name) {
          existingUser.userName = name;
          await this.userRepository.save(existingUser);
        }

        const { password: _, ...userWithoutPassword } = existingUser;

        return {
          id: existingUser.id,
          email: existingUser.email,
          roles: existingUser.roles,
          token: this.getJwtToken({ id: existingUser.id }),
          adminData: null,
          isNewUser: false
        };
      }

      // Crear nuevo usuario
      const newUser = this.userRepository.create({
        email: email.toLowerCase(),
        userName: name,
        googleId,
        roles: 'member', // Rol por defecto para usuarios de Google
        isActive: true,
        password: null, // No password para usuarios de Google
        registrationDate: new Date()
      });

      const savedUser = await this.userRepository.save(newUser);

      // Crear registro correspondiente en Member
      const member = this.memberRepository.create({
        email: email.toLowerCase(),
        userName: name,
        googleId,
        roles: 'member',
        balance: 0,
        discount: 0,
        isActive: true,
        password: null
      });

      await this.memberRepository.save(member);

      const { password: _, ...userWithoutPassword } = savedUser;

      return {
        id: savedUser.id,
        email: savedUser.email,
        roles: savedUser.roles,
        token: this.getJwtToken({ id: savedUser.id }),
        adminData: null,
        isNewUser: true
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('Error en autenticación con Google:', error);
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }
}