// login.output.ts
import { ApiProperty } from '@nestjs/swagger';

export class LoginEntity {
    @ApiProperty({ example: 'success', description: 'Status of the operation' })
    status: string;

    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'JWT token',
    })
    token: string;
}
