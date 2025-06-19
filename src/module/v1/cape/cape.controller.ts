// cape.controller.ts
import { Body, Controller, Get, Param, Post, Query, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtHttpAuthGuard } from 'src/common/guards/auth/http-auth.guard';
import { HttpRoleGuard } from 'src/common/guards/role/http-role.guard';
import { ApiAuth, ApiGetAll } from 'src/common/swagger/common-swagger';
import { CustomRequest } from 'src/common/types/types';
import { CreateFileDto } from './dto/create.file.dto';
import { TaskListQueryDto } from './dto/tasks.list.query.dto';
import { GetTasksEntity } from './entity/get.tasks.entity';
import { CapeService } from './service/cape.service';

@UseGuards(JwtHttpAuthGuard, HttpRoleGuard)
@ApiTags('Cape Sandbox')
@ApiAuth()
@Controller({ path: 'cape', version: '1' })
export class CapeController {
    constructor(private readonly capeService: CapeService) {}

    @Get('tasks/dashboard')
    async getDashboard(): Promise<any> {
        return this.capeService.getDashboardData();
    }

    // @Get('tasks/list/:path')
    // @ApiGetAll('Signature Tasks', GetTasksEntity)
    // async getTasks(
    //     @Param('path') path: string,
    //     @Query() query: TaskListQueryDto,
    //     @Req() req: CustomRequest,
    // ): Promise<GetTasksEntity[]> {
    //     return this.capeService.getTasks(path, query, req.user.userId);
    // }

    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'File upload with additional data',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'File to analyze (max 200MB)',
                },
            },
        },
    })
    @Post('tasks/create/file')
    @UseInterceptors(AnyFilesInterceptor({ limits: { fileSize: 200 * 1024 * 1024 } }))
    async createFile(
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Body() createFileDto: CreateFileDto,
        @Req() req: CustomRequest,
    ): Promise<any> {
        // Log fayl haqida ma'lumot
        console.log('Uploaded files:', files);

        // Log DTO va foydalanuvchi haqida ma'lumot
        console.log('User ID:', req.user.userId);
        createFileDto.file = files[0];

        console.log('CreateFileDto:', createFileDto);
        return this.capeService.createFile(createFileDto, req.user.userId);
    }

    @Get('machines/list')
    async getListOfMachines() {
        return this.capeService.getListOfMachines();
    }

    // @Get('tasks/get/report/:taskId')
    // async getReport(@Param('taskId') taskId: string): Promise<any> {
    //     return this.capeService.getReport(taskId);
    // }
    @Get('tasks/get/report/:taskId')
    async getReport1(@Param('taskId') taskId: number): Promise<any> {
        return this.capeService.getReport1(taskId);
    }

    @Get('tasks/view/:taskId')
    // @ApiGetOne('Web Application', GetWebApplicationEntity)
    async getTask(@Param('taskId') taskId: string): Promise<any> {
        return this.capeService.getTask(taskId);
    }

    @Get('tasks/get/screenshot/:taskId')
    async getScreenshot(@Param('taskId') taskId: string): Promise<any> {
        return this.capeService.getScreenshot(taskId);
    }

    @Get('tasks/list/:path')
    @ApiGetAll('Signature Tasks', GetTasksEntity)
    async getTasks1(
        @Param('path') path: string,
        @Query() query: TaskListQueryDto,
        @Req() req: CustomRequest,
    ): Promise<GetTasksEntity[]> {
        return this.capeService.getTasks1(path, query, req.user.userId);
    }
}