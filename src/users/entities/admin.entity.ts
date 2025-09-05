import { User } from "src/auth/entities/user.entity";
import { Entity } from "typeorm";

@Entity('admins')
export class Admin extends User {
  // Admin hereda de User sin agregar propiedades específicas
  // Puede usar todas las propiedades de User
}
