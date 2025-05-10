// activate.signature.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';

@Injectable()
export class ActivateSignatureRepository {
    constructor(@InjectKnex() private readonly knex: Knex) {}

    async activateSignature(id: string): Promise<void> {
        await this.knex('signatureUploads').where({ id }).update({ status: 'active' });
    }
}