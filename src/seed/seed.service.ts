import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../auth/entities/user.entity';
import { Member } from '../users/entities/member.entity';
import { Admin } from '../users/entities/admin.entity';
import { SuperAdmin } from '../users/entities/super-admin.entity';

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
    private readonly superAdminRepository: Repository<SuperAdmin>
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
    
    // Con @ChildEntity, todas las entidades se guardan en la misma tabla 'users'
    // Solo necesitamos limpiar la tabla principal
    await this.userRepository.delete({});
    
    this.logger.log('✅ Tabla users limpiada');
  }

  private async insertUsers() {
    this.logger.log('👥 Creando usuarios de prueba...');

    // Crear usuario SuperAdmin
    const superAdmin = this.superAdminRepository.create({
      email: 'superadmin@gmail.com',
      userName: 'SuperAdmin',
      password: bcrypt.hashSync('123456', 10),
      roles: 'superadmin',
      isActive: true
    });

    // Crear usuario Admin
    const admin = this.adminRepository.create({
      email: 'admin@gmail.com',
      userName: 'Admin',
      password: bcrypt.hashSync('123456', 10),
      roles: 'admin',
      isActive: true
    });

    // Crear usuario Member
    const member = this.memberRepository.create({
      email: 'member@gmail.com',
      userName: 'Member',
      password: bcrypt.hashSync('123456', 10),
      roles: 'member',
      balance: 0,
      discount: 0,
      isActive: true
    });

    // Guardar usuarios
    const savedSuperAdmin = await this.superAdminRepository.save(superAdmin);
    const savedAdmin = await this.adminRepository.save(admin);
    const savedMember = await this.memberRepository.save(member);

    this.logger.log('✅ Usuarios creados:');
    this.logger.log(`   🚀 SuperAdmin: ${savedSuperAdmin.email} (password: 123456)`);
    this.logger.log(`   👑 Admin: ${savedAdmin.email} (password: 123456)`);
    this.logger.log(`   👤 Member: ${savedMember.email} (password: 123456)`);

    return savedSuperAdmin;
  }
}
