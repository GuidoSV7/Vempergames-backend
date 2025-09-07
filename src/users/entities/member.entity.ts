import { User } from "src/auth/entities/user.entity";
import { Entity, Column } from "typeorm";

@Entity('users')
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
