import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessiontDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-session')
  createPaymentSession(@Body() paymentSessionDto:PaymentSessiontDto){

    return this.paymentsService.createPaymentSession(paymentSessionDto);
  }

  @Post('webhook')
  async stripewebhook(@Req() req: Request, @Res() res:Response){
    return this.paymentsService.stripeWebhook(req,res);
  }
  
}
