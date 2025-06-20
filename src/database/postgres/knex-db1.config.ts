import * as dotenv from 'dotenv';
import { Knex } from 'knex';
import * as path from 'path';


dotenv.config({ path: path.resolve(__dirname, '../../../.env') });


interface ExtendedConnectionOptions extends Knex.PgConnectionConfig {
    ssl?: {
        rejectUnauthorized: boolean;
        require?: boolean;
    };
}

export const db1Config: Knex.Config = {
    client: 'pg',
    debug: process.env.NODE_ENV === 'development',
    connection: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '25060', 10),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: {
            rejectUnauthorized: false,
            require: true,
        },
        connectionTimeoutMillis: 600000,
    } as ExtendedConnectionOptions,
    pool: { min: 2, max: 10 },
    migrations: {
        directory: path.resolve(process.cwd(), 'src/database/postgres/migrations/db1'),
        tableName: 'knex_migrations',
    },
    seeds: {
        directory: path.resolve(process.cwd(), 'src/database/postgres/seeds/db1'),
    },
};
