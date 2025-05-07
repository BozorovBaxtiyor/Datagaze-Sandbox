// register.entity.ts
import { ApiProperty } from '@nestjs/swagger';

export class RegisterEntity {
    @ApiProperty({ example: 'success', description: 'Status of the operation' })
    status: string;

    @ApiProperty({
        example: 'User registered successfully',
        description: 'Response message',
    })
    message: string;
}