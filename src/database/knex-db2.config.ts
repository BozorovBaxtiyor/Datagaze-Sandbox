import { Knex } from 'knex';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface ExtendedConnectionOptions extends Knex.PgConnectionConfig {
    ssl?: {
        rejectUnauthorized: boolean;
        require?: boolean;
    };
}

export const db2Config: Knex.Config = {
    client: 'pg',
    connection: {
        host: process.env.CAPE_DB_HOST,
        port: parseInt(process.env.CAPE_DB_PORT || '25060', 10),
        user: process.env.CAPE_DB_USER,
        password: process.env.CAPE_DB_PASSWORD,
        database: process.env.CAPE_DB_NAME,
        ssl: {
            rejectUnauthorized: false,
            require: true,
        },
        connectionTimeoutMillis: 600000,
    } as ExtendedConnectionOptions,
    // pool: { min: 2, max: 10 },
    // migrations: {
    //     directory: path.resolve(process.cwd(), 'src/database/migrations/db2'),
    //     tableName: 'knex_migrations_secondary',
    // },
    // seeds: {
    //     directory: path.resolve(process.cwd(), 'src/database/seeds/db2'),
    // },
};
