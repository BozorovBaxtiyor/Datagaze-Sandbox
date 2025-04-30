// auth.controller.ts
import { Controller, Post, Get, Body, Query, Put, UseGuards, Delete, Req } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
// import { JwtHttpAuthGuard } from '../../../common/guards/auth/http-auth.guard';
// import { HttpRoleGuard } from '../../../common/guards/role/http-role.guard';
// import { Role } from '../../../common/decorators/role.decorator';
// import { UserRole } from '../../../common/enums/roles.enum';
import { LoginDto } from './dto/login.dto';
import { LoginEntity } from './entity/login.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiOperation({ 
        summary: 'User login', 
        description: 'Authenticate a user and return a JWT token. Required fields: username and password.'
    })
    @ApiBody({ 
        type: LoginDto, 
        description: 'User credentials',
        examples: {
            loginExample: {
                value: {
                    username: 'superadmin',
                    password: 'superadmin'
                },
                summary: 'Basic user credentials example'
            }
        } 
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Login successful',
        type: LoginEntity
    })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    @ApiResponse({ status: 400, description: 'Bad request - Missing username or password' })
    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<LoginEntity> {
        return this.authService.login(loginDto);
    }

    // @Post('register')
    // async register(@Body() body: { username: string; password: string }) {
    //     return 'hello world';
    // }
}