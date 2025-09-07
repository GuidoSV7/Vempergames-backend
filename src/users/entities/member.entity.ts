import { User } from "src/auth/entities/user.entity";
import { Column, Entity, TableInheritance } from "typeorm";

@Entity('users')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class Member extends User {
  
  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0
  })
  balance: number;

  @Column('decimal', {
    precision: 5,
    scale: 2,
    default: 0
  })
  discount: number;

  @Column('boolean', {
    default: true
  })
  isActive: boolean;
}
