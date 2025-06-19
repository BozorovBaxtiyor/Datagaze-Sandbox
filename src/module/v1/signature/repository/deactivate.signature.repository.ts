// deactivate.signature.repository.ts
import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'nestjs-knex';

@Injectable()
export class DeactivateSignatureRepository {
    constructor(@Inject('KNEX_PRIMARY') private readonly knex: Knex) {}

    async deactivateSignature(id: string): Promise<void> {
        await this.knex('signatureUploads').where({ id }).update({ status: 'inactive' });
    }
}
