// signature.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CapeModule } from '../cape/cape.module';
import { SignatureController } from './signature.controller';
import { SignatureService } from './service/signature.service';
import { CreateYaraRepository } from './repository/create.yara.repository';
import { GetSignatureRepository } from './repository/get.signature.repository';
import { GetSignaturesRepository } from './repository/get.signatures.repository';
import { ActivateSignatureRepository } from './repository/activate.signature.repository';
import { DeactivateSignatureRepository } from './repository/deactivate.signature.repository';
import { UpdateSignatureRepository } from './repository/update.signature.repository';

@Module({
    imports: [
        CapeModule, 
        AuthModule
    ],
    controllers: [SignatureController],
    providers: [
        SignatureService,
        CreateYaraRepository,
        GetSignatureRepository,
        GetSignaturesRepository,
        ActivateSignatureRepository,
        DeactivateSignatureRepository,
        UpdateSignatureRepository,
    ],
    exports: []
})
export class SignatureModule {}