import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { Ticket } from 'src/tickets/entities/ticket.entity';
// import { Lot } from 'src/lots/entities/lot.entity';
// import { Admin } from 'src/users/entities/admin.entity';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  imports: [TypeOrmModule.forFeature([])],
})
export class PaymentsModule {}
