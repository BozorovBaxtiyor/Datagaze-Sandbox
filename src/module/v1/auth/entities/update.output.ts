// update.output.ts
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordEntity {
    @ApiProperty({ example: 'success', description: 'Status of the operation' })
    status: 'success' | 'error';

    @ApiProperty({
        example: 'Password updated successfully',
        description: 'Response message',
    })
    message: string;
}

export class UpdateProfileEntity {
    @ApiProperty({ example: 'success', description: 'Status of the operation' })
    status: 'success' | 'error';

    @ApiProperty({
        example: 'Profile updated successfully',
        description: 'Response message',
    })
    message: string;
}
