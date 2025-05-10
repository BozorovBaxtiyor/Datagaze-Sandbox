// auth.controller.ts
import { Controller, Post, Get, Body, Query, Put, UseGuards, UseInterceptors, UploadedFile, Delete, Req } from '@nestjs/common';
import { FileInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { JwtHttpAuthGuard } from 'src/common/guards/auth/http-auth.guard';
import { HttpRoleGuard } from 'src/common/guards/role/http-role.guard';
import { Role } from 'src/common/decorators/role.decorator';
import { CustomRequest, User } from 'src/common/types/types';
import { UserRole } from 'src/common/enums/roles.enum';
import { 
    ApiAuth, 
    ApiOkResponse, 
    ApiForbiddenResponse, 
    ApiConflictResponse, 
    ApiInternalServerErrorResponse 
} from 'src/common/swagger/common-swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update.dto';
import { PaginationQueryUsersDto } from './dto/get-all.users.input';
import { LoginEntity } from './entity/login.output';
import { RegisterEntity } from './entity/register.output';
import { UpdateProfileEntity } from './entity/update.output';
import { ResetPasswordDto } from './dto/reset-password.dto';

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
    async getUsers(@Query() query: PaginationQueryUsersDto): Promise<Partial<User>[]> {
        return this.authService.getUsers(query);
    }

    @Get('user')
    @UseGuards(JwtHttpAuthGuard, HttpRoleGuard)
    @Role(UserRole.SUPERADMIN)
    @ApiAuth()
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
    async getUser(@Query('id') id: string): Promise<User> {
        return this.authService.getUser(id);
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
    async register(@Body() registerDto: RegisterDto): Promise<RegisterEntity> {
        return this.authService.register(registerDto);
    }

    @Put('update-profile')
    // @UseGuards(JwtHttpAuthGuard, HttpRoleGuard)
    // @Role(UserRole.ADMIN)
    // @ApiAuth()
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
    @UseGuards(JwtHttpAuthGuard, HttpRoleGuard)
    @Role(UserRole.SUPERADMIN)
    @ApiAuth()
    async deleteUser(@Query('id') id: string, @Req() req: CustomRequest): Promise<any> {
        return this.authService.deleteUser(id, req.user.userId);
    }

    @Put('activate')
    @UseGuards(JwtHttpAuthGuard, HttpRoleGuard)
    @Role(UserRole.SUPERADMIN)
    @ApiAuth()
    async activateUser(@Query('id') id: string): Promise<any> {
        return this.authService.activateUser(id);
    }

    @Put('deactivate')
    @UseGuards(JwtHttpAuthGuard, HttpRoleGuard)
    @Role(UserRole.SUPERADMIN)
    @ApiAuth()
    async deactivateUser(@Query('id') id: string): Promise<any> {
        return this.authService.deactivateUser(id);
    }

    @Put('reset-password')
    @UseGuards(JwtHttpAuthGuard, HttpRoleGuard)
    @Role(UserRole.SUPERADMIN)
    @ApiAuth()
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
            req.user.userId,
        );
    }
}