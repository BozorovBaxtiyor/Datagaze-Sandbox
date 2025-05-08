// cape.module.ts
import { Module } from '@nestjs/common';
import { JwtAuthModule } from '../auth/jwt-auth.module';
import { CapeUpsertTaskRepository } from './repository/cape.upsert.task.repository';
import { CapeGetTasksRepository } from './repository/cape.get.tasks.respositry';
import { CapeGetTaskIdRepository } from './repository/cape.get.taskId.repositry';
import { CapeGetRealTaskIdRepository } from './repository/cape.get.real.taskId.repository';
import { CapeGetTotalTasksSizeRepository } from './repository/cape.get.total.tasks.size.repository';
import { CapeGetTotalIncidentsSizeRepository } from './repository/cape.get.total.incidents.size.repository';
import { CapeGetTotalTasksByLastSevenDaysRepository } from './repository/cape.get.total.tasks.by.last.seven.days';
import { CapeGetTotalPendingTasksSizeRepository } from './repository/cape.get.total.pending.tasks.size.repository';
import { CapeGetIncidentDistributionRepository } from './repository/cape.incident.distribution.repository';
import { CapeController } from './cape.controller';
import { CapeService } from './service/cape.service';
import { CapeApiService } from './service/cape.api.service';
import { CapeFileService } from './service/cape.file.service';

@Module({
    imports: [JwtAuthModule],
    controllers: [CapeController],
    providers: [
        CapeService, 
        CapeApiService,
        CapeFileService,
        CapeUpsertTaskRepository,
        CapeGetTasksRepository,
        CapeGetTaskIdRepository,
        CapeGetRealTaskIdRepository,
        CapeGetTotalTasksSizeRepository,
        CapeGetTotalIncidentsSizeRepository,
        CapeGetTotalTasksByLastSevenDaysRepository,
        CapeGetTotalPendingTasksSizeRepository,
        CapeGetIncidentDistributionRepository
    ],
    exports: [
        CapeApiService,
    ]
})
export class CapeModule {}
