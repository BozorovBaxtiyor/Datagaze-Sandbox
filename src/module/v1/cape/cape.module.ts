// cape.module.ts
import { Module } from '@nestjs/common';
import { CapeTasksRepository } from './repository/cape.tasks.repository';
import { CapeController } from './cape.controller';
import { CapeService } from './service/cape.service';

@Module({
    controllers: [CapeController],
    providers: [CapeService, CapeTasksRepository]
})
export class CapeModule {}
