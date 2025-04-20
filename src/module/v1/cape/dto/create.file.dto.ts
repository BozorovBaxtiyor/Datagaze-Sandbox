// create.file.dto.ts
import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFileDto {
    @IsOptional()
    @IsString()
    package?: string = 'default';

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    timeout?: number = 200;

    @IsOptional()
    @IsString()
    machine?: string = 'win10';

    @IsOptional()
    @IsString()
    platform?: string = 'windows';

    @IsOptional()
    @IsString()
    options?: string = 'isolated=password';

    filePath?: string;
    file?: Express.Multer.File;
}