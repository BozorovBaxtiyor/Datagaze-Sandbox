// auth.controller.ts
import { Controller, Post, Get, Body, Query, Put, UseGuards, Delete, Req } from '@nestjs/common';
import { AuthService } from './service/auth.service';
// import { JwtHttpAuthGuard } from '../../../common/guards/auth/http-auth.guard';
// import { HttpRoleGuard } from '../../../common/guards/role/http-role.guard';
// import { Role } from '../../../common/decorators/role.decorator';
// import { UserRole } from '../../../common/enums/roles.enum';
import { LoginDto } from './dto/login.dto';
import { LoginEntity } from './entity/login.entity';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<LoginEntity> {
        return this.authService.login(loginDto);
    }

    // @Post('register')
    // async register(@Body() body: { username: string; password: string }) {
    //     return 'hello world';
    // }
}