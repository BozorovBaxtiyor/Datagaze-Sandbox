// update.input.ts
import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    Matches,
    MinLength,
    IsEmail,
} from 'class-validator';

export class UpdateProfileDto {
    @ApiProperty({ example: 2, description: 'User ID to update profile' })
    @IsString()
    userId: string;

    @ApiProperty({
        example: 'admin',
        description: 'Username (3-20 characters)',
        required: true,
    })
    @IsString()
    @MinLength(3)
    @Matches(/^[a-zA-Z0-9_-]*$/, {
        message:
            'Username can only contain letters, numbers, underscores and hyphens',
    })
    username: string;

    @ApiProperty({
        example: 'New Admin Name',
        description: 'Full name',
        required: true,
    })
    @IsString()
    @MinLength(2)
    fullName: string;

    @ApiProperty({
        example: 'admin@example.com',
        description: 'Valid email address',
        required: true,
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'TemporaryPass$987',
        description:
            'New password (min 8 chars, must include uppercase, lowercase, number, special char)',
    })
    @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/, {
        message:
            'Password must contain uppercase, lowercase, number and special character',
    })
    password: string;
}
