// cape.module.ts
import { Module } from '@nestjs/common';
import { CapeUpsertTaskRepository } from './repository/cape.upsert.task.repository';
import { CapeGetTasksRepository } from './repository/cape.get.tasks.respositry';
import { CapeController } from './cape.controller';
import { CapeService } from './service/cape.service';

@Module({
    controllers: [CapeController],
    providers: [
        CapeService, 
        CapeUpsertTaskRepository,
        CapeGetTasksRepository,
    ]
})
export class CapeModule {}
