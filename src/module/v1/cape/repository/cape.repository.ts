import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class CapeRepository {
    constructor(@Inject('KNEX_PRIMARY') private readonly knex: Knex) {}

   
}
