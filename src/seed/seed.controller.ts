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

  @Post('force')
  @ApiOperation({ summary: 'Forzar ejecución de seed (borra usuarios existentes)' })
  @ApiResponse({ status: 200, description: 'Seed ejecutado forzadamente' })
  // @Auth( ValidRoles.admin ) // Commented out for easier testing
  forceSeed() {
    return this.seedService.runSeed();
  }

  @Post('clean')
  @ApiOperation({ summary: 'Limpiar base de datos (borra todos los usuarios)' })
  @ApiResponse({ status: 200, description: 'Base de datos limpiada' })
  cleanDatabase() {
    return this.seedService.deleteTables();
  }
}
