import { Provider } from '@nestjs/common';
import knex from 'knex';
import knexConfig from './knexfile';

export const PrimaryKnexProvider: Provider = {
    provide: 'KNEX_PRIMARY',
    useValue: knex(knexConfig['primary']),
};

export const SecondaryKnexProvider: Provider = {
    provide: 'KNEX_SECONDARY',
    useValue: knex(knexConfig['secondary']),
};
