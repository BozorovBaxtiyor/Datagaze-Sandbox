// update.signature.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';

@Injectable()
export class UpdateSignatureRepository {
    constructor(@InjectKnex() private readonly knex: Knex) {}

    async updateSignature(id: string, signature: any): Promise<void> {
        await this.knex('signatureUploads')
        .where({ id })
        .update({ 
            ...signature,
            status: 'pending',
            uploadedAt: new Date().toISOString(),
        });
    }
}