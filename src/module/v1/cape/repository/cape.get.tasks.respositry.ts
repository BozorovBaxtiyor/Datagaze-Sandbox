// cape.get.tasks.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import { TaskListQueryDto } from '../dto/tasks.list.query.dto';

@Injectable()
export class CapeGetTasksRepository {
    constructor(@InjectKnex() private readonly knex: Knex) {}

    async getTotalTasks(query: TaskListQueryDto): Promise<{ data: any[] }> {
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
    
        return { data: await qb.orderBy('createdAt', 'desc').limit(limit).offset(skip) };
    }
}