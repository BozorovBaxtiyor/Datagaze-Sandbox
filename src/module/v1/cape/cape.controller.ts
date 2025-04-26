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

@UseGuards(JwtHttpAuthGuard)
@Controller({ path: 'cape', version: '1' })
export class CapeController {
    constructor(private readonly capeService: CapeService) {}

    @Get('tasks/list/:path')
    async getTasks(@Param('path') path: string, @Query() query: TaskListQueryDto, @Req() req: CustomRequest): Promise<any> {
        return this.capeService.getTasks(path, query, req.user.userId);
    }

    @Get('tasks/view/:taskId')
    async getTask(@Param('taskId') taskId: string): Promise<any> {
        return this.capeService.getTask(taskId);
    }

    @Get('tasks/signatures')
    async getSignatures(@Query() query: GetSignaturesQueryDto, @Req() req: CustomRequest): Promise<any> {
        return this.capeService.getSignatures(query, req.user.userId);
    }

    @Get('tasks/view/all/signatures')
    async getSignature(): Promise<any> {
        return this.capeService.getSignaturesFromCape();
    }

    @Post('tasks/create/file')
    @UseInterceptors(AnyFilesInterceptor({ limits: { fileSize: 100 * 1024 * 1024 }}))
    async createFile(@UploadedFiles() files: Array<Express.Multer.File>, @Body() createFileDto: CreateFileDto, @Req() req: CustomRequest): Promise<any> {
        if (!files || files.length === 0) throw new BadRequestException('No file uploaded');
        createFileDto.file = files[0]; 
        return this.capeService.createFile(createFileDto, req.user.userId);
    }

    @Post('tasks/upload/signature')
    async uploadSignature(@Body() signature: UploadSignatureDto, @Req() req: CustomRequest): Promise<any> {
        return this.capeService.uploadSignature(signature, req.user.userId);
    }

    // @Get('tasks/get/report/:taskId')
    // async getReport(@Param('taskId') taskId: string): Promise<any> {
    //     return this.capeService.getReport(taskId);
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
