import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PaymentSessiontDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
// import { Ticket } from 'src/tickets/entities/ticket.entity';
import { Repository, DataSource } from 'typeorm';
// import { Lot } from 'src/lots/entities/lot.entity';
// import { Admin } from 'src/users/entities/admin.entity';

@Injectable()
export class PaymentsService {
  

  constructor(
    // @InjectRepository(Ticket)
    // private readonly ticketRepository: Repository<Ticket>,

    // @InjectRepository(Lot)
    // private readonly lotRepository: Repository<Lot>,

    // @InjectRepository(Admin)
    // private readonly adminRepository: Repository<Admin>,
    
    private readonly dataSource: DataSource,
  ){}

  private readonly stripe = new Stripe(process.env.STRIPE_SECRET);

  async createPaymentSession(paymenSessionDto: PaymentSessiontDto){
    const { items, orderId, typePayment, idUser} = paymenSessionDto;

    const lineItems = items.map(item => {

      return {
        price_data:{
          currency: 'usd',
          product_data:{
            name: item.name
          },
          unit_amount: Math.round(item.price * 100)
        },
        quantity: item.quantity
      };

    });


    const session = await this.stripe.checkout.sessions.create({
      
      payment_intent_data: {
        metadata:{
          orderId: orderId,
          idUser: idUser,
          typePayment: typePayment,

        }
      },

      line_items:lineItems,
      mode: 'payment',
      success_url: process.env.STRIPE_SUCCESS,
      cancel_url: process.env.STRIPE_CANCEL,

    });

    return {
      cancelUrl: session.cancel_url,
      successUrl: session.success_url,
      url: session.url,
    }
  }

  async stripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];

    let event: Stripe.Event;

    // Real
    const endpointSecret = process.env.stripeEndpointSecret;

    try {
      event = this.stripe.webhooks.constructEvent(
        req['rawBody'],
        sig,
        endpointSecret,
      );
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
    console.log('aqui llega');
    switch( event.type ) {
      case 'charge.succeeded': 
        const chargeSucceeded = event.data.object;

        // if (chargeSucceeded.metadata.typePayment === 'Ticket') {
        //   const ticket = await this.ticketRepository.findOne({
        //     where: {
        //       id: chargeSucceeded.metadata.orderId,
        //     }
        //   });
        
          
        
        //   if (ticket) {
        //     await this.ticketRepository.update(ticket.id, {
        //       state: 'paid',
        //     });

          

        //   }
        // } else if (chargeSucceeded.metadata.typePayment === 'Subscription') {

        //   const manager = await this.managerRepository.findOne({
        //     where: {
        //       id: chargeSucceeded.metadata.idUser,
        //     },
        //   });

        //   if (manager) {
        //     await this.managerRepository.update(manager.id, {
        //       IsSuscribed: true,
        //     });
        //   }
        
        //   // console.log(chargeSucceeded.metadata)
        

        // }

      break;
      
      default:
        console.log(`Event ${ event.type } not handled`);
    }

    return res.status(200).json({ sig });
  }
}
