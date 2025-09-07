import { User } from "src/auth/entities/user.entity";
import { Column, ChildEntity } from "typeorm";

@ChildEntity('member')  
export class Member extends User {
  // Campos específicos de Member
  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true
  })
  balance?: number;

  @Column('decimal', {
    precision: 5,
    scale: 2,
    default: 0,
    nullable: true
  })
  discount?: number;
}
