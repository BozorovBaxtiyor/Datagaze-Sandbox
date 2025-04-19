// cape.controller.ts
import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { CapeService } from './service/cape.service';
import { TaskListQueryDto } from './dto/tasks.list.query.dto';

@Controller({ path: 'cape', version: '1' })
export class CapeController {
    constructor(private readonly capeService: CapeService) {}

    @Get('active/tasks/list')
    async getActiveTasks(@Query() query: TaskListQueryDto): Promise<any> {
        return this.capeService.getTasks(query);
    }

    @Get('inactive/tasks/list')
    async getInactiveTasks(@Query() query: TaskListQueryDto): Promise<any> {
        // return this.capeService.getTasks(query);
        return 'Inactive tasks list is not implemented yet';
    }

    @Get('tasks/view/:taskId')
    async getTask(@Param('taskId') taskId: string): Promise<any> {
        return this.capeService.getTask(taskId);
    }

    // @Post('tasks/create/file')
    // async createFile() {
    //     return this.capeService.createFile();
    // }

    // @Post('tasks/create/url')
    // async createUrl() {
    //     return this.capeService.createUrl();
    // }

    // @Get('machines/list')
    // async getListOfMachines() {
    //     return this.capeService.getListOfMachines();
    // }
}
