import { Knex } from 'knex';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
console.log(process.env.CAPE_DB_HOST, process.env.CAPE_DB_PORT, process.env.CAPE_DB_USER, process.env.CAPE_DB_PASSWORD, process.env.CAPE_DB_NAME);


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
    pool: { min: 2, max: 10 },
    
};
