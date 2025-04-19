// auth.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthLoginRepository } from '../repository/auth.login.repository';
import { LoginDto } from '../dto/login.dto';
import { LoginEntity } from '../entity/login.entity';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly authLoginRepository: AuthLoginRepository,
    ) {}
    
    async login(loginDto: LoginDto): Promise<LoginEntity> {
        const user = await this.authLoginRepository.findUserByUsername(loginDto.username);

        if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
            this.throwInvalidCredentials();
        }    

        const token = await this.jwtService.signAsync({
            userId: user.id,
            username: user.username,
            role: user.role,
        });

        return { status: 'success', token };
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
