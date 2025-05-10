// signature.entity.ts
import { ApiProperty } from '@nestjs/swagger';

export class SignatureEntity {
    @ApiProperty({ description: 'Unique identifier of the signature' })
    id: string;

    @ApiProperty({ description: 'Name of the signature' })
    name: string;

    @ApiProperty({ description: 'Rule content of the signature' })
    rule?: string;

    @ApiProperty({ description: 'Type/category of the signature', example: ['yar', 'custom'] })
    type: string;

    @ApiProperty({ description: 'Status of the signature', enum: ['active', 'inactive', 'pending'] })
    status: string;

    @ApiProperty({ description: 'Date when the signature was uploaded' })
    createdAt: Date;

    @ApiProperty({ description: 'Username of the user who uploaded the signature' })
    uploadedBy: string;

    @ApiProperty({ description: 'Date when the signature was last modified' })
    lastModifiedAt: Date;
}