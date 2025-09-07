import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { ValidRoles } from '../auth/interfaces';
import { Auth } from '../auth/decorators';

import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  @ApiOperation({ summary: 'Ejecutar seed solo si no hay usuarios existentes' })
  @ApiResponse({ status: 200, description: 'Seed ejecutado o saltado' })
  executeSeedIfEmpty() {
    return this.seedService.runSeedIfEmpty();
  }


}
