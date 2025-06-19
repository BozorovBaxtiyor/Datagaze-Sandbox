// activate.signature.repository.ts
import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'nestjs-knex';

@Injectable()
export class ActivateSignatureRepository {
    constructor(@Inject('KNEX_PRIMARY') private readonly knex: Knex) {}

    async activateSignature(id: string): Promise<void> {
        await this.knex('signatureUploads').where({ id }).update({ status: 'active' });
    }
}
