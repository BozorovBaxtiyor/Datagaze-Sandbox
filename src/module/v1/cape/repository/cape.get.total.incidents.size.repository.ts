// cape.get.total.incidents.size.repositry.ts
import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'nestjs-knex';

@Injectable()
export class CapeGetTotalIncidentsSizeRepository {
    constructor(@Inject('KNEX_PRIMARY') private readonly knex: Knex) {}

    async getTotalIncidentsSize(): Promise<number> {
        try {
            const result = await this.knex('capeTasks')
                .count<{ total: string }>({ total: '*' })
                .whereNot('incidentType', 'unknown')
                .first();

            return result ? parseInt(result.total, 10) : 0;
        } catch (error) {
            throw new Error(`Failed to get total incidents size: ${error}`);
        }
    }
}
