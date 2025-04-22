// cape.get.username.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';

@Injectable()
export class CapeGetUsernameRepository {
    constructor(@InjectKnex() private readonly knex: Knex) {}

    async getUsernameById(userId: string): Promise<string | null> {
        const result = await this.knex('users').select('username').where('id', userId).first();
        return result ? result.username : null;
    }
}