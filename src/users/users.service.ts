import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';

import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Repository, DataSource } from 'typeorm';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Admin } from './entities/admin.entity';
import { Member } from './entities/member.entity';
// import { Parking } from 'src/parkings/entities/parking.entity';

@Injectable()
export class UsersService {

  
  private readonly logger = new Logger('usersService');
  

  constructor(

   

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,

    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,


    private readonly dataSource: DataSource,
  ){}

  async create(createUserDto: CreateUserDto) {
    try {
      const {password, ...UserDetails} = createUserDto;
      const user= this.userRepository.create({
        ...UserDetails,
        password: bcrypt.hashSync( password, 10 )
      });

      return await this.userRepository.save(user);
      
    } catch (error) {
      
      this.logger.error(error.message);
      return error.message;
    }
  }

  findAll(paginationDto:PaginationDto) {

    const {limit = 10, offset = 0} = paginationDto;

    return this.userRepository.find({
      take: limit,
      skip: offset,
     
    });
    
  }

  findAllAdmins(paginationDto:PaginationDto) {

    const {limit = 10, offset = 0} = paginationDto;

    return this.adminRepository.find({
      take: limit,
      skip: offset,
      // relations: ['parkings'],

    });
    
  }

  findAllMembers(paginationDto:PaginationDto) {

    const {limit = 10, offset = 0} = paginationDto;

    return this.memberRepository.find({
      take: limit,
      skip: offset,
     

    });
    
  }

  async findOne(id : string) {

    let user: User;

      const queryBuilder = this.userRepository.createQueryBuilder();
      user= await queryBuilder
        .where('id =:id ',{
          id:id,
        })
        .getOne();

    if(!user){
      throw new NotFoundException( `User con id ${id} no encontrada`);
    }

    return user;
    
  }

  async update(id: string, updateUserDto: UpdateUserDto) {

    const {...toUpdate} = updateUserDto;

    const user= await this.userRepository.preload({ id,...toUpdate});

    if(!user){
      throw new NotFoundException(`User con id ${id} no encontrada`);
    }

    //Create Query Runner
    const queryRunner = this.dataSource.createQueryRunner();
    
    await queryRunner.connect();

    await queryRunner.startTransaction();

    try{



      await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOne(id);

    } catch{
      
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new InternalServerErrorException('Error al actualizar los datos de la User');
    }
  
    
  }




  async remove(id: string) {

    const user= await this.findOne(id);

    await this.userRepository.remove(user);

    return { mensaje: `La user con id ${id} se eliminó exitosamente.` };

  }

  async deleteAllUsers(){
    const query = this.userRepository.createQueryBuilder('user');

    try{
      return await query
       .delete()
       .where({})
       .execute(); 



    } catch(error){
      this.logger.error(error.message);
      return error.message;
    }
  }
  
}
