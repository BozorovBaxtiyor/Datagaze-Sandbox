import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IJwtPayloadForAgent } from 'src/common/types/types';

@Injectable()
export class JwtAuthForComputersGuard {
    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Token not found');
        }

        try {
            const payload = await this.jwtService.verify<IJwtPayloadForAgent>(token, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });
            request.agent = payload;
        } catch {
            throw new UnauthorizedException('Invalid token');
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const authHeader = request.headers['authorization'] ?? '';

        const [type, token] = authHeader.split(' ');

        return type === 'Bearer' ? token : undefined;
    }
}
