// jwt-auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET,
                signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION') },
            }),
        }),
    ],
    providers: [],
    exports: [JwtModule],
})
export class JwtAuthModule {}
