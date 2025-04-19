// auth.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import { User } from 'src/common/types/types';

@Injectable()
export class AuthLoginRepository {
    constructor(@InjectKnex() private readonly knex: Knex) {}

    async findUserByUsername(username: string): Promise<User | undefined> {
        return this.knex<User>('users').where({ username }).first();
    }
}
