import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn, TableInheritance } from 'typeorm';

@Entity('users')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class User {
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true
    })
    email: string;

    @Column('text', {
        select: false
    })
    password: string;

    @Column('text')
    userName: string;

    @Column('text', {
        default: 'member'
    })
    roles: string;

    @Column('timestamp', {
        default: () => 'CURRENT_TIMESTAMP'
    })
    registrationDate: Date;

    @Column('boolean', {
        default: true,
        nullable: true
    })
    isActive?: boolean;

    @Column('varchar', {
        nullable: true
    })
    type?: string;

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase().trim();
        if (!this.registrationDate) {
            this.registrationDate = new Date();
        }
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.checkFieldsBeforeInsert();   
    }
}
