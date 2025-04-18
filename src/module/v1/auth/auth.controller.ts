// auth.controller.ts
import { Controller, Post, Get, Body, Query, Put, UseGuards, Delete, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.input';
import { RegisterDto } from './dto/register.input';
import { UpdateProfileDto } from './dto/update.input';
import { PaginationQueryUsersDto } from './dto/get-all.users.input';
import { LoginEntity } from './entities/login.output';
import { RegisterEntity } from './entities/register.output';
import { UpdateProfileEntity } from './entities/update.output';
import { JwtHttpAuthGuard } from '../../../common/guards/auth/http-auth.guard';
import { HttpRoleGuard } from '../../../common/guards/role/http-role.guard';
import { Role } from '../../../common/decorators/role.decorator';
import { CustomRequest, User } from '../../../common/types/types';
import { UserRole } from '../../../common/enums/roles.enum';
import { 
    ApiAuth, 
    ApiOkResponse, 
    ApiForbiddenResponse, 
    ApiConflictResponse, 
    ApiInternalServerErrorResponse 
} from '../../../common/swagger/common-swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @ApiOperation({ summary: 'Login' })
    @ApiBody({
        type: LoginDto,
        examples: { 'application/json': { value: { username: 'superadmin', password: 'superadmin' } } },
    })
    @ApiOkResponse('Successful login', LoginEntity)
    @ApiResponse({
        status: 401,
        description: 'Invalid credentials',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'error' },
                message: { type: 'string', example: 'Invalid username or password' },
            },
        },
    })
    async login(@Body() loginDto: LoginDto): Promise<LoginEntity> {
        return this.authService.login(loginDto);
    }

    @Get('users')
    @UseGuards(JwtHttpAuthGuard, HttpRoleGuard)
    @Role(UserRole.SUPERADMIN)
    @ApiAuth()
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ 
        status: 200,
        description: 'List of users',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    fullName: { type: 'string' },
                    email: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
        },
    })
    @ApiForbiddenResponse()
    @ApiInternalServerErrorResponse('Failed to fetch users')
    async getUsers(@Query() query: PaginationQueryUsersDto): Promise<Partial<User>[]> {
        return this.authService.getUsers(query);
    }

    @Get('user')
    @UseGuards(JwtHttpAuthGuard, HttpRoleGuard)
    @Role(UserRole.ADMIN)
    @ApiAuth()
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiResponse({
        status: 200,
        description: 'User found',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                fullName: { type: 'string' },
                email: { type: 'string' },
                username: { type: 'string' },
                roleId: { type: 'string' },
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'User not found',
        schema: {
            type: 'object',
            properties: {   
                status: { type: 'string', example: 'error' },
                message: { type: 'string', example: 'User not found' },
            },
        },
    })
    @ApiInternalServerErrorResponse('Failed to fetch user')
    async getUser(@Req() req: CustomRequest): Promise<User> {
        return this.authService.getUser(req.user.userId);
    }

    @Post('register')
    @UseGuards(JwtHttpAuthGuard, HttpRoleGuard)
    @Role(UserRole.SUPERADMIN)
    @ApiAuth()
    @ApiOperation({ summary: 'Register' })
    @ApiBody({
        type: RegisterDto,
        examples: { 'application/json': { value: { username: 'new_admin', fullName: 'Joe Doe', email: 'newadmin@example.com', password: 'StrongPassword@456' } } },
    })
    @ApiOkResponse('Successful registration', RegisterEntity)
    @ApiConflictResponse('Username or email already taken')
    async register(@Body() registerDto: RegisterDto): Promise<RegisterEntity> {
        return this.authService.register(registerDto);
    }

    @Put('update-profile')
    @UseGuards(JwtHttpAuthGuard, HttpRoleGuard)
    @Role(UserRole.SUPERADMIN)
    @ApiAuth()
    @ApiOperation({ summary: 'Update user profile' })
    @ApiBody({
        type: UpdateProfileDto,
        examples: { 'application/json': { value: { userId: 'a38ac0e5-c5cf-4d25-b696-df12c9a4a66c', username: 'admin', fullName: 'New Admin Name', email: 'newemail@example.com', password: 'TemporaryPass$987' } } },
    })
    @ApiOkResponse('Profile updated successfully', UpdateProfileEntity)
    @ApiConflictResponse('Username or email has been already taken')
    async updateProfile(@Body() updateProfileDto: UpdateProfileDto): Promise<UpdateProfileEntity> {
        return this.authService.updateProfile(updateProfileDto);
    }

    @Delete('delete-user/:id')
    @UseGuards(JwtHttpAuthGuard, HttpRoleGuard)
    @Role(UserRole.SUPERADMIN)
    @ApiAuth()
    @ApiOperation({ summary: 'Delete user' })
    @ApiResponse({ status: 200, description: 'User deleted successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiInternalServerErrorResponse('Failed to delete user')
    async deleteUser(@Query('id') id: string, @Req() req: CustomRequest): Promise<any> {
        return this.authService.deleteUser(id, req.user.userId);
    }
}