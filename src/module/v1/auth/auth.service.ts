// auth.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/login.input';
import { RegisterDto } from './dto/register.input';
import { UpdateProfileDto } from './dto/update.input';
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

    async getUsers(query: PaginationQueryUsersDto): Promise<Partial<User>[]> {
        return this.authRepository.getUsers(query);
    }

    async activateUser(id: string): Promise<any> {
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

    async deactivateUser(id: string): Promise<any> {
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
            fullName: user.fullName,
            email: user.email,
            username: user.username,
        };
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

    async updateProfile(updateProfileDto: UpdateProfileDto): Promise<UpdateProfileEntity> {
        await this.checkIfUserExists(updateProfileDto.userId);

        await this.checkIfUserOrEmailExists(updateProfileDto.username, updateProfileDto.email);

        await this.authRepository.updateUserProfile(updateProfileDto);

        return {
            status: 'success',
            message: 'Profile updated successfully',
        };
    }

    async deleteUser(id: string, currentUserId: string): Promise<any> {
        if (id === currentUserId) {
            throw new HttpException(
                {
                    status: 'error',
                    message: 'You cannot delete your own account',
                },
                HttpStatus.FORBIDDEN
            );
        }

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

    private async checkIfUserOrEmailExists(username: string, email: string): Promise<User | undefined | null> {
        const exists = await this.authRepository.findUserByUsernameOrEmail(username, email);

        if (exists) {
            throw new HttpException(
                {
                    status: 'error',
                    message: 'Username or email already taken',
                },
                HttpStatus.CONFLICT,
            );
        }
        return exists;
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
}
