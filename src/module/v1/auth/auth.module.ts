// auth.module.ts
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../database/postgres/database.module';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { JwtAuthModule } from './jwt-auth.module';

@Module({
    imports: [JwtAuthModule, DatabaseModule],
    providers: [AuthService, AuthRepository],
    controllers: [AuthController],
    exports: [JwtAuthModule, AuthRepository],
})
export class AuthModule {}
