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

        let qb = this.knex('tasks');
        if (path === 'active') {
            qb = qb.whereIn('tasks.status', ['pending', 'running', 'processing']);
        } else if (path === 'history') {
            qb = qb.whereIn('tasks.status', ['reported', 'failed_reporting']);
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

        return { data: await qb.orderBy('tasks.id').limit(limit).offset(skip) };
    }
}
