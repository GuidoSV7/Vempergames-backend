import { User } from "src/auth/entities/user.entity";
import { ChildEntity } from "typeorm";

@ChildEntity('admin')
export class Admin extends User {

}
