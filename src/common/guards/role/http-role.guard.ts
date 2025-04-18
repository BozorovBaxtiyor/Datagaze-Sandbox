// http-role.guard.ts
import {
    Injectable,
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, RoleLevel } from '../../enums/roles.enum';
import { ROLES_KEY } from '../../decorators/role.decorator';
import { JwtPayload } from '../../types/types';

@Injectable()
export class HttpRoleGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRole = this.reflector.get<UserRole>(
            ROLES_KEY,
            context.getHandler(),
        );

        if (!requiredRole) {
            return true;
        }

        const { user }: { user: JwtPayload } = context.switchToHttp().getRequest();

        if (!user?.roleId) {
            throw new HttpException(
                {
                    status: 'error',
                    message: 'Unauthorized access',
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        const hasPermission = user.roleId <= RoleLevel[requiredRole];

        if (!hasPermission) {
            throw new HttpException(
                {
                    status: 'error',
                    message: `This action requires ${requiredRole} role or higher`,
                },
                HttpStatus.FORBIDDEN,
            );
        }

        return true;
    }
}
