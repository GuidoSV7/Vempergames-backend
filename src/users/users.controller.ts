import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';

import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from 'src/auth/dto';
import { ApiResponse } from '@nestjs/swagger';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiResponse({status:201, description:'user Creado exitosamente', type: User})
  @ApiResponse({status:400, description:'Bad Request'})
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll( @Query() paginationDto:PaginationDto)  {
    return this.usersService.findAll(paginationDto);
  }

 

  @Get('/members')
  findAllMembers( @Query() paginationDto:PaginationDto)  {
    console.log('Controlador: Recibida petición GET /users/members con parámetros:', paginationDto);
    return this.usersService.findAllMembers(paginationDto);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string ,
        @Body() updateUserDto: UpdateUserDto) 
        {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
