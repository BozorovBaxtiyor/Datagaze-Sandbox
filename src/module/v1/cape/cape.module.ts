// cape.module.ts
import { Module } from '@nestjs/common';
import { CapeController } from './cape.controller';
import { CapeService } from './cape.service';

@Module({
    controllers: [CapeController],
    providers: [CapeService]
})
export class CapeModule {}
