// ws-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { AuthenticatedSocket } from '../../types/types';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
    private readonly logger = new Logger(WsJwtAuthGuard.name);

    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client: AuthenticatedSocket = context.switchToWs().getClient<AuthenticatedSocket>();
        const token = this.extractTokenFromClient(client);
        if (!token) {
            throw new WsException('Token not found');
        }

        try {
            client.user = await this.jwtService.verifyAsync(token);
            return true;
        } catch (err: any) {
            this.logger.error(err.message);
            throw new WsException('Invalid token');
        }
    }

    private extractTokenFromClient(client: AuthenticatedSocket): string | null {
        return (
            (client?.handshake?.query?.token as string) ||
            client?.handshake?.auth?.token?.split(' ')[1] ||
            null
        );
    }
}
