// signature.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CapeModule } from '../cape/cape.module';
import { SignatureController } from './signature.controller';
import { SignatureService } from './service/signature.service';
import { CreateYaraRepository } from './repository/create.yara.repository';
import { GetSignaturesRepository } from './repository/get.signatures.repository';

@Module({
    imports: [
        CapeModule, 
        AuthModule
    ],
    controllers: [SignatureController],
    providers: [
        SignatureService,
        CreateYaraRepository,
        GetSignaturesRepository
    ],
    exports: []
})
export class SignatureModule {}