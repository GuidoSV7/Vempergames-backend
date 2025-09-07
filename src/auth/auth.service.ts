import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Member } from 'src/users/entities/member.entity';
import { Admin } from 'src/users/entities/admin.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, roles = 'member', ...userData } = createUserDto;

      // Create and save the user first
      const user = this.userRepository.create({
        ...userData,
        roles,
        password: bcrypt.hashSync(password, 10)
      });
      const savedUser = await this.userRepository.save(user);

      if (savedUser.roles === 'member') {
        await this.memberRepository.save(savedUser);
      }

      if (savedUser.roles === 'admin') {
        // Save the admin
        await this.adminRepository.save(savedUser);
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = savedUser;

      return {
        ...userWithoutPassword,
        token: this.getJwtToken({ id: savedUser.id })
      };

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;
  
    // First find user with basic info + role
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, roles: true, id: true }
    });
  
    if (!user)
      throw new UnauthorizedException('Credentials are not valid (email)');
  
    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid (password)');
  
    // If user is an admin, get associated data
    let adminData = null;
    if (user.roles === 'admin') {
      // Here you can add logic for admin-specific data
      adminData = { role: 'admin' };
    }
  
    // Remove password from user data
    const { password: _, ...userWithoutPassword } = user;
  
    return {
      ...userWithoutPassword,
      token: this.getJwtToken({ id: user.id }),
      adminData: adminData
    };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);
    
    console.log(error);
    throw new InternalServerErrorException('Please check server logs');
  }
}