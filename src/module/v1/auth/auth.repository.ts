// auth.repository.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import bcrypt from 'bcrypt';
import { User } from 'src/common/types/types';
import { RegisterDto } from './dto/register.dto';
import { PaginationQueryUsersDto } from './dto/get-all.users.input';
import { UpdateProfileDto } from './dto/update.dto';

@Injectable()
export class AuthRepository {
    constructor(@InjectKnex() private readonly knex: Knex) {}

    async findUserByUsername(username: string): Promise<User | undefined> {
        return this.knex<User>('users').where({ username }).first();
    }

    async findUserById(userId: string): Promise<User | undefined> {
        return this.knex<User>('users').where('id', userId).first();
    }

    async findUserByUsernameOrEmail(username: string, email: string): Promise<User | undefined> {
        return this.knex<User>('users').where({ username }).orWhere({ email }).first();
    }

    async updateLastLogin(userId: string, timestamp: string): Promise<void> {
        await this.knex('users').where('id', userId).update({ lastLogin: timestamp });
    }

    async activateUser(id: string): Promise<void> {
        await this.knex('users').where('id', id).update({ status: 'active' });
    }

    async deactivateUser(id: string): Promise<void> {
        await this.knex('users').where('id', id).update({ status: 'inactive' });
    }
    
    async getUsernameById(userId: string): Promise<string | null> {
        return this.knex('users').select('username').where('id', userId).first();
    }
    
    async deleteUser(id: string): Promise<void> {
        await this.knex('users').where('id', id).del();
    }
    
    async createUser(registerDto: RegisterDto, hashedPassword: string): Promise<void> {
        await this.knex<User>('users').insert({
            username: registerDto.username,
            email: registerDto.email,
            password: hashedPassword,
            fullName: registerDto.fullName,
            role: 'admin',
            roleId: 2,
        });
    }

    async updateUserPassword(
        userId: string,
        hashedPassword: string,
    ): Promise<void> {
        await this.knex<User>('users').where('id', userId).update({
            password: hashedPassword,
            updated_at: new Date(),
        });
    }

    async createPasswordHistoryEntry(
        userId: string,
        updatedById: string,
        reason: string,
    ): Promise<void> {
        await this.knex('passwordHistory').insert({
            userId: userId,
            updatedBy: updatedById,
            reason,
            created_at: new Date(),
            updated_at: new Date(),
        });
    }

    async updateUserProfile(updateProfileDto: UpdateProfileDto): Promise<void> {
        const updateObject: Partial<User> = {
            username: updateProfileDto.username,
            fullName: updateProfileDto.fullName,
            email: updateProfileDto.email,
            updated_at: new Date(),
        };
       
        await this.knex<User>('users').where('id', updateProfileDto.userId).update(updateObject);
    }

    async updatePasswordWithTransaction(
        userId: string,
        newPassword: string,
        updatedById: string,
        reason: string,
    ): Promise<void> {
        await this.knex.transaction(async (trx) => {
            const user = await trx<User>('users').where('id', userId).first();

            if (!user) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await trx<User>('users')
                .where('id', userId)
                .update({ password: hashedPassword, updated_at: new Date() });

            await trx('passwordHistory').insert({
                userId: userId,
                updatedBy: updatedById,
                reason,
                created_at: new Date(),
                updated_at: new Date(),
            });
        });
    }

    async getUsers(query: PaginationQueryUsersDto): Promise<Partial<User>[]> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;
        return this.knex<any>('users').select('id', 'fullName', 'email', 'username', 'role', 'lastLogin', 'status').limit(limit).offset(skip);
    }

    
}
