import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn, 
    ManyToOne, 
    OneToMany, 
    JoinColumn 
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { ChatMessage } from './chat-message.entity';
import { SupportAgent } from './support-agent.entity';

export enum ChatSessionStatus {
    ACTIVE = 'active',
    CLOSED = 'closed',
    PENDING = 'pending'
}

export enum ChatSessionPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
}

@Entity('chat_sessions')
export class ChatSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    userId: string;

    @Column('uuid', { nullable: true })
    supportAgentId?: string;

    @Column({
        type: 'enum',
        enum: ChatSessionStatus,
        default: ChatSessionStatus.PENDING
    })
    status: ChatSessionStatus;

    @Column({
        type: 'enum',
        enum: ChatSessionPriority,
        default: ChatSessionPriority.MEDIUM
    })
    priority: ChatSessionPriority;

    @Column('timestamp', { nullable: true })
    assignedAt?: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    lastMessageAt: Date;

    // Relations
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => SupportAgent, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'supportAgentId' })
    supportAgent?: SupportAgent;

    @OneToMany(() => ChatMessage, message => message.session, { cascade: true })
    messages: ChatMessage[];
}
