// deactivate.signature.repository.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';

@Injectable()
export class DeactivateSignatureRepository {
    constructor(@InjectKnex() private readonly knex: Knex) {}

    async deactivateSignature(id: string): Promise<any> {
        const result = await this.knex('signatureUploads')
            .where({ id })
            .update({ status: 'inactive' });

        if (result === 0) {
            throw new HttpException('Signature not found', HttpStatus.NOT_FOUND);
        }

        return result;
    }
}