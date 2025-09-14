import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    ManyToOne, 
    JoinColumn 
} from 'typeorm';
import { ChatSession } from './chat-session.entity';

export enum MessageSender {
    USER = 'user',
    SUPPORT = 'support'
}

@Entity('chat_messages')
export class ChatMessage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    sessionId: string;

    @Column('text')
    message: string;

    @Column({
        type: 'enum',
        enum: MessageSender
    })
    sender: MessageSender;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    timestamp: Date;

    @Column('boolean', { default: false })
    isRead: boolean;

    @CreateDateColumn()
    createdAt: Date;

    // Relations
    @ManyToOne(() => ChatSession, session => session.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sessionId' })
    session: ChatSession;
}
