// tasks.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';

@Injectable()
export class CapeTasksRepository {
    constructor(@InjectKnex() private readonly knex: Knex) {}

    async upsertTask(taskData: any): Promise<any> {
        let result;
        if (taskData.sha256) {
            const existing = await this.knex('capeTasks')
                .where('sha256', taskData.sha256)
                .first();

            if (existing) {
                [result] = await this.knex('capeTasks')
                    .where('sha256', taskData.sha256)
                    .update(taskData)
                    .returning('*');
            }
        }

        if (!result) {
            [result] = await this.knex('capeTasks')
                .insert(taskData)
                .returning('*');
        }

        return result;
    }
}