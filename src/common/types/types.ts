// types.ts
import { Request } from 'express';

export interface JwtPayload {
    userId: string;
    role: string;
    roleId: number;
    iat: number;
    exp: number;
}

export interface CustomRequest extends Request {
    user?: JwtPayload;
}

export interface User {
    id?: string;
    username?: string;
    email?: string;
    password?: string;
    fullName?: string;
    role?: string;
    roleId?: number;
    created_at?: Date;
    updated_at?: Date;
}

