// cape.get.tasks.repository.ts
import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'nestjs-knex';
import { TaskListQueryDto } from '../dto/tasks.list.query.dto';

@Injectable()
export class CapeDatabaseRepository {
    constructor(@Inject('KNEX_SECONDARY') private readonly knex: Knex) {}

    async getTotalTasks(query: TaskListQueryDto, path: string): Promise<{ data: any[] }> {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        // const total = await this.knex('tasks').count('id as count');

        let qb = this.knex('tasks');
        if (path === 'active') {
            qb = qb.whereIn('tasks.status', ['pending', 'running', 'distributed']);
        } else if (path === 'history') {
            qb = qb.whereIn('tasks.status', ['reported', 'failed_reporting']);
        }

        if (query.status && query.status !== 'all') {
            if (query.status === 'completed') {
                qb = qb.whereIn('tasks.status', ['reported', 'completed']);
            } else if (query.status === 'failed') {
                qb = qb.where('tasks.status', 'failed_reporting');
            }
        }
        if (query.category && query.category !== 'all') {
            qb = qb.where('tasks.category', query.category);
        }
        // if (query.incidentType && query.incidentType !== 'all') {
        //     qb = qb.where('tasks.incident_type', query.incidentType);
        // }
        if (query.startedAt && query.startedAt !== 'all') {
            qb = qb.where('tasks.started_on', '>=', query.startedAt);
        }
        if (query.completedAt && query.completedAt !== 'all') {
            qb = qb.where('tasks.completed_on', '<=', query.completedAt);
        }

        qb.leftJoin('samples', 'tasks.sample_id', 'samples.id')
            .leftJoin('machines', 'tasks.machine_id', 'machines.id')
            .select(
                'tasks.id as id',
                'tasks.target as target',
                'tasks.category as category',
                'samples.file_size as fileSize',
                'samples.sha256 as sha256',
                'tasks.started_on as startedAt',
                'tasks.completed_on as completedAt',
                'tasks.status as status',
            );

        return { data: await qb.orderBy('tasks.id', 'desc').limit(limit).offset(skip) };
    }

    async getTaskByIdSample(taskId: number): Promise<any> {
        const task = await this.knex('tasks')
            .where('tasks.id', taskId)
            .join('samples', 'tasks.sample_id', 'samples.id')
            .select('tasks.id', 'samples.*')
            .first();
        return task;
    }

    async getTotalTasksSize(): Promise<number> {
        const result = await this.knex('tasks').count('* as total').first();
        return result ? Number(result.total) : 0;
    }

    async getTotalTasksByLastSevenDays(): Promise<any> {
        return this.knex('tasks')
            .select(this.knex.raw(`CAST("clock" AS DATE) as date`))
            .select(this.knex.raw(`to_char(CAST("clock" AS DATE), 'FMDay') as day_name`))
            .count({ total: '*' })
            .whereRaw(`"clock" >= now() - interval '6 days'`)
            .groupBy(['date', 'day_name'])
            .orderBy('date', 'asc');
    }

    async getTotalPendingTasksSize(): Promise<number> {
        const result = await this.knex('tasks')
            .whereIn('status', ['pending', 'running', 'distributed'])
            .count<{ total: string }>({ total: '*' })
            .first();

        return result ? parseInt(result.total, 10) : 0;
    }

    async getTotalMachinesSize(): Promise<number> {
        const result = await this.knex('machines').count<{ total: string }>({ total: '*' }).first();

        return result ? parseInt(result.total, 10) : 0;
    }
}
