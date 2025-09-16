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
import { SuperAdmin } from 'src/users/entities/super-admin.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(SuperAdmin)
    private readonly superAdminRepository: Repository<SuperAdmin>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, roles = 'member', ...userData } = createUserDto;
      const hashedPassword = bcrypt.hashSync(password, 10);

      let savedUser;

      if (roles === 'member') {
        const member = this.memberRepository.create({
          ...userData,
          roles: 'member',
          password: hashedPassword,
          balance: 0,
          discount: 0,
          isActive: true
        });
        savedUser = await this.memberRepository.save(member);
      } else if (roles === 'admin') {
        const admin = this.adminRepository.create({
          ...userData,
          roles: 'admin',
          password: hashedPassword,
          isActive: true
        });
        savedUser = await this.adminRepository.save(admin);
      } else if (roles === 'superadmin') {
        const superAdmin = this.superAdminRepository.create({
          ...userData,
          roles: 'superadmin',
          password: hashedPassword,
          isActive: true
        });
        savedUser = await this.superAdminRepository.save(superAdmin);
      } else {
        const user = this.userRepository.create({
          ...userData,
          roles,
          password: hashedPassword,
          isActive: true
        });
        savedUser = await this.userRepository.save(user);
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = savedUser;

      return {
        ...userWithoutPassword,
        token: this.getJwtToken({ id: savedUser.id })
      };

    } catch (error) {
      console.error('Error creating user:', error);
      throw new BadRequestException('Error creating user');
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;
  
    // First find user with basic info + role
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, roles: true, id: true }
    });
  
    if (!user || !bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Invalid credentials');
  
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
      adminData
    };
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
}