import { User } from "src/auth/entities/user.entity";
import { ChildEntity } from "typeorm";

@ChildEntity('superadmin')
export class SuperAdmin extends User {
  // SuperAdmin hereda todos los campos de User
  // El campo 'type' se establecerá automáticamente como 'SuperAdmin'
  // No tiene campos específicos como balance o discount
}
