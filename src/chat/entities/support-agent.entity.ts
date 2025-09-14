import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn, 
    ManyToOne, 
    JoinColumn 
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('support_agents')
export class SupportAgent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { unique: true })
    userId: string;

    @Column('varchar', { length: 255 })
    name: string;

    @Column('varchar', { length: 255 })
    email: string;

    @Column('boolean', { default: true })
    isActive: boolean;

    @Column('int', { default: 5 })
    maxConcurrentChats: number;

    @Column('int', { default: 0 })
    currentActiveChats: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relations
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;
}
