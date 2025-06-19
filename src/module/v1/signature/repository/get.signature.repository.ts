// get.signature.repository.ts
import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'nestjs-knex';

@Injectable()
export class GetSignatureRepository {
    constructor(@Inject('KNEX_PRIMARY') private readonly knex: Knex) {}

    async getSignatureById(id: string): Promise<any> {
        return this.knex('signatureUploads').where({ id }).first();
    }
}
