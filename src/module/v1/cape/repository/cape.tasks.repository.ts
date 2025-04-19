// tasks.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import { TaskListQueryDto } from '../dto/tasks.list.query.dto';

@Injectable()
export class CapeTasksRepository {
    constructor(@InjectKnex() private readonly knex: Knex) {}

    async upsertTask(taskData: any): Promise<any> {
        if (!taskData.sha256) {
            throw new Error('Task must include sha256 to perform upsert.');
        }
    
        const existing = await this.knex('capeTasks')
            .where('sha256', taskData.sha256)
            .first();
    
        if (existing) {
            const [result] = await this.knex('capeTasks')
                .where('sha256', taskData.sha256)
                .update(taskData)
                .returning('*');
            return result;
        }
    
        const [result] = await this.knex('capeTasks').insert(taskData).returning('*');
        return result;
    }    

    async findAndCount(query: TaskListQueryDto): Promise<{ data: any[]; total: number }> {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        
        let qb = this.knex('capeTasks');
        
        if (query.status && query.status !== 'all') {
            qb = qb.where('status', query.status);
        }
    
        if (query.category && query.category !== 'all') {
            qb = qb.where('category', query.category);
        }
    
        if (query.incidentType && query.incidentType !== 'all') {
            qb = qb.where('incidentType', query.incidentType);
        }
    
        const countQuery = qb.clone().count('id as count').first();
        
        const dataQuery = qb.clone()
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .offset(skip);
    
        try {
            const [countResult, data] = await Promise.all([countQuery, dataQuery]);
            
            const total = countResult ? Number(countResult.count) : 0;
            
            return { 
                data, 
                total 
            };
        } catch (error) {
            throw new Error(`Failed to fetch tasks: ${error.message}`);
        }
    }
}