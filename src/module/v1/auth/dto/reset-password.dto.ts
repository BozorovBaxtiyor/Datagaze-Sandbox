// reset-password.dto.ts
import { IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty({
        description: 'User ID whose password needs to be reset',
        example: 'f0b33c9c-0019-4046-984b-f6f3d95dea61'
    })
    @IsUUID()
    userId: string;

    @ApiProperty({
        description: 'Current password',
        example: 'OldStrongPass123!'    
    })
    @IsString()
    @MinLength(8)
    currentPassword: string;

    @ApiProperty({
        description: 'New password',
        example: 'NewStrongPass123!'
    })
    @IsString()
    @MinLength(8)
    newPassword: string;
}