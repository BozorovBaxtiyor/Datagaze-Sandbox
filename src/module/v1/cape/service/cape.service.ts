// cape.service.ts
import FormData from 'form-data';
import * as path from 'path';
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import AdmZip from 'adm-zip';
import { CapeUpsertTaskRepository } from '../repository/cape.upsert.task.repository';
import { CapeGetTasksRepository } from '../repository/cape.get.tasks.respositry';
import { CapeGetTaskIdRepository } from '../repository/cape.get.taskId.repositry';
import { CapeGetRealTaskIdRepository } from '../repository/cape.get.real.taskId.repository';
import { CapeGetTotalTasksSizeRepository } from '../repository/cape.get.total.tasks.size.repository';
import { CapeGetTotalIncidentsSizeRepository } from '../repository/cape.get.total.incidents.size.repository';
import { CapeGetTotalTasksByLastSevenDaysRepository } from '../repository/cape.get.total.tasks.by.last.seven.days';
import { CapeGetTotalPendingTasksSizeRepository } from '../repository/cape.get.total.pending.tasks.size.repository';
import { CapeGetIncidentDistributionRepository } from '../repository/cape.incident.distribution.repository';
import { CapeApiService } from './cape.api.service';
import { CapeFileService } from './cape.file.service';
import { TaskListQueryDto } from '../dto/tasks.list.query.dto';
import { CreateFileDto } from '../dto/create.file.dto';
import { GetTasksEntity } from '../entity/get.tasks.entity';
import { extractFilename } from 'src/common/utils/file.util';
import { CapeRepository } from '../repository/cape.repository';

@Injectable()
export class CapeService {
    constructor(
        private readonly capeApiService: CapeApiService,
        private readonly capeRepository: CapeRepository,
        private readonly capeFileService: CapeFileService,
        private readonly capeUpsertTaskRepository: CapeUpsertTaskRepository,
        private readonly capeGetTasksRepository: CapeGetTasksRepository,
        private readonly capeGetTaskIdRepository: CapeGetTaskIdRepository,
        private readonly capeGetRealTaskIdRepository: CapeGetRealTaskIdRepository,
        private readonly capeGetTotalTasksSizeRepository: CapeGetTotalTasksSizeRepository,
        private readonly capeGetTotalIncidentsSizeRepository: CapeGetTotalIncidentsSizeRepository,
        private readonly capeGetTotalTasksByLastSevenDaysRepository: CapeGetTotalTasksByLastSevenDaysRepository,
        private readonly capeGetTotalPendingTasksSizeRepository: CapeGetTotalPendingTasksSizeRepository,
        private readonly capeGetIncidentDistributionRepository: CapeGetIncidentDistributionRepository,
    ) { }
    
    private readonly logger = new Logger(CapeService.name);

    async getTasks(path: string, query: TaskListQueryDto, userId: string): Promise<GetTasksEntity[]> {
        await this.syncTasksFromCape(userId);
        
        return this.getFormattedTasks(query, path);
    }
    
    private async syncTasksFromCape(userId: string): Promise<void> {
        const taskIds = await this.capeGetTaskIdRepository.getTaskIdByUserId(userId);
        if (taskIds.length === 0) return;
        await Promise.all(taskIds.map(taskId => this.syncSingleTask(taskId, userId)));
    }
    
    private async syncSingleTask(taskId: string, userId: string): Promise<void> {
        const task = await this.getTask(taskId);

        if (task.error) {
            this.logger.warn(`Task not found in CAPE API: ${taskId}`);
            await this.capeRepository.deleteTaskByTaskId(taskId);
            return;
        }

        const taskData = this.mapTaskData(task, taskId, userId);
        await this.capeUpsertTaskRepository.upsertTask(taskData);
    }

    
    private async getFormattedTasks(query: TaskListQueryDto, path: string): Promise<GetTasksEntity[]> {
        const { data } = await this.capeGetTasksRepository.getTotalTasks(query, path);
        
        return data.map(r => this.formatResponse(r));
    }

    async createFile(createFileDto: CreateFileDto, userId: string): Promise<any> {
        try {
            const preparedFile = await this.prepareFileForUpload(createFileDto);
            
            const taskId = await this.uploadFileToCape(preparedFile);
            
            await this.storeTaskData(preparedFile, userId, taskId);
    
            return preparedFile.response.data;
        } catch (error: any) {
            throw new Error(`File upload failed: ${error.message}`);
        }
    }
    
    private async prepareFileForUpload(dto: CreateFileDto): Promise<any> {
        const filePath = await this.saveFileToDisk(dto);
        dto.filePath = filePath;
        const form = this.prepareCapeForm(dto);
        return { ...dto, form };
    }
    
    private async uploadFileToCape(preparedFile: any): Promise<string> {
        const response = await this.capeApiService.uploadFile(preparedFile.form);
        preparedFile.response = response;
        return this.extractTaskIdFromResponse(response);
    }
    
    private extractTaskIdFromResponse(response: any): string {
        return response?.data?.data?.task_ids[0];
    }

    async getTask(taskId: string): Promise<any> {
        try {
            if (!taskId) {
                throw new Error('Task ID is required');
            }
    
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            
            const apiTaskId = uuidRegex.test(taskId) ? await this.capeGetRealTaskIdRepository.getRealTaskId(taskId) : taskId;
    
            if (!apiTaskId) {
                throw new Error(`Task not found for taskId: ${taskId}`);
            }
    
            const response = await this.capeApiService.getTask(apiTaskId);
            
            return response.data;
        } catch (error: any) {
            throw new HttpException(`Task not found for taskId: ${taskId}`, HttpStatus.NOT_FOUND);
        }
    }

    async getReport(taskId: string): Promise<any> {
        const realTaskId = await this.capeGetRealTaskIdRepository.getRealTaskId(taskId);
        return this.capeApiService.getReport(realTaskId, 'json').then(res => res.data);
    }

    // File handling methods
    private async saveFileToDisk(dto: CreateFileDto): Promise<string> {
        const uploadDir = this.getUploadDirectory();
        this.capeFileService.ensureDirectoryExists(uploadDir);
        const filePath = path.join(uploadDir, dto.file.originalname);
        
        await this.capeFileService.writeFileToDisk(filePath, dto.file.buffer);
        return filePath;
    }
    
    private getUploadDirectory(): string {
        return path.join(process.cwd(), 'src', 'file');
    }
      
    // Form preparation methods
    private prepareCapeForm(dto: CreateFileDto): FormData {
        const form = new FormData();
        this.capeFileService.appendFileToForm(form, dto.filePath);
        this.appendTaskSettingsToForm(form, dto);
        return form;
    }
    
    private appendTaskSettingsToForm(form: FormData, dto: CreateFileDto): void {
        form.append('package', dto.package);
        form.append('timeout', String(dto.timeout));
        form.append('machine', dto.machine);
        form.append('platform', dto.platform);
        form.append('options', dto.options);
    }
      
    // Database storage methods
    private async storeTaskData(dto: CreateFileDto, userId: string, taskId: string): Promise<void> {
        const taskData = this.createTaskDataObject(dto, userId, taskId);
        await this.capeUpsertTaskRepository.upsertTask(taskData);
    }
    
    private createTaskDataObject(dto: CreateFileDto, userId: string, taskId: string): any {
        return {
            target: dto.file.originalname,
            sha256: '',
            category: 'file',
            filePath: dto.filePath,
            fileType: dto.file.mimetype,
            fileSize: dto.file.size,
            machine: dto.machine,
            platform: dto.platform,
            package: dto.package,
            timeout: dto.timeout,
            status: 'pending',
            createdAt: new Date().toISOString(),
            createdBy: userId,
            taskId: taskId,
        };
    }

    private mapTaskData(taskData: any, taskId: string, userId: string): any {
        const data = taskData.data || taskData; 
        
        return {
            taskId: taskId || data.id,
            target: extractFilename(data.target) || '',
            category: data.category || 'file',
            sha256: data.sample?.sha256 || null,
            md5: data.sample?.md5 || null,
            fileSize: data.sample?.file_size || 0,
            machine: data.machine || null,
            platform: data.platform || 'windows',
            package: data.package || null,
            timeout: data.timeout || 200,
            memory: data.memory || false,
            status: this.mapStatus(data.status),
            createdAt: data.added_on || data.clock || new Date().toISOString(),
            startedAt: data.started_on || null,
            completedAt: data.completed_on || null,
            incidentType: 'unknown',
            createdBy: userId,
        };
    }

    private formatResponse(data: any): GetTasksEntity {
        return {
            id: data.id,
            filename: extractFilename(data.target),
            category: data.category,
            sha256: data.sha256,
            fileSizeMB: String(this.formatFileSize(data.fileSize)) + ' MB',
            startedAt: data.startedAt,
            completedAt: data.completedAt,
            status: data.status,
            incidentType: data.incidentType
        };
    }

    private formatFileSize(bytes: number): number {
        if (!bytes) return 0;
        return Number((bytes / (1024 * 1024)).toFixed(2));
    }

    private mapStatus(capeStatus: string): string {
        const statusMap: { [key: string]: string } = {
            pending: 'pending',
            running: 'running',
            reported: 'reported',
            failed_reporting: 'failedAnalysis',
            completed: 'processing',
            failed: 'failed',
        };
        return statusMap[capeStatus] ;
    }

    async getScreenshot(taskId: string): Promise<string[]> {
        const realTaskId = await this.capeGetRealTaskIdRepository.getRealTaskId(taskId);
        if (!realTaskId) return [];

        try {
            const resp = await this.capeApiService.getScreenshot(realTaskId);

            const screenshotsDir = path.join(__dirname, '..', 'file', 'images', realTaskId);
            await this.capeFileService.ensureDirectoryExists(screenshotsDir);

            const zip = new AdmZip(resp.data);
            zip.extractAllTo(screenshotsDir, true);

            const shotsDir = path.join(screenshotsDir, 'shots');
            return this.capeFileService.listScreenshotImages(shotsDir, realTaskId);
        } catch {
            return [];
        }
    }

    async getListOfMachines(): Promise<any> {
       return this.capeApiService.getMachineLists().then(res => res.data);
    }

    async getDashboardData(): Promise<any> {
        const [
            totalTasksSize,
            totalIncidentsSize,
            rows,
            pendingTasks,
            machinesList,
            incidentRows
        ] = await Promise.all([
            this.capeGetTotalTasksSizeRepository.getTotalTasksSize(),
            this.capeGetTotalIncidentsSizeRepository.getTotalIncidentsSize(),
            this.capeGetTotalTasksByLastSevenDaysRepository.getTotalTasksByLastSevenDays(),
            this.capeGetTotalPendingTasksSizeRepository.getTotalPendingTasksSize(),
            this.capeApiService.getMachineLists(),
            this.capeGetIncidentDistributionRepository.getIncidentDistribution()
        ]);

        const tasksLastWeek = {
            monday:    0,
            tuesday:   0,
            wednesday: 0,
            thursday:  0,
            friday:    0,
            saturday:  0,
            sunday:    0,
        };

        rows.forEach(({ day_name, total }) => {
            const key = day_name.trim().toLowerCase() as keyof typeof tasksLastWeek;
            tasksLastWeek[key] = parseInt(total, 10);
        });

        const virtualMachines = machinesList.data?.data?.length || 0;

        const incidentDistribution = {
            malware:     0,
            ransomware:  0,
            trojan:      0,
            virus:       0,
            worm:        0,
            spyware:     0,
            cryptominer: 0,
            unknown:     0,
        };

        incidentRows.forEach(({ incidentType, total }) => {
            const key = incidentType as keyof typeof incidentDistribution;
            incidentDistribution[key] = parseInt(total, 10);
        });

        return {
            totalTasksSize,
            detectedIncidents: totalIncidentsSize,
            totalTasksByLastSevenDays: tasksLastWeek,
            pendingTasks,
            virtualMachines,
            incidentDistribution
        };
    }

    async getFileBySha256(sha256: string): Promise<any> {

        return this.capeApiService.getReportBySha256(sha256).then(res => res.data);
    }

    
}