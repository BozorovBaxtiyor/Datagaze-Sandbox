// common.module.ts
import { Module } from '@nestjs/common';
import { DateService } from './utils/date.service';

@Module({
    imports: [],
    providers: [DateService],
    exports: [DateService],
})
export class CommonModule {}
