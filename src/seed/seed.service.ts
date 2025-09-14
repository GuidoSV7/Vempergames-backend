import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../auth/entities/user.entity';
import { Member } from '../users/entities/member.entity';
import { Admin } from '../users/entities/admin.entity';
import { SuperAdmin } from '../users/entities/super-admin.entity';
import { SupportAgent } from '../chat/entities/support-agent.entity';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  private readonly logger = new Logger('SeedService');

  constructor(
    @InjectRepository( User )
    private readonly userRepository: Repository<User>,
    @InjectRepository( Member )
    private readonly memberRepository: Repository<Member>,
    @InjectRepository( Admin )
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository( SuperAdmin )
    private readonly superAdminRepository: Repository<SuperAdmin>,
    @InjectRepository( SupportAgent )
    private readonly supportAgentRepository: Repository<SupportAgent>
  ) {}

  async runSeed() {
    this.logger.log('🌱 Ejecutando seed manual...');
    
    await this.deleteTables();
    const adminUser = await this.insertUsers();

    this.logger.log('✅ Seed ejecutado exitosamente');
    return 'SEED EXECUTED';
  }

  async runSeedIfEmpty() {
    this.logger.log('🌱 Verificando si se necesita ejecutar seed...');
    
    // Verificar si ya existen usuarios
    const existingUsers = await this.userRepository.count();
    
    if (existingUsers > 0) {
      this.logger.log('⚠️ Ya existen usuarios en la base de datos. Saltando seed.');
      return 'SEED SKIPPED - Users already exist';
    }

    this.logger.log('🌱 No hay usuarios existentes. Ejecutando seed...');
    
    const adminUser = await this.insertUsers();

    this.logger.log('✅ Seed ejecutado exitosamente');
    return 'SEED EXECUTED';
  }

  async forceSeed() {
    this.logger.log('🌱 Forzando ejecución de seed...');
    
    await this.deleteTables();
    const adminUser = await this.insertUsers();

    this.logger.log('✅ Seed forzado ejecutado exitosamente');
    return 'FORCE SEED EXECUTED';
  }

  async deleteTables() {
    this.logger.log('🗑️ Limpiando tablas existentes...');
    
    // Limpiar tabla de SupportAgent primero (por las relaciones)
    await this.supportAgentRepository.delete({});
    this.logger.log('✅ Tabla support_agents limpiada');
    
    // Con @ChildEntity, todas las entidades se guardan en la misma tabla 'users'
    // Solo necesitamos limpiar la tabla principal
    await this.userRepository.delete({});
    
    this.logger.log('✅ Tabla users limpiada');
  }

  private async insertUsers() {
    this.logger.log('👥 Creando usuarios desde seed-data...');

    const createdUsers = [];

    for (const userData of initialData.users) {
      let savedUser;

      switch (userData.roles) {
        case 'superadmin':
          const superAdmin = this.superAdminRepository.create({
            email: userData.email,
            userName: userData.userName,
            password: userData.password,
            roles: userData.roles,
            isActive: userData.isActive
          });
          savedUser = await this.superAdminRepository.save(superAdmin);
          this.logger.log(`✅ SuperAdmin creado: ${userData.userName}`);
          break;

        case 'admin':
          const admin = this.adminRepository.create({
            email: userData.email,
            userName: userData.userName,
            password: userData.password,
            roles: userData.roles,
            isActive: userData.isActive
          });
          savedUser = await this.adminRepository.save(admin);
          this.logger.log(`✅ Admin creado: ${userData.userName}`);
          break;

        case 'member':
          const member = this.memberRepository.create({
            email: userData.email,
            userName: userData.userName,
            password: userData.password,
            roles: userData.roles,
            balance: userData.balance || 0,
            discount: userData.discount || 0,
            isActive: userData.isActive
          });
          savedUser = await this.memberRepository.save(member);
          this.logger.log(`✅ Member creado: ${userData.userName}`);
          break;

        case 'support':
          // Crear usuario support (se guarda en la tabla users)
          const supportUser = this.userRepository.create({
            email: userData.email,
            userName: userData.userName,
            password: userData.password,
            roles: userData.roles,
            isActive: userData.isActive
          });
          savedUser = await this.userRepository.save(supportUser);
          
          // Crear SupportAgent
          const supportAgent = this.supportAgentRepository.create({
            userId: savedUser.id,
            name: userData.userName,
            email: userData.email,
            isActive: true,
            maxConcurrentChats: 10,
            currentActiveChats: 0
          });
          await this.supportAgentRepository.save(supportAgent);
          this.logger.log(`✅ Support creado: ${userData.userName} con SupportAgent`);
          break;

        case 'reseller':
          // Crear usuario reseller (se guarda en la tabla users)
          const resellerUser = this.userRepository.create({
            email: userData.email,
            userName: userData.userName,
            password: userData.password,
            roles: userData.roles,
            isActive: userData.isActive
          });
          savedUser = await this.userRepository.save(resellerUser);
          this.logger.log(`✅ Reseller creado: ${userData.userName}`);
          break;

        default:
          this.logger.warn(`⚠️ Rol no reconocido: ${userData.roles}`);
          continue;
      }

      createdUsers.push(savedUser);
    }

    this.logger.log('✅ Todos los usuarios creados exitosamente');
    return createdUsers[0]; // Retornar el primer usuario (SuperAdmin)
  }
}
