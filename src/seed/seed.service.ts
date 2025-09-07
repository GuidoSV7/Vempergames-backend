import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../auth/entities/user.entity';
import { Member } from '../users/entities/member.entity';
import { Admin } from '../users/entities/admin.entity';

@Injectable()
export class SeedService {

  private readonly logger = new Logger('SeedService');

  constructor(
    @InjectRepository( User )
    private readonly userRepository: Repository<User>,
    @InjectRepository( Member )
    private readonly memberRepository: Repository<Member>,
    @InjectRepository( Admin )
    private readonly adminRepository: Repository<Admin>
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

  private async deleteTables() {
    this.logger.log('🗑️ Limpiando tablas existentes...');
    
    // Limpiar todas las tablas en orden correcto
    await this.memberRepository.delete({});
    await this.adminRepository.delete({});
    await this.userRepository.delete({});
    
    this.logger.log('✅ Tablas limpiadas');
  }

  private async insertUsers() {
    this.logger.log('👥 Creando usuarios de prueba...');

    // Crear usuario Admin
    const admin = this.adminRepository.create({
      email: 'admin@gmail.com',
      userName: 'Admin',
      password: bcrypt.hashSync('123456', 10),
      rol: 'admin',
      type: 'Admin' // Establecer explícitamente el tipo
    });

    // Crear usuario Member
    const member = this.memberRepository.create({
      email: 'member@gmail.com',
      userName: 'Member',
      password: bcrypt.hashSync('123456', 10),
      rol: 'member',
      balance: 0,
      discount: 0,
      isActive: true,
      type: 'Member' // Establecer explícitamente el tipo
    });

    // Guardar usuarios
    const savedAdmin = await this.adminRepository.save(admin);
    const savedMember = await this.memberRepository.save(member);

    this.logger.log('✅ Usuarios creados:');
    this.logger.log(`   👑 Admin: ${savedAdmin.email} (password: 123456)`);
    this.logger.log(`   👤 Member: ${savedMember.email} (password: 123456)`);

    return savedAdmin;
  }
}
