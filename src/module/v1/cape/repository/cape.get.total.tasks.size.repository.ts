// cape.get.total.tasks.size.repositry.ts
import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'nestjs-knex';

@Injectable()
export class CapeGetTotalTasksSizeRepository {
    constructor(@Inject('KNEX_PRIMARY') private readonly knex: Knex) {}

    async getTotalTasksSize(): Promise<any> {
        try {
            const result = await this.knex('capeTasks').count('* as total').first();

            return result ? result.total : 0;
        } catch (error) {
            throw new Error(`Failed to get total tasks size: ${error}`);
        }
    }
}
