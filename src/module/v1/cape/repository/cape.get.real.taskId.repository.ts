// cape.get.real.taskId.repositry.ts
import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';

@Injectable()
export class CapeGetRealTaskIdRepository {
    constructor(@InjectKnex() private readonly knex: Knex) {}

    async getTaskIdByUserId(taskId: string): Promise<string | null> {
        try {
            const result = await this.knex('capeTasks')
                .select('taskId')
                .where('id', taskId)
                .first();

            return result ? result.taskId : null;
        } catch (error) {
            throw new Error(`Failed to get real taskId: ${error}`);
        }
    }
}