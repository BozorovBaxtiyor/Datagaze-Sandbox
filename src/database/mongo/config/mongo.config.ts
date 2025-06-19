import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export default registerAs('mongo', () => ({
    uri: process.env.MONGO_URI,
    dbName: process.env.MONGO_DB_NAME || 'test',
    options: {
        debug: process.env.NODE_ENV === 'development',
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
}));
