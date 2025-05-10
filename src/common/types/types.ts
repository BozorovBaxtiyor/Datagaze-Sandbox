// types.ts
import { Socket } from 'socket.io';
import { Request } from 'express';

export interface JwtPayload {
    userId: string;
    role: string;
    roleId: number;
    iat: number;
    exp: number;
}

export interface IJwtPayloadForAgent {
    id: string;
    hostname: string;
    operation_system: string;
    platform: string;
    unicall_key: string;
    iat: number;
    exp: number;
}

export interface CustomRequest extends Request {
    user?: JwtPayload;
}

export interface User {
    id?: string;
    profilePicture?: string;
    username?: string;
    email?: string;
    password?: string;
    fullName?: string;
    role?: string;
    roleId?: number;
    lastLogin?: string;
    status?: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface AuthenticatedSocket extends Socket {
    user: JwtPayload; 
}