// cape.controller.ts
import { Controller, Get, Post, Param, Query, Body, UseGuards, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { CapeService } from './service/cape.service';
import { TaskListQueryDto } from './dto/tasks.list.query.dto';
import { CreateFileDto } from './dto/create.file.dto';

@Controller({ path: 'cape', version: '1' })
export class CapeController {
    constructor(private readonly capeService: CapeService) {}

    @Get('tasks/list')
    async getActiveTasks(@Query() query: TaskListQueryDto): Promise<any> {
        return this.capeService.getTasks(query);
    }

    @Get('tasks/view/:taskId')
    async getTask(@Param('taskId') taskId: string): Promise<any> {
        return this.capeService.getTask(taskId);
    }

    @Post('tasks/create/file')
    @UseInterceptors(AnyFilesInterceptor({
        limits: {
            fileSize: 100 * 1024 * 1024, 
        }
    }))
    async createFile(@UploadedFiles() files: Array<Express.Multer.File>, @Body() createFileDto: CreateFileDto): Promise<any> {
        if (!files || files.length === 0) {
            throw new BadRequestException('No file uploaded');
        }
        createFileDto.file = files[0]; 
        return this.capeService.createFile(createFileDto);
    }

    // @Post('tasks/create/url')
    // async createUrl() {
    //     return this.capeService.createUrl();
    // }

    // @Get('machines/list')
    // async getListOfMachines() {
    //     return this.capeService.getListOfMachines();
    // }
}
