import { Provider } from '@nestjs/common';
import { MongoClient } from 'mongodb';

export const MongoProvider: Provider = {
    provide: 'MONGO_CONNECTION',
    useFactory: async () => {
        const client = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017', {});
        await client.connect();
        return client.db(process.env.MONGO_DB_NAME);
    },
};
