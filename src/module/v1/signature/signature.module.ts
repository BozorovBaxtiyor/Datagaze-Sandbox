// signature.module.ts
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../database/postgres/database.module';
import { AuthModule } from '../auth/auth.module';
import { CapeModule } from '../cape/cape.module';
import { ActivateSignatureRepository } from './repository/activate.signature.repository';
import { CreateYaraRepository } from './repository/create.yara.repository';
import { DeactivateSignatureRepository } from './repository/deactivate.signature.repository';
import { GetSignatureRepository } from './repository/get.signature.repository';
import { GetSignaturesRepository } from './repository/get.signatures.repository';
import { UpdateSignatureRepository } from './repository/update.signature.repository';
import { SignatureService } from './service/signature.service';
import { SignatureController } from './signature.controller';

@Module({
    imports: [CapeModule, AuthModule, DatabaseModule],
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
    exports: [],
})
export class SignatureModule {}
