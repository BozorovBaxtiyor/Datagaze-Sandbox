// cape.get.incident.distribution.repository.ts
import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'nestjs-knex';

@Injectable()
export class CapeGetIncidentDistributionRepository {
    constructor(@Inject('KNEX_PRIMARY') private readonly knex: Knex) {}

    async getIncidentDistribution(): Promise<{ incidentType: string; total: string }[]> {
        return this.knex('capeTasks')
            .select('incidentType')
            .count({ total: '*' })
            .groupBy('incidentType');
    }
}
