// cape.module.ts
import { Module } from '@nestjs/common';
import { JwtAuthModule } from '../auth/jwt-auth.module';
import { CapeUpsertTaskRepository } from './repository/cape.upsert.task.repository';
import { CapeGetTasksRepository } from './repository/cape.get.tasks.respositry';
import { CapeGetTaskIdRepository } from './repository/cape.get.taskId.repositry';
import { CapeCreateYaraRepository } from './repository/cape.create.yara.repository';
import { CapeGetSignaturesRepository } from './repository/cape.get.signatures.repository';
import { CapeGetUsernameRepository } from './repository/cape.get.username.repository';
import { CapeController } from './cape.controller';
import { CapeService } from './service/cape.service';

@Module({
    imports: [JwtAuthModule],
    controllers: [CapeController],
    providers: [
        CapeService, 
        CapeUpsertTaskRepository,
        CapeGetTasksRepository,
        CapeGetTaskIdRepository,
        CapeCreateYaraRepository,
        CapeGetSignaturesRepository,
        CapeGetUsernameRepository
    ]
})
export class CapeModule {}
