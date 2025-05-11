// auth.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update.dto';
import { PaginationQueryUsersDto } from './dto/get-all.users.input';
import { LoginEntity } from './entity/login.output';
import { RegisterEntity } from './entity/register.output';
import { UpdateProfileEntity } from './entity/update.output';
import { User } from '../../../common/types/types';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly authRepository: AuthRepository,
    ) {}
    
    async login(loginDto: LoginDto): Promise<LoginEntity> {
        const user = await this.authRepository.findUserByUsername(loginDto.username);

        if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
            this.throwInvalidCredentials();
        }    

        const now = new Date().toISOString();
        await this.authRepository.updateLastLogin(user.id, now);

        const token = await this.jwtService.signAsync({
            userId: user.id,
            role: user.role,
            roleId: user.roleId,
        });

        return { status: 'success', token };
    }

    async register(registerDto: RegisterDto): Promise<RegisterEntity> {
        await this.checkIfUserOrEmailExists(registerDto.username, registerDto.email);

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        await this.authRepository.createUser(registerDto, hashedPassword);

        return {
            status: 'success',
            message: 'User registered successfully',
        };
    }

    async getUsers(query: PaginationQueryUsersDto): Promise<Partial<User>[]> {
        return this.authRepository.getUsers(query);
    }

    async activateUser(id: string, currentUserId: string): Promise<any> {
        this.throwIfSelfAction(id, currentUserId, 'activate');

        const user = await this.checkIfUserExists(id);

        if (user.status === 'active') {
            throw new HttpException(
                {
                    status: 'error',
                    message: 'User is already active',
                },
                HttpStatus.CONFLICT,
            );
        }

        await this.authRepository.activateUser(id);

        return { status: 'success', message: 'User activated successfully' };
    }

    async deactivateUser(id: string, currentUserId: string): Promise<any> {
        this.throwIfSelfAction(id, currentUserId, 'deactivate');

        const user = await this.checkIfUserExists(id);

        if (user.status === 'inactive') {
            throw new HttpException(
                {
                    status: 'error',
                    message: 'User is already inactive',
                },
                HttpStatus.CONFLICT,
            );
        }

        await this.authRepository.deactivateUser(id);

        return { status: 'success', message: 'User deactivated successfully' };
    }

    async getUser(id: string): Promise<Partial<User>> {
        const user = await this.checkIfUserExists(id);

        return {
            id: user.id,
            profilePicture: user.profilePicture,
            fullName: user.fullName,
            email: user.email,
            username: user.username,
            roleId: user.roleId,
        };
    }

    async updateProfile(updateProfileDto: UpdateProfileDto, profilePhoto: Express.Multer.File): Promise<UpdateProfileEntity> {
        const imageFilename = profilePhoto?.filename;
        await this.checkIfUserExists(updateProfileDto.userId);

        await this.checkIfUserOrEmailExists(updateProfileDto.username, updateProfileDto.email, updateProfileDto.userId);

        await this.authRepository.updateUserProfile(updateProfileDto, imageFilename);

        return {
            status: 'success',
            message: 'Profile updated successfully',
        };
    }

    async deleteUser(id: string, currentUserId: string): Promise<any> {
        this.throwIfSelfAction(id, currentUserId, 'delete');

        await this.checkIfUserExists(id);

        await this.authRepository.deleteUser(id);

        return { status: 'success', message: 'User deleted successfully' };
    }

    private async checkIfUserExists(userId: string): Promise<User> {
        const user = await this.authRepository.findUserById(userId);

        if (!user) {
                throw new HttpException(
                {
                    status: 'error',
                    message: `User with ID ${userId} not found`,
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return user;
    }

    private async checkIfUserOrEmailExists(username: string, email: string, currentUserId?: string): Promise<User | null> {
        const user = await this.authRepository.findUserByUsernameOrEmail(username, email);

        if (user && user.id !== currentUserId) {
            throw new HttpException(
                {
                    status: 'error',
                    message: 'Username or email already taken',
                },
                HttpStatus.CONFLICT,
            );
        }

        return user;
    }

    private throwInvalidCredentials(): never {
        throw new HttpException(
            {
                status: 'error',
                message: 'Invalid username or password',
            },
            HttpStatus.UNAUTHORIZED,
        );
    }

    async resetPassword(
        userId: string,
        currentPassword: string,
        newPassword: string,
    ): Promise<{ status: string; message: string }> {
        const user = await this.checkIfUserExists(userId);

        const matches = await bcrypt.compare(currentPassword, user.password);
        if (!matches) {
            throw new HttpException(
                { status: 'error', message: 'Current password is incorrect' },
                HttpStatus.BAD_REQUEST,
            );
        }

        await this.authRepository.updatePasswordWithTransaction(
            userId,
            newPassword,
        );

        return { status: 'success', message: 'Password reset successfully' };
    }

    private throwIfSelfAction(id: string, currentUserId: string, action: string): void {
        if (id === currentUserId) {
            throw new HttpException(
                {
                    status: 'error',
                    message: `You cannot ${action} your own account`,
                },
                HttpStatus.FORBIDDEN
            );
        }
    }
}
