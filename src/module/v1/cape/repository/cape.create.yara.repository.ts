// cape.create.yara.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';

@Injectable()
export class CapeCreateYaraRepository {
    constructor(@InjectKnex() private readonly knex: Knex) {}

    async createSignature(signature: any): Promise<any> {
        const [result] = await this.knex('signatureUploads')
            .insert({
                ...signature,
                uploadedAt: new Date().toISOString(),
                status: signature.status || 'active'
            })
            .returning('*');
        
        return result;
    }
}