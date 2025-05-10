// deactivate.signature.repository.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';

@Injectable()
export class DeactivateSignatureRepository {
    constructor(@InjectKnex() private readonly knex: Knex) {}

    async deactivateSignature(id: string): Promise<void> {
        await this.knex('signatureUploads').where({ id }).update({ status: 'inactive' });
    }
}