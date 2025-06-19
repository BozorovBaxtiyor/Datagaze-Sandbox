// cape.get.taskId.repositry.ts
import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'nestjs-knex';

@Injectable()
export class CapeGetTaskIdRepository {
    constructor(@Inject('KNEX_PRIMARY') private readonly knex: Knex) {}

    async getTaskIdByUserId(userId: string): Promise<string[]> {
        const taskIds = await this.knex('capeTasks').select('taskId').where('createdBy', userId);
        return taskIds.map(task => task.taskId);
    }
}
