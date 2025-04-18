// roles.enum.ts
export enum UserRole {
    SUPERADMIN = 'superadmin',
    ADMIN = 'admin',
}

export const RoleLevel = {
    [UserRole.SUPERADMIN]: 1,
    [UserRole.ADMIN]: 2,
};
