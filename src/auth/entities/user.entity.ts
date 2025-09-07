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
    rol: string;

    @Column('timestamp', {
        default: () => 'CURRENT_TIMESTAMP'
    })
    registrationDate: Date;

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
