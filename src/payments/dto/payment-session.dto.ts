import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsIn, IsNumber, IsOptional, IsPositive, IsString, ValidateIf, ValidateNested } from "class-validator";

export class PaymentSessiontDto {

    @IsString()
    @IsOptional()
    orderId?: string;

    @ValidateIf((o) => o.typePayment === 'Subscription')
    @IsString()
    idUser?: string;

    @IsIn(['Ticket', 'Subscription'], {
        message: 'typePayment must be either Ticket or Subscription',
      })
    typePayment: string;



    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({each:true})
    @Type(()=>PaymentSessionItemDto)
    items:PaymentSessionItemDto[];
}

export class PaymentSessionItemDto{
    @IsString()
    name: string;

    @IsNumber()
    @IsPositive()
    price: number;

    @IsNumber()
    @IsPositive()
    quantity: number;
}
