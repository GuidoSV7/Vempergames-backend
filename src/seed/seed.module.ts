import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './../auth/auth.module';
import { User } from '../auth/entities/user.entity';
import { Member } from '../users/entities/member.entity';
import { Admin } from '../users/entities/admin.entity';
import { SuperAdmin } from '../users/entities/super-admin.entity';
import { SupportAgent } from '../chat/entities/support-agent.entity';

import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    TypeOrmModule.forFeature([User, Member, Admin, SuperAdmin, SupportAgent]),
    AuthModule,
  ]
})
export class SeedModule {}
