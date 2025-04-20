// cape.get.tasks.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import { TaskListQueryDto } from '../dto/tasks.list.query.dto';

@Injectable()
export class CapeGetTasksRepository {
    constructor(@InjectKnex() private readonly knex: Knex) {}

    async getTotalTasks(query: TaskListQueryDto, path: string): Promise<{ data: any[] }> {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
    
        let qb = this.knex('capeTasks');
        if (path === 'active') {
            qb = qb.whereIn('status', ['pending', 'running', 'processing']);
        } else if (path === 'history') {
            qb = qb.whereIn('status', ['reported', 'failed', 'completed']);
        }

        if (query.status && query.status !== 'all') {
            qb = qb.where('status', query.status);
        }
    
        if (query.category && query.category !== 'all') {
            qb = qb.where('category', query.category);
        }
    
        if (query.incidentType && query.incidentType !== 'all') {
            qb = qb.where('incidentType', query.incidentType);
        }

        if (query.startedAt && query.startedAt !== 'all') {
            qb = qb.where('startedAt', '>=', query.startedAt);
        }
    
        if (query.completedAt && query.completedAt !== 'all') {
            qb = qb.where('completedAt', '<=', query.completedAt);
        }

        return { data: await qb.orderBy('createdAt', 'desc').limit(limit).offset(skip) };
    }
}