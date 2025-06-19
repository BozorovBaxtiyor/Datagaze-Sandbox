import { db1Config } from './knex-db1.config';
import { db2Config } from './knex-db2.config';

export default {
    primary: db1Config,
    secondary: db2Config,
};
