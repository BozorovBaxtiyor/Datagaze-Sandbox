// get.signatures.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import { GetSignaturesQueryDto } from '../dto/get.signatures.query.dto';

@Injectable()
export class GetSignaturesRepository {
    constructor(@InjectKnex() private readonly knex: Knex) {}

    async getSignaturesByUserId(query: GetSignaturesQueryDto): Promise<any> {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const data = await this.knex('signatureUploads')
            .orderBy('uploadedAt', 'desc') 
            .select('id', 'name', 'status', 'category', 'uploadedBy', 'lastModifiedAt', 'uploadedAt')
            .limit(limit)
            .offset(skip);

        return { data };
    }

}