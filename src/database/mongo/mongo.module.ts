import { Module } from '@nestjs/common';
import { MongoProvider } from './providers/mongo.provider';

@Module({
    providers: [MongoProvider],
    exports: [MongoProvider],
})
export class MongoDatabaseModule {}
