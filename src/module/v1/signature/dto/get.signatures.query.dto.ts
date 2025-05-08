// get.signatures.dto.ts
import { IsOptional, IsInt, Min, Max, IsEnum, IsDateString } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class GetSignaturesQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(10)
    @Max(100)
    limit?: number = 10;
}