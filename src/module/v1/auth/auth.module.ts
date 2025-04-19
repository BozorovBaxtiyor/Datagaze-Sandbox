// auth.module.ts
import { Module } from '@nestjs/common';
import { JwtAuthModule } from './jwt-auth.module';
import { AuthController } from './auth.controller';
import { AuthService } from './service/auth.service';
import { AuthLoginRepository } from './repository/login.repository';
// import { AuthRepository } from './auth.repository';

@Module({
    imports: [JwtAuthModule],
    providers: [AuthService, AuthLoginRepository],
    controllers: [AuthController],
})
export class AuthModule {}
