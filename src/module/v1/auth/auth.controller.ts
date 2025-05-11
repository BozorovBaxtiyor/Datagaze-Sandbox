// auth.controller.ts
import { Controller, Post, Get, Body, Query, Put, UseGuards, UseInterceptors, UploadedFile, Delete, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { ApiTags, ApiQuery, ApiBody, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { JwtHttpAuthGuard } from 'src/common/guards/auth/http-auth.guard';
import { HttpRoleGuard } from 'src/common/guards/role/http-role.guard';
import { Role } from 'src/common/decorators/role.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { CustomRequest, User } from 'src/common/types/types';
import { UserRole } from 'src/common/enums/roles.enum';
import { ApiAuth, ApiOkResponse } from 'src/common/swagger/common-swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update.dto';
import { PaginationQueryUsersDto } from './dto/get-all.users.input';
import { LoginEntity } from './entity/login.output';
import { RegisterEntity } from './entity/register.output';
import { UpdateProfileEntity } from './entity/update.output';
import { ResetPasswordDto } from './dto/reset-password.dto';

@UseGuards(JwtHttpAuthGuard, HttpRoleGuard)
@ApiAuth()
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('login')
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

    @Post('register')
    @Role(UserRole.SUPERADMIN)
    @ApiBody({
        type: RegisterDto,
        examples: { 'application/json': { value: { username: 'new_admin', fullName: 'Joe Doe', email: 'newadmin@example.com', password: 'StrongPassword@456' } } },
    })
    @ApiOkResponse('Successful registration', RegisterEntity)
    async register(@Body() registerDto: RegisterDto): Promise<RegisterEntity> {
        return this.authService.register(registerDto);
    }

    @Get('users')
    @Role(UserRole.SUPERADMIN) // only superadmin can access this route
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
                    username: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
        },
    })
    async getUsers(@Query() query: PaginationQueryUsersDto): Promise<Partial<User>[]> {
        return this.authService.getUsers(query);
    }

    @Get('user')
    @Role(UserRole.ADMIN)
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
                profilePicture: { type: 'string', nullable: true },
                roleId: { type: 'number' },
            },
        },
    })
    @ApiQuery({ name: 'id', required: false, description: 'User ID (optional). If omitted, returns authenticated user.' })
    async getUser(@Query('id') id?: string, @Req() req?: CustomRequest): Promise<User> {
        return this.authService.getUser(id || req.user.userId);
    }

    @Put('update-profile')
    @Role(UserRole.SUPERADMIN) // only superadmin can access this route
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('profilePhoto', {
        storage: diskStorage({
            destination: './src/module/v1/auth/uploads/profiles',
            filename: (req, file, cb) => {
                const uniqueSuffix = uuidv4();
                const fileExtension = extname(file.originalname);
                cb(null, `${uniqueSuffix}${fileExtension}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new Error('Only image files are allowed!'), false);
            }
            cb(null, true);
        },
    }))
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string' },
                username: { type: 'string' },
                fullName: { type: 'string' },
                email: { type: 'string' },
                profilePhoto: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    async updateProfile(
        @UploadedFile() profilePhoto: Express.Multer.File, 
        @Body() updateProfileDto: UpdateProfileDto
    ): Promise<UpdateProfileEntity> {
        return this.authService.updateProfile(updateProfileDto, profilePhoto);
    }

    @Delete('delete-user/:id')
    @Role(UserRole.SUPERADMIN)
    async deleteUser(@Query('id') id: string, @Req() req: CustomRequest): Promise<any> {
        return this.authService.deleteUser(id, req.user.userId);
    }

    @Put('activate')
    @Role(UserRole.SUPERADMIN)
    async activateUser(@Query('id') id: string, @Req() req: CustomRequest): Promise<any> {
        return this.authService.activateUser(id, req.user.userId);
    }

    @Put('deactivate')
    @Role(UserRole.SUPERADMIN)
    async deactivateUser(@Query('id') id: string, @Req() req: CustomRequest): Promise<any> {
        return this.authService.deactivateUser(id, req.user.userId);
    }

    @Put('reset-password')
    @Role(UserRole.SUPERADMIN)
    @ApiBody({ type: ResetPasswordDto })
    @ApiResponse({ 
        status: 200,
        description: 'Password reset successful',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'success' },
                message: { type: 'string', example: 'Password reset successfully' }
            }
        }
    })
    async resetPassword(
        @Body() resetPasswordDto: ResetPasswordDto,
        @Req() req: CustomRequest
    ): Promise<any> {
        return this.authService.resetPassword(
            resetPasswordDto.userId,
            resetPasswordDto.currentPassword,
            resetPasswordDto.newPassword,
        );
    }
}