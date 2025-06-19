// get.signatures.repository.ts
import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'nestjs-knex';
import { GetSignaturesQueryDto } from '../dto/get.signatures.query.dto';

@Injectable()
export class GetSignaturesRepository {
    constructor(@Inject('KNEX_PRIMARY') private readonly knex: Knex) {}

    async getSignatures(query: GetSignaturesQueryDto): Promise<any> {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        let qb = this.knex('signatureUploads');

        if (query.status && query.status !== 'all') {
            qb = qb.where('status', query.status);
        }

        if (query.category && query.category !== 'all') {
            qb = qb.where('category', query.category);
        }

        // if (query.incidentType && query.incidentType !== 'all') {
        //     qb = qb.where('incidentType', query.incidentType);
        // }

        return { data: await qb.orderBy('uploadedAt', 'desc').limit(limit).offset(skip) };
    }
}
