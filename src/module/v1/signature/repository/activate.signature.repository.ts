// activate.signature.repository.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';

@Injectable()
export class ActivateSignatureRepository {
    constructor(@InjectKnex() private readonly knex: Knex) {}

    async activateSignature(id: string): Promise<any> {
        const result = await this.knex('signatureUploads')
            .where({ id })
            .update({ status: 'active' });

        if (result === 0) {
            throw new HttpException('Signature not found', HttpStatus.NOT_FOUND);
        }

        return result;
    }
}