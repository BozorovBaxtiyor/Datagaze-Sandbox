// get.signature.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import { GetSignaturesQueryDto } from '../dto/get.signatures.query.dto';

@Injectable()
export class GetSignatureRepository {
    constructor(@InjectKnex() private readonly knex: Knex) {}

    async getSignatureById(id: string): Promise<any> {
        return this.knex('signatureUploads').where({ id }).first();
    }
}