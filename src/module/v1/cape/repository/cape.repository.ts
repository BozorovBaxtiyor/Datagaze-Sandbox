import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class CapeRepository {
    constructor(@Inject('KNEX_PRIMARY') private readonly knex: Knex) {}

    async deleteTaskByTaskId(taskId: string): Promise<void> {
        await this.knex('capeTasks').where('taskId', taskId).del();
    }
}
