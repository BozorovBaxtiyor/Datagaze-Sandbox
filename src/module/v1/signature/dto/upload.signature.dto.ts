// upload-signature.dto.ts
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UploadSignatureDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsIn(['yara', 'yar', 'custom']) 
    type: string;

    @IsNotEmpty()
    @IsString()
    rule: string;
}
