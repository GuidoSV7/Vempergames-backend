import { User } from "src/auth/entities/user.entity";
import { Entity } from "typeorm";

@Entity('users')
export class Admin extends User {
  // Admin hereda todos los campos de User
  // El campo 'type' se establecerá automáticamente como 'Admin'
}
