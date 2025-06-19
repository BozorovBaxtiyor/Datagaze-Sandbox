// cape.module.ts
import { Module } from '@nestjs/common';
import { JwtAuthModule } from '../auth/jwt-auth.module';
import { DatabaseModule } from '../database/database.module';
import { CapeController } from './cape.controller';
import { CapeGetRealTaskIdRepository } from './repository/cape.get.real.taskId.repository';
import { CapeGetTaskIdRepository } from './repository/cape.get.taskId.repositry';
import { CapeGetTasksRepository } from './repository/cape.get.tasks.respositry';
import { CapeGetTotalIncidentsSizeRepository } from './repository/cape.get.total.incidents.size.repository';
import { CapeGetTotalPendingTasksSizeRepository } from './repository/cape.get.total.pending.tasks.size.repository';
import { CapeGetTotalTasksByLastSevenDaysRepository } from './repository/cape.get.total.tasks.by.last.seven.days';
import { CapeGetTotalTasksSizeRepository } from './repository/cape.get.total.tasks.size.repository';
import { CapeGetIncidentDistributionRepository } from './repository/cape.incident.distribution.repository';
import { CapeRepository } from './repository/cape.repository';
import { CapeUpsertTaskRepository } from './repository/cape.upsert.task.repository';
import { CapeApiService } from './service/cape.api.service';
import { CapeFileService } from './service/cape.file.service';
import { CapeService } from './service/cape.service';
import { CapeDatabaseRepository } from './repository/cape.database.repository';

@Module({
    imports: [JwtAuthModule, DatabaseModule],
    controllers: [CapeController],
    providers: [
        CapeService,
        CapeApiService,
        CapeFileService,
        CapeRepository,
        CapeUpsertTaskRepository,
        CapeGetTasksRepository,
        CapeGetTaskIdRepository,
        CapeDatabaseRepository,
        CapeGetRealTaskIdRepository,
        CapeGetTotalTasksSizeRepository,
        CapeGetTotalIncidentsSizeRepository,
        CapeGetTotalTasksByLastSevenDaysRepository,
        CapeGetTotalPendingTasksSizeRepository,
        CapeGetIncidentDistributionRepository,
    ],
    exports: [CapeApiService],
})
export class CapeModule {}
