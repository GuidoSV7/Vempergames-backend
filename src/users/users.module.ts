import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Member } from './entities/member.entity';
import { Admin } from './entities/admin.entity';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports:[TypeOrmModule.forFeature([User, Member, Admin]),
    AuthModule
  ],
  exports: [UsersService, TypeOrmModule]
})
export class UsersModule {}
