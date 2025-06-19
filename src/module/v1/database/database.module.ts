import { Module } from '@nestjs/common';
import { PrimaryKnexProvider, SecondaryKnexProvider } from './database.providers';

@Module({
    providers: [PrimaryKnexProvider, SecondaryKnexProvider],
    exports: [PrimaryKnexProvider, SecondaryKnexProvider],
})
export class DatabaseModule {}
