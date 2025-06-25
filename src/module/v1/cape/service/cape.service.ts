// cape.service.ts
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import AdmZip from 'adm-zip';
import FormData from 'form-data';
import * as path from 'path';
import { extractFilename } from 'src/common/utils/file.util';
import { CreateFileDto } from '../dto/create.file.dto';
import { TaskListQueryDto } from '../dto/tasks.list.query.dto';
import { GetTasksEntity } from '../entity/get.tasks.entity';
import { CapeAnalysisMongoRepository } from '../repository/analysis.mongo.repository';
import { CapeDatabaseRepository } from '../repository/cape.database.repository';
import { CapeGetRealTaskIdRepository } from '../repository/cape.get.real.taskId.repository';
import { CapeGetTaskIdRepository } from '../repository/cape.get.taskId.repositry';
import { CapeGetTasksRepository } from '../repository/cape.get.tasks.respositry';
import { CapeGetTotalIncidentsSizeRepository } from '../repository/cape.get.total.incidents.size.repository';
import { CapeGetTotalPendingTasksSizeRepository } from '../repository/cape.get.total.pending.tasks.size.repository';
import { CapeGetTotalTasksByLastSevenDaysRepository } from '../repository/cape.get.total.tasks.by.last.seven.days';
import { CapeGetTotalTasksSizeRepository } from '../repository/cape.get.total.tasks.size.repository';
import { CapeGetIncidentDistributionRepository } from '../repository/cape.incident.distribution.repository';
import { CapeRepository } from '../repository/cape.repository';
import { CapeApiService } from './cape.api.service';
import { CapeFileService } from './cape.file.service';

@Injectable()
export class CapeService {
    constructor(
        private readonly capeApiService: CapeApiService,
        private readonly capeRepository: CapeRepository,
        private readonly capeFileService: CapeFileService,
        private readonly capeGetTasksRepository: CapeGetTasksRepository,
        private readonly capeDatabaseRepository: CapeDatabaseRepository,
        private readonly capeGetTaskIdRepository: CapeGetTaskIdRepository,
        private readonly capeAnalysisRepository: CapeAnalysisMongoRepository,
        private readonly capeGetRealTaskIdRepository: CapeGetRealTaskIdRepository,
        private readonly capeGetTotalTasksSizeRepository: CapeGetTotalTasksSizeRepository,
        private readonly capeGetTotalIncidentsSizeRepository: CapeGetTotalIncidentsSizeRepository,
        private readonly capeGetTotalTasksByLastSevenDaysRepository: CapeGetTotalTasksByLastSevenDaysRepository,
        private readonly capeGetTotalPendingTasksSizeRepository: CapeGetTotalPendingTasksSizeRepository,
        private readonly capeGetIncidentDistributionRepository: CapeGetIncidentDistributionRepository,
    ) {}

    private readonly logger = new Logger(CapeService.name);

    async getTasks1(path: string, query: TaskListQueryDto): Promise<GetTasksEntity[]> {
        return this.getFormattedTasks1(query, path);
    }

    private async getFormattedTasks1(
        query: TaskListQueryDto,
        path: string,
    ): Promise<GetTasksEntity[]> {
        const { data } = await this.capeDatabaseRepository.getTotalTasks(query, path);
        return data.map(r => this.formatResponse1(r));
    }

    async createFile(createFileDto: CreateFileDto ): Promise<any> {
        try {
            const preparedFile = await this.prepareFileForUpload(createFileDto);

            const taskId = await this.uploadFileToCape(preparedFile);

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

    async getReport(taskId: number): Promise<any> {
        // const result = await this.capeAnalysisRepository.getAnalysisById(taskId);
        const [analysis] = await Promise.all([this.capeAnalysisRepository.getAnalysisById(taskId)]);

        return analysis;
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
        if (dto.package) form.append('package', dto.package);
        if (dto.timeout) form.append('timeout', String(dto.timeout));
        if (dto.machine) form.append('machine', dto.machine);
        if (dto.platform) form.append('platform', dto.platform);
        if (dto.options) form.append('options', dto.options);
    }

    private formatResponse1(data: any): GetTasksEntity {
        return {
            id: data.id,
            filename: extractFilename(data.target),
            category: data.category,
            sha256: data.sha256,
            fileSizeMB: String(this.formatFileSize(data.fileSize)) + ' MB',
            startedAt: data.startedAt,
            completedAt: data.completedAt,
            status: data.status,
            incidentType: 'unknown',
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
        return statusMap[capeStatus];
    }

    async getScreenshot(taskId: string): Promise<string[]> {
        try {
            const resp = await this.capeApiService.getScreenshot(taskId);

            const screenshotsDir = path.join(__dirname, '..', 'file', 'images', taskId);
            await this.capeFileService.ensureDirectoryExists(screenshotsDir);

            const zip = new AdmZip(resp.data);
            zip.extractAllTo(screenshotsDir, true);

            const shotsDir = path.join(screenshotsDir, 'shots');
            return this.capeFileService.listScreenshotImages(shotsDir, taskId);
        } catch (error: any) {
            return [];
        }
    }

    async getListOfMachines(): Promise<any> {
        return this.capeApiService.getMachineLists().then(res => res.data);
    }

    async getDashboardData(): Promise<any> {
        const [totalTasksSize, rows, pendingTasks, machineCount] = await Promise.all([
            this.capeDatabaseRepository.getTotalTasksSize(),
            // this.capeGetTotalIncidentsSizeRepository.getTotalIncidentsSize(),
            this.capeDatabaseRepository.getTotalTasksByLastSevenDays(),
            this.capeDatabaseRepository.getTotalPendingTasksSize(),
            this.capeDatabaseRepository.getTotalMachinesSize(),
            // this.capeGetIncidentDistributionRepository.getIncidentDistribution(),
        ]);

        const tasksLastWeek = {
            monday: 0,
            tuesday: 0,
            wednesday: 0,
            thursday: 0,
            friday: 0,
            saturday: 0,
            sunday: 0,
        };

        rows.forEach(({ day_name, total }) => {
            const key = day_name.trim().toLowerCase() as keyof typeof tasksLastWeek;
            tasksLastWeek[key] = parseInt(total, 10);
        });

        const incidentDistribution = {
            malware: 1,
            ransomware: 1,
            trojan: 1,
            virus: 0,
            worm: 0,
            spyware: 0,
            cryptominer: 0,
            unknown: totalTasksSize - 3,
        };

        // incidentRows.forEach(({ incidentType, total }) => {
        //     const key = incidentType as keyof typeof incidentDistribution;
        //     incidentDistribution[key] = parseInt(total, 10);
        // });

        return {
            totalTasksSize,
            detectedIncidents: 0,
            totalTasksByLastSevenDays: tasksLastWeek,
            pendingTasks,
            virtualMachines: machineCount,
            incidentDistribution,
        };
    }

    async getFileBySha256(sha256: string): Promise<any> {
        return this.capeApiService.getReportBySha256(sha256).then(res => res.data);
    }
    async downloadReport(taskId: string): Promise<any> {
        const report = await this.capeApiService.getReport(taskId);
        if (!report) {
            throw new HttpException('Report not found', HttpStatus.NOT_FOUND);
        }
        return report.data;
    }
}
