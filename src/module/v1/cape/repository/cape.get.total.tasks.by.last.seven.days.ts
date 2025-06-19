// cape.get.total.tasks.by.last.seven.days.repository.ts
import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'nestjs-knex';

export interface TaskCountByDay {
    date: string;
    day_name: string;
    total: string;
}

@Injectable()
export class CapeGetTotalTasksByLastSevenDaysRepository {
    constructor(@Inject('KNEX_PRIMARY') private readonly knex: Knex) {}

    async getTotalTasksByLastSevenDays(): Promise<TaskCountByDay[]> {
        return this.knex('capeTasks')
            .select(this.knex.raw(`CAST("createdAt" AS DATE) as date`))
            .select(this.knex.raw(`to_char(CAST("createdAt" AS DATE), 'FMDay') as day_name`))
            .count({ total: '*' })
            .whereRaw(`"createdAt" >= now() - interval '6 days'`)
            .groupBy(['date', 'day_name'])
            .orderBy('date', 'asc');
    }
}
