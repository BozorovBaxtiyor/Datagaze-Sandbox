// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DatabaseModule } from './module/v1/database/database.module';
import { AuthModule } from './module/v1/auth/auth.module';
import { CapeModule } from './module/v1/cape/cape.module';
import { SignatureModule } from './module/v1/signature/signature.module';

@Module({
    imports: [
        ServeStaticModule.forRoot(
            {
                rootPath: join(__dirname, 'module/v1/cape/file/images'), 
                serveRoot: '/images', 
            },
            {
                rootPath: join(__dirname, 'module/v1/auth/uploads/profiles'), 
                serveRoot: '/profiles', 
            }
        ),
		ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        DatabaseModule,
		AuthModule,
		CapeModule,
        SignatureModule,
	],
    controllers: [],
    providers: [],
})
export class AppModule {}