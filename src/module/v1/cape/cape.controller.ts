// cape.controller.ts
import { Controller, Get, Post, Param, Query, Body, Req, UseGuards, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { CapeService } from './service/cape.service';
import { TaskListQueryDto } from './dto/tasks.list.query.dto';
import { CreateFileDto } from './dto/create.file.dto';
import { GetSignaturesQueryDto } from '../signature/dto/get.signatures.query.dto';
import { JwtHttpAuthGuard } from 'src/common/guards/auth/http-auth.guard';
import { HttpRoleGuard } from 'src/common/guards/role/http-role.guard';
import { CustomRequest } from 'src/common/types/types';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ApiAuth } from 'src/common/swagger/common-swagger';


@UseGuards(JwtHttpAuthGuard, HttpRoleGuard)
@ApiTags('Cape Sandbox')
@ApiAuth()
@Controller({ path: 'cape', version: '1' })
export class CapeController {
    constructor(private readonly capeService: CapeService) {}

    @Get('machines/list')
    async getListOfMachines() {
        return this.capeService.getListOfMachines();
    }
    
    @ApiOperation({ summary: 'Get list of tasks', description: 'Retrieves list of tasks for a specific path' })
    @ApiParam({ name: 'path', description: 'Path to list tasks from', example: 'recent' })
    @ApiResponse({ status: 200, description: 'List of tasks retrieved successfully' })
    @Get('tasks/list/:path')
    async getTasks(@Param('path') path: string, @Query() query: TaskListQueryDto, @Req() req: CustomRequest): Promise<any> {
        return this.capeService.getTasks(path, query, req.user.userId);
    }

    @Get('tasks/get/report/:taskId')
    async getReport(@Param('taskId') taskId: string): Promise<any> {
        return this.capeService.getReport(taskId);
    }

    @ApiOperation({ summary: 'Get task details', description: 'Retrieves details of a specific task' })
    @ApiParam({ name: 'taskId', description: 'ID of the task to view', example: '1234567890' })
    @ApiResponse({ status: 200, description: 'Task details retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    @Get('tasks/view/:taskId')
    async getTask(@Param('taskId') taskId: string): Promise<any> {
        return this.capeService.getTask(taskId);
    }



    @ApiOperation({ summary: 'Get task screenshot', description: 'Retrieves screenshot for a specific task' })
    @ApiParam({ name: 'taskId', description: 'ID of the task to get screenshot for', example: '1234567890' })
    @ApiResponse({ status: 200, description: 'Screenshot retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Screenshot not found' })
    @Get('tasks/get/screenshot/:taskId')
    async getScreenshot(@Param('taskId') taskId: string): Promise<any> {
        return this.capeService.getScreenshot(taskId);
    }

    @ApiOperation({ summary: 'Create file for analysis', description: 'Upload a file for CAPE sandbox analysis' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'File upload with additional data',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'File to analyze (max 200MB)'
                },
            }
        }
    })
    @ApiResponse({ status: 201, description: 'File created and submitted for analysis' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Post('tasks/create/file')
    @UseInterceptors(AnyFilesInterceptor({ limits: { fileSize: 200 * 1024 * 1024 }}))
    async createFile(@UploadedFiles() files: Array<Express.Multer.File>, @Body() createFileDto: CreateFileDto, @Req() req: CustomRequest): Promise<any> {
        createFileDto.file = files[0]; 
        return this.capeService.createFile(createFileDto, req.user.userId);
    }

    

    @Get('tasks/dashboard')
    async getDashboard(): Promise<any> {
        return this.capeService.getDashboardData();
    }

    @Get('files/view/sha256/:sha256')
    async getFileBySha256(@Param('sha256') sha256: string): Promise<any> {
        return this.capeService.getFileBySha256(sha256);
    }

    
    // @Post('tasks/create/url')
    // async createUrl() {
    //     return this.capeService.createUrl();
    // }
}