// database.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KnexModule } from 'nestjs-knex';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        KnexModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                config: {
                    debug: configService.get<string>('NODE_ENV') === 'development',
                    client: 'pg',
                    connection: {
                        host: configService.get<string>('DB_HOST'),
                        port: Number(configService.get<string>('DB_PORT')),
                        user: configService.get<string>('DB_USER'),
                        password: configService.get<string>('DB_PASSWORD'),
                        database: configService.get<string>('DB_NAME'),
                        ssl: {
                            rejectUnauthorized: false,
                            require: true,
                        },
                    },
                    pool: { min: 2, max: 10 },
                },
            }),
        }),
    ],
    exports: [KnexModule],
})
export class DatabaseModule {}
