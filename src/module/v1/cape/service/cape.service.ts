// cape.service.ts
import FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { CapeUpsertTaskRepository } from '../repository/cape.upsert.task.repository';
import { CapeGetTasksRepository } from '../repository/cape.get.tasks.respositry';
import { CapeGetTaskIdRepository } from '../repository/cape.get.taskId.repositry';
import { CapeCreateYaraRepository } from '../repository/cape.create.yara.repository';  
import { CapeGetSignaturesRepository } from '../repository/cape.get.signatures.repository';
import { CapeGetUsernameRepository } from '../repository/cape.get.username.repository';
import { TaskListQueryDto } from '../dto/tasks.list.query.dto';
import { CreateFileDto } from '../dto/create.file.dto';
import { UploadSignatureDto } from '../dto/upload.signature.dto';
import { GetSignaturesQueryDto } from '../dto/get.signatures.query.dto';
import { SimplifiedCapeTask } from '../type/cape.type';

@Injectable()
export class CapeService {
    private readonly logger = new Logger(CapeService.name);
    private readonly headers = { Accept: 'application/json' };
    private readonly baseUrl = process.env.CAPE_URL;

    constructor(
        private readonly capeUpsertTaskRepository: CapeUpsertTaskRepository,
        private readonly capeGetTasksRepository: CapeGetTasksRepository,
        private readonly capeGetTaskIdRepository: CapeGetTaskIdRepository,
        private readonly capeCreateYaraRepository: CapeCreateYaraRepository,
        private readonly capeGetSignaturesRepository: CapeGetSignaturesRepository,
        private readonly capeGetUsernameRepository: CapeGetUsernameRepository,
    ) {}

    async getTasks(path: string, query: TaskListQueryDto, userId: string): Promise<any> {
        const taskIds = await this.capeGetTaskIdRepository.getTaskIdByUserId(userId);
        if (taskIds.length !== 0) {
            await Promise.all(taskIds.map(async (taskId) => {
                const task = await this.getTask(taskId);
                if (task) {
                    const taskData = this.mapTaskData(task, taskId, userId);
                    await this.capeUpsertTaskRepository.upsertTask(taskData);
                }
            }));
        }

        const { data } = await this.capeGetTasksRepository.getTotalTasks(query, path);
        
        return data.map(r => this.formatResponse(r));
    }
    
    async getSignatures(query: GetSignaturesQueryDto, userId: string): Promise<any> {
        const { data } = await this.capeGetSignaturesRepository.getSignaturesByUserId(query, userId);

        const signaturePromises = data.map(async (r) => {
            const username = await this.capeGetUsernameRepository.getUsernameById(r.uploadedBy);
            
            return {
                id: r.id,
                name: r.name,
                rule: r.rule,
                type: r.category, 
                status: r.status,
                createdAt: r.uploadedAt,
                uploadedBy: username, 
                lastModifiedAt: r.lastModifiedAt || r.uploadedAt,
            };
        });
    
        const signaturesWithUsernames = await Promise.all(signaturePromises);
    
        return signaturesWithUsernames;
    }
    
    async getSignaturesFromCape(): Promise<void> {
        try {
            const response = await axios.get(`${this.baseUrl}/yara/all/`, { headers: this.headers });
    
            if (!response.data || !response.data.files) {
                this.logger.warn(`[CapeService] No files found in the response.`);
                return;
            }
    
            for (const file of response.data.files) {
                const { name, content } = file;
    
                try {
                    await this.capeCreateYaraRepository.createSignature({
                        name,
                        rule: content,
                        uploadedBy: "f7f39c49-d839-4a03-9b57-9226dcde8a2a",
                        category: 'yar', 
                    });
    
                    this.logger.log(`[CapeService] Successfully stored signature: ${name}`);
                } catch (error: any) {
                    this.logger.error(`[CapeService] Failed to store signature: ${name}. Reason: ${error.message}`);
                }
            }
        } catch (error: any) {
            this.logger.warn(`[CapeService] Warning: Failed to fetch signatures from CAPE API. Reason: ${error.message}`);
        }
    }

    async createFile(createFileDto: CreateFileDto, userId: string): Promise<any> {
        try {
            const filePath = await this.saveFileToDisk(createFileDto);
            createFileDto.filePath = filePath;
            const form = this.prepareCapeForm(createFileDto);
            const response: any = await this.uploadToCape(form);
            const taskId = response?.data?.data?.task_ids[0];

            await this.storeTaskData(createFileDto, userId, taskId);

            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to create file: ${error.message}`);
        }
    }

    async uploadSignature(signature: UploadSignatureDto, userId: string): Promise<any> {
        const form = new FormData();
        form.append('name', signature.name);
        form.append('rule', signature.rule);

        try {
            const response = await axios.post(`${this.baseUrl}/yara/upload/`, form, {
                headers: form.getHeaders(),
            });

            await this.capeCreateYaraRepository.createSignature({
                name: signature.name,
                rule: signature.rule,
                uploadedBy: userId,
                category: signature.type,
            });

            return response.data;
        } catch (error: any) {
            throw new Error('Signature upload failed');
        }
    }

    async getTask(taskId: string): Promise<any> {
        return axios.get(`${this.baseUrl}/tasks/view/${taskId}`, { headers: { 'Accept': 'application/json' } }).then(response => response.data);
    }

    async getReport(taskId: string): Promise<any> {
        const format = 'json';
        const response = await axios.get(`${this.baseUrl}/tasks/get/report/${taskId}/${format}`, {
            headers: { 'Accept': 'application/json' }
        });

        return response.data;
    }

    private async fetchFromCape<T>(endpoint: string): Promise<T> {
        try {
            return axios.get<T>(`${this.baseUrl}${endpoint}`, { headers: this.headers }).then(response => response.data);
        } catch (error: any) {
            this.logger.warn(`[CapeService] Warning: Failed to fetch from CAPE API. Reason: ${error.message}`);
        }
    }

    private getValidTasks(tasks: any[]): any[] {
        return tasks.filter(task => task.sample?.sha256);
    }

    private async saveFileToDisk(dto: CreateFileDto): Promise<string> {
        const uploadDir = path.join(process.cwd(), 'src', 'file');
      
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
      
        const fileName = `${Date.now()}_${dto.file.originalname}`;
        const filePath = path.join(uploadDir, fileName);
        await fs.promises.writeFile(filePath, dto.file.buffer);
      
        return filePath;
    }
      
    private prepareCapeForm(dto: CreateFileDto): FormData {
        const form = new FormData();
        form.append('file', fs.createReadStream(dto.filePath));
        form.append('package', dto.package);
        form.append('timeout', String(dto.timeout));
        form.append('machine', dto.machine);
        form.append('platform', dto.platform);
        form.append('options', dto.options);
      
        return form;
    }
      
    private async uploadToCape(form: FormData): Promise<any> {
        const capeUrl = `${this.baseUrl}/tasks/create/file/`;
      
        return axios.post(capeUrl, form, {
            headers: {
                ...form.getHeaders(),
                'Accept': 'application/json',
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });
    }
      
    private async storeTaskData(dto: CreateFileDto, userId: string, taskId: string): Promise<void> {
        await this.capeUpsertTaskRepository.upsertTask({
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
        });
    }

    private mapTaskData(taskData: any, taskId: string, userId: string): any {
        return {
            taskId: taskId || taskData.id,
            target: this.extractFilename(taskData.target) || '',
            category: taskData.category || 'file',
            sha256: taskData.sample?.sha256 || null,
            md5: taskData.sample?.md5 || null,
            fileSize: taskData.sample?.file_size || 0,
            machine: taskData.machine || null,
            platform: taskData.platform || 'windows',
            package: taskData.package || null,
            timeout: taskData.timeout || 200,
            memory: taskData.memory || false,
            status: this.mapStatus(taskData.status),
            createdAt: taskData.added_on || taskData.clock || new Date().toISOString(),
            startedAt: taskData.started_on || null,
            completedAt: taskData.completed_on || null,
            incidentType: 'unknown',
            createdBy: userId,
        };
    }

    private formatResponse(data: any): SimplifiedCapeTask {
        return {
            id: data.id,
            filename: this.extractFilename(data.target),
            category: data.category,
            sha256: data.sha256,
            fileSizeMB: String(this.formatFileSize(data.fileSize)) + ' MB',
            startedAt: data.startedAt,
            completedAt: data.completedAt,
            status: data.status,
            incidentType: data.incidentType
        };
    }

    private extractFilename(path: string): string {
        if (!path) return '';
        return this.isUrl(path) ? path : path.split('/').pop() || '';
    }

    private isUrl(str: string): boolean {
        try {
            new URL(str);
            return true;
        } catch {
            return false;
        }
    }

    private formatFileSize(bytes: number): number {
        if (!bytes) return 0;
        return Number((bytes / (1024 * 1024)).toFixed(2));
    }

    private formatJsonField(value: any): string {
        if (!value) return '[]';
        if (Array.isArray(value)) return JSON.stringify(value);
        if (typeof value === 'string') {
            return value.includes(',') ? JSON.stringify(value.split(',').map(item => item.trim())) : JSON.stringify([value]);
        }
        if (typeof value === 'object') return JSON.stringify(value);
        return JSON.stringify([]);
    }

    private mapStatus(capeStatus: string): string {
        const statusMap: { [key: string]: string } = {
            pending: 'pending',
            running: 'running',
            reported: 'reported',
            failed_analysis: 'failedAnalysis',
            completed: 'completed',
            failed: 'failed',
        };
        return statusMap[capeStatus] || 'pending';
    }
}