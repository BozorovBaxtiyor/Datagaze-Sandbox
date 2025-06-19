// cape.get.total.pending.tasks.size.repository.ts
import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'nestjs-knex';

@Injectable()
export class CapeGetTotalPendingTasksSizeRepository {
    constructor(@Inject('KNEX_PRIMARY') private readonly knex: Knex) {}

    async getTotalPendingTasksSize(): Promise<number> {
        const result = await this.knex('capeTasks')
            .where('status', 'pending')
            .count<{ total: string }>({ total: '*' })
            .first();

        return result ? parseInt(result.total, 10) : 0;
    }
}
