// cape.controller.ts
import { Controller, Get, Post, Param, Query, Body, Req, UseGuards, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { CapeService } from './service/cape.service';
import { TaskListQueryDto } from './dto/tasks.list.query.dto';
import { CreateFileDto } from './dto/create.file.dto';
import { UploadSignatureDto } from './dto/upload.signature.dto';
import { GetSignaturesQueryDto } from './dto/get.signatures.query.dto';
import { JwtHttpAuthGuard } from 'src/common/guards/auth/http-auth.guard';
import { CustomRequest } from 'src/common/types/types';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ApiAuth } from 'src/common/swagger/common-swagger';

@UseGuards(JwtHttpAuthGuard)
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

    @ApiOperation({ summary: 'Get signatures', description: 'Retrieves signatures based on query parameters' })
    @ApiResponse({ status: 200, description: 'Signatures retrieved successfully' })
    @Get('tasks/signatures')
    async getSignatures(@Query() query: GetSignaturesQueryDto, @Req() req: CustomRequest): Promise<any> {
        return this.capeService.getSignatures(query, req.user.userId);
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

    @ApiOperation({ summary: 'Upload signature', description: 'Upload a new signature to the system' })
     @ApiBody({ 
            type: UploadSignatureDto, 
            description: 'User credentials',
            examples: {
                loginExample: {
                    value: {
                        name: 'filename.yar',
                        type: 'YAR',
                        rule: 'rule',
                    },
                }
            } 
        })
    @ApiResponse({ status: 201, description: 'Signature uploaded successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Post('tasks/upload/signature')
    async uploadSignature(@Body() signature: UploadSignatureDto, @Req() req: CustomRequest): Promise<any> {
        return this.capeService.uploadSignature(signature, req.user.userId);
    }

    // @Get('tasks/view/all/signatures')
    // async getSignature(): Promise<any> {
    //     return this.capeService.getSignaturesFromCape();
    // }
    
    // @Post('tasks/create/url')
    // async createUrl() {
    //     return this.capeService.createUrl();
    // }
}