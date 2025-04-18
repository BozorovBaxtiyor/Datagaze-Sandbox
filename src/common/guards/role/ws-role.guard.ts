// ws-role.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UserRole, RoleLevel } from '../../enums/roles.enum';
import { ROLES_KEY } from '../../decorators/role.decorator';
import { JwtPayload, AuthenticatedSocket } from '../../types/types';

@Injectable()
export class WsRoleGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRole = this.reflector.get<UserRole>(
            ROLES_KEY,
            context.getHandler(),
        );

        if (!requiredRole) {
            return true;
        }

        const client = context.switchToWs().getClient<AuthenticatedSocket>();
        const user: JwtPayload = client.user;

        if (!user?.roleId) {
            throw new WsException({
                status: 'error',
                message: 'Unauthorized access',
            });
        }

        const hasPermission = user.roleId <= RoleLevel[requiredRole];

        if (!hasPermission) {
            throw new WsException({
                status: 'error',
                message: `This action requires ${requiredRole} role or higher`,
            });
        }

        return true;
    }
}
