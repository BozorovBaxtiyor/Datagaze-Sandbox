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

    @Post('login')
    async login(@Body() body: { username: string; password: string }) {
        return this.authService.login(body.username, body.password);
    }

    @Post('register')
    async register(@Body() body: { username: string; password: string }) {
        return 'hello world';
    }
}