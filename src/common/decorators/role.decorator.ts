// role.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums/roles.enum';

export const ROLES_KEY = 'roles';
export const Role = (role: UserRole) => SetMetadata(ROLES_KEY, role);
