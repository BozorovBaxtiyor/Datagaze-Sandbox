// create.file.dto.ts
import { IsOptional, IsString, IsNumber, IsBoolean, IsNotEmpty } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateFileDto {
    @IsOptional()
    @IsString()
    package?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    timeout?: number = 200;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => (value === '' ? 'win10' : value))
    machine?: string = 'win10';

    @IsOptional()
    @IsString()
    platform?: string;

    @IsOptional()
    @IsString()
    options?: string;

    filePath?: string;
    file?: Express.Multer.File;
}