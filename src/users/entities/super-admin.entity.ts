import { User } from "src/auth/entities/user.entity";
import { Entity } from "typeorm";

@Entity('users')
export class SuperAdmin extends User {
  // SuperAdmin hereda todos los campos de User
  // El campo 'type' se establecerá automáticamente como 'SuperAdmin'
  // Puede tener campos específicos en el futuro si es necesario
}
