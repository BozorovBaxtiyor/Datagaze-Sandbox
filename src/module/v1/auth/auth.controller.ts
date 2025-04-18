// auth.controller.ts
import { Controller, Post, Get, Body, Query, Put, UseGuards, Delete, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtHttpAuthGuard } from '../../../common/guards/auth/http-auth.guard';
import { HttpRoleGuard } from '../../../common/guards/role/http-role.guard';
import { Role } from '../../../common/decorators/role.decorator';
import { UserRole } from '../../../common/enums/roles.enum';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}


}