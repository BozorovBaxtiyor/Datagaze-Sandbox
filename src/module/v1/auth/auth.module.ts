// auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { AuthController } from './auth.controller';
import { JwtAuthModule } from './jwt-auth.module';

@Module({
    imports: [JwtAuthModule],
    providers: [AuthService, AuthRepository],
    controllers: [AuthController],
})
export class AuthModule {}
