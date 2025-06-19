// cape.upsert.task.repository.ts
import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'nestjs-knex';

@Injectable()
export class CapeUpsertTaskRepository {
    constructor(@Inject('KNEX_PRIMARY') private readonly knex: Knex) {}

    async upsertTask(taskData: any): Promise<any> {
        const existing = await this.knex('capeTasks').where('taskId', taskData.taskId).first();

        if (existing) {
            const [result] = await this.knex('capeTasks')
                .where('taskId', taskData.taskId)
                .update(taskData)
                .returning('*');
            return result;
        }

        const [result] = await this.knex('capeTasks').insert(taskData).returning('*');
        return result;
    }
}
