import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportAgent } from './entities';
import { CreateSupportAgentDto } from './dto';

@Injectable()
export class SupportAgentService {
    constructor(
        @InjectRepository(SupportAgent)
        private readonly supportAgentRepository: Repository<SupportAgent>,
    ) {}

    async getAllSupportAgents(): Promise<SupportAgent[]> {
        return await this.supportAgentRepository.find({
            relations: ['user'],
            order: { createdAt: 'DESC' }
        });
    }

    async getSupportAgentById(id: string): Promise<SupportAgent> {
        const agent = await this.supportAgentRepository.findOne({
            where: { id },
            relations: ['user']
        });

        if (!agent) {
            throw new NotFoundException('Agente de soporte no encontrado');
        }

        return agent;
    }

    async createSupportAgent(createSupportAgentDto: CreateSupportAgentDto): Promise<SupportAgent> {
        // Verificar si ya existe un agente para este usuario
        const existingAgent = await this.supportAgentRepository.findOne({
            where: { userId: createSupportAgentDto.userId }
        });

        if (existingAgent) {
            throw new ConflictException('Ya existe un agente de soporte para este usuario');
        }

        const agent = this.supportAgentRepository.create({
            ...createSupportAgentDto,
            email: '', // Se llenará desde la relación con User
            currentActiveChats: 0
        });

        return await this.supportAgentRepository.save(agent);
    }

    async updateSupportAgent(id: string, updateData: Partial<SupportAgent>): Promise<SupportAgent> {
        const agent = await this.getSupportAgentById(id);
        
        Object.assign(agent, updateData);
        return await this.supportAgentRepository.save(agent);
    }

    async deleteSupportAgent(id: string): Promise<void> {
        const agent = await this.getSupportAgentById(id);
        await this.supportAgentRepository.remove(agent);
    }

    async getActiveSupportAgents(): Promise<SupportAgent[]> {
        return await this.supportAgentRepository.find({
            where: { isActive: true },
            relations: ['user'],
            order: { currentActiveChats: 'ASC' } // Priorizar agentes con menos carga
        });
    }

    async updateAgentChatCount(agentId: string, increment: boolean): Promise<void> {
        const agent = await this.getSupportAgentById(agentId);
        
        if (increment) {
            agent.currentActiveChats += 1;
        } else {
            agent.currentActiveChats = Math.max(0, agent.currentActiveChats - 1);
        }

        await this.supportAgentRepository.save(agent);
    }
}
