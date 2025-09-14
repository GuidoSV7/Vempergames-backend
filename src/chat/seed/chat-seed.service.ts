import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportAgent } from '../entities';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class ChatSeedService {
    constructor(
        @InjectRepository(SupportAgent)
        private readonly supportAgentRepository: Repository<SupportAgent>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async runSeed() {
        await this.createSupportAgents();
    }

    private async createSupportAgents() {
        // Buscar usuarios admin para convertirlos en agentes de soporte
        const adminUsers = await this.userRepository.find({
            where: { roles: 'admin' }
        });

        for (const user of adminUsers) {
            const existingAgent = await this.supportAgentRepository.findOne({
                where: { userId: user.id }
            });

            if (!existingAgent) {
                const supportAgent = this.supportAgentRepository.create({
                    userId: user.id,
                    name: user.userName,
                    email: user.email,
                    isActive: true,
                    maxConcurrentChats: 10,
                    currentActiveChats: 0
                });

                await this.supportAgentRepository.save(supportAgent);
                console.log(`✅ Agente de soporte creado para: ${user.userName}`);
            }
        }

        // Crear un usuario de soporte de ejemplo si no existe
        const supportUser = await this.userRepository.findOne({
            where: { email: 'support@example.com' }
        });

        if (!supportUser) {
            const newSupportUser = this.userRepository.create({
                email: 'support@example.com',
                userName: 'Agente de Soporte',
                roles: 'support',
                isActive: true
            });

            const savedUser = await this.userRepository.save(newSupportUser);

            const supportAgent = this.supportAgentRepository.create({
                userId: savedUser.id,
                name: 'Agente de Soporte',
                email: 'support@example.com',
                isActive: true,
                maxConcurrentChats: 5,
                currentActiveChats: 0
            });

            await this.supportAgentRepository.save(supportAgent);
            console.log('✅ Usuario de soporte de ejemplo creado');
        }
    }
}
