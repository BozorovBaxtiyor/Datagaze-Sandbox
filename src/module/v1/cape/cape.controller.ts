// cape.controller.ts
import {
    Controller,
    Get,
    Post,
    Param,
    Query,
    UseGuards,
    ParseUUIDPipe,
} from '@nestjs/common';
import { CapeService } from './cape.service';

@Controller({ path: 'cape', version: '1' })
export class CapeController {
    constructor(private readonly capeService: CapeService) {}

    @Get('tasks/list')
    async getListOfTasks() {
        return this.capeService.getListOfTasks();
    }

    @Post('tasks/create/file')
    async createFile() {
        return this.capeService.createFile();
    }

    @Post('tasks/create/url')
    async createUrl() {
        return this.capeService.createUrl();
    }

    @Get('machines/list')
    async getListOfMachines() {
        return this.capeService.getListOfMachines();
    }
}
