// cape.get.incident.distribution.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';

@Injectable()
export class CapeGetIncidentDistributionRepository {
    constructor(@InjectKnex() private readonly knex: Knex) {}

    async getIncidentDistribution(): Promise<{ incidentType: string; total: string }[]> {
        return this.knex('capeTasks').select('incidentType').count({ total: '*' }).groupBy('incidentType');
    }
}
