// get.signatures.dto.ts
import { IsOptional, IsInt, Min, Max, IsEnum, IsDateString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetSignaturesQueryDto {
    @ApiPropertyOptional({
        description: 'Page number for pagination',
        type: Number,
        default: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        type: Number,
        default: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(10)
    @Max(100)
    limit?: number = 10;

     @ApiPropertyOptional({
        description: 'Status to filter tasks',
        type: String,
        default: 'all',
    })
    @IsOptional()
    status?: 'pending' | 'active' | 'inactive' | 'all' = 'all';

    @ApiPropertyOptional({
        description: 'Category to filter tasks',
        type: String,
        default: 'all',
    })
    @IsOptional()
    category?: 'all' | 'yar' | 'yara' | 'custom' = 'all';
}