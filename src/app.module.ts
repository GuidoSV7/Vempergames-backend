import { join } from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';


import { UsersModule } from './users/users.module';

import { PaymentsModule } from './payments/payments.module';
;
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),  

    
    TypeOrmModule.forRoot({
      ssl: process.env.STAGE === 'prod',
      extra: {
        ssl: process.env.STAGE === 'prod'
              ? { rejectUnauthorized: false }
              : null,
      },
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,      
      autoLoadEntities: true,
      synchronize: true,
    }),


  //p

    CommonModule,

    SeedModule,

    FilesModule,

    AuthModule,

    UsersModule,





    PaymentsModule,



    ProductsModule



  ],
})
export class AppModule {
  constructor() {
    
    
  }
}

