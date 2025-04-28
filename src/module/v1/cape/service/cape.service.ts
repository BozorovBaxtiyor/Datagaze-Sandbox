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
        if (!task) return;
        
        const taskData = this.mapTaskData(task, taskId, userId);
        await this.capeUpsertTaskRepository.upsertTask(taskData);
    }
    
    private async getFormattedTasks(query: TaskListQueryDto, path: string): Promise<any> {
        const { data } = await this.capeGetTasksRepository.getTotalTasks(query, path);
        return data.map(r => this.formatResponse(r));
    }
    
    async getSignatures(query: GetSignaturesQueryDto, userId: string): Promise<any> {
        const signatures = await this.fetchSignaturesFromDatabase(query, userId);
        return this.enrichSignaturesWithUsernames(signatures);
    }

    private async fetchSignaturesFromDatabase(query: GetSignaturesQueryDto, userId: string): Promise<any[]> {
        const { data } = await this.capeGetSignaturesRepository.getSignaturesByUserId(query, userId);
        return data;
    }

    private async enrichSignaturesWithUsernames(signatures: any[]): Promise<any[]> {
        const signaturePromises = signatures.map(signature => this.enrichSignatureWithUsername(signature));
        return Promise.all(signaturePromises);
    }

    private async enrichSignatureWithUsername(signature: any): Promise<any> {
        const username = await this.capeGetUsernameRepository.getUsernameById(signature.uploadedBy);
        
        return {
            id: signature.id,
            name: signature.name,
            rule: signature.rule,
            type: signature.category, 
            status: signature.status,
            createdAt: signature.uploadedAt,
            uploadedBy: username, 
            lastModifiedAt: signature.lastModifiedAt || signature.uploadedAt,
        };
    }
    
    async getSignaturesFromCape(): Promise<void> {
        try {
            const signatureFiles = await this.fetchSignatureFilesFromCape();
            if (!signatureFiles || signatureFiles.length === 0) return;
            
            await this.processAndStoreSignatureFiles(signatureFiles);
        } catch (error: any) {
            this.logSignatureFetchError(error);
        }
    }
    
    private async fetchSignatureFilesFromCape(): Promise<any[]> {
        const response = await axios.get(`${this.baseUrl}/yara/all/`, { headers: this.headers });
        
        if (!response.data || !response.data.files) {
            this.logger.warn(`[CapeService] No files found in the response.`);
            return [];
        }
        
        return response.data.files;
    }
    
    private async processAndStoreSignatureFiles(files: any[]): Promise<void> {
        for (const file of files) {
            await this.processAndStoreSignatureFile(file);
        }
    }
    
    private async processAndStoreSignatureFile(file: any): Promise<void> {
        const { name, content } = file;
        const baseName = this.extractFilename(name);

        try {
            await this.storeSignatureInDatabase(baseName, content);
            this.logSignatureStoreSuccess(baseName);
        } catch (error: any) {
            this.logSignatureStoreError(name, error);
        }
    }
    
    private async storeSignatureInDatabase(name: string, content: string): Promise<void> {
        await this.capeCreateYaraRepository.createSignature({
            name,
            rule: content,
            uploadedBy: "22ab286b-bed0-47b8-bdca-e83f88d4f912",
            category: 'yar',
        });
    }
    
    private logSignatureStoreSuccess(name: string): void {
        this.logger.log(`[CapeService] Successfully stored signature: ${name}`);
    }
    
    private logSignatureStoreError(name: string, error: any): void {
        this.logger.error(`[CapeService] Failed to store signature: ${name}. Reason: ${error.message}`);
    }
    
    private logSignatureFetchError(error: any): void {
        this.logger.warn(`[CapeService] Warning: Failed to fetch signatures from CAPE API. Reason: ${error.message}`);
    }

    // async createFile(createFileDto: CreateFileDto, userId: string): Promise<any> {
    //     try {
    //         const preparedFile = await this.prepareFileForUpload(createFileDto);
    //         const taskId = await this.uploadFileToCape(preparedFile);
    //         await this.storeTaskData(preparedFile, userId, taskId);

    //         return preparedFile.response.data;
    //     } catch (error: any) {
    //         throw new Error(`Failed to create file: ${error.message}`);
    //     }
    // }

    async createFile(createFileDto: CreateFileDto, userId: string): Promise<any> {
        try {
            const preparedFile = await this.prepareFileForUpload(createFileDto);
            this.logger.debug(`File prepared for upload: ${createFileDto.file.originalname}`);
            
            const taskId = await this.uploadFileToCape(preparedFile);
            this.logger.debug(`File uploaded to CAPE, received taskId: ${taskId}`);
            
            await this.storeTaskData(preparedFile, userId, taskId);
            this.logger.debug(`Task data stored in database for taskId: ${taskId}`);
    
            return preparedFile.response.data;
        } catch (error: any) {
            this.logger.error(`File upload failed: ${error.message}`, error.stack);
            if (error.response) {
                this.logger.error(`CAPE API Response: ${JSON.stringify({
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                })}`);
            }
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
        const response = await this.uploadToCape(preparedFile.form);
        preparedFile.response = response;
        return this.extractTaskIdFromResponse(response);
    }
    
    private extractTaskIdFromResponse(response: any): string {
        return response?.data?.data?.task_ids[0];
    }

    async uploadSignature(signature: UploadSignatureDto, userId: string): Promise<any> {
        try {
            const form = this.createSignatureForm(signature);
            const response = await this.sendSignatureToCape(form);
            await this.storeSignatureRecord(signature, userId);
            
            return response.data;
        } catch (error: any) {
            throw new Error('Signature upload failed');
        }
    }
    
    private createSignatureForm(signature: UploadSignatureDto): FormData {
        const form = new FormData();
        form.append('name', signature.name);
        form.append('rule', signature.rule);
        return form;
    }
    
    private async sendSignatureToCape(form: FormData): Promise<any> {
        return axios.post(`${this.baseUrl}/yara/upload/`, form, {
            headers: form.getHeaders(),
        });
    }
    
    private async storeSignatureRecord(signature: UploadSignatureDto, userId: string): Promise<void> {
        await this.capeCreateYaraRepository.createSignature({
            name: signature.name,
            rule: signature.rule,
            uploadedBy: userId,
            category: signature.type,
        });
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

    // File handling methods
    private async saveFileToDisk(dto: CreateFileDto): Promise<string> {
        const uploadDir = this.getUploadDirectory();
        this.ensureDirectoryExists(uploadDir);
        const fileName = this.generateFileName(dto.file.originalname);
        const filePath = path.join(uploadDir, fileName);
        
        await this.writeFileToDisk(filePath, dto.file.buffer);
        return filePath;
    }
    
    private getUploadDirectory(): string {
        return path.join(process.cwd(), 'src', 'file');
    }
    
    private ensureDirectoryExists(dirPath: string): void {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
    
    private generateFileName(originalName: string): string {
        return `${Date.now()}_${originalName}`;
    }
    
    private async writeFileToDisk(filePath: string, buffer: Buffer): Promise<void> {
        await fs.promises.writeFile(filePath, buffer);
    }
      
    // Form preparation methods
    private prepareCapeForm(dto: CreateFileDto): FormData {
        const form = new FormData();
        this.appendFileToForm(form, dto.filePath);
        this.appendTaskSettingsToForm(form, dto);
        return form;
    }
    
    private appendFileToForm(form: FormData, filePath: string): void {
        form.append('file', fs.createReadStream(filePath));
    }
    
    private appendTaskSettingsToForm(form: FormData, dto: CreateFileDto): void {
        form.append('package', dto.package);
        form.append('timeout', String(dto.timeout));
        form.append('machine', dto.machine);
        form.append('platform', dto.platform);
        form.append('options', dto.options);
    }
      
    // API communication methods
    private async uploadToCape(form: FormData): Promise<any> {
        const capeUrl = this.getCapeFileUploadUrl();
        return this.sendPostRequestWithForm(capeUrl, form);
    }
    
    private getCapeFileUploadUrl(): string {
        return `${this.baseUrl}/tasks/create/file/`;
    }
    
    private async sendPostRequestWithForm(url: string, form: FormData): Promise<any> {
        return axios.post(url, form, {
            headers: this.getFormHeaders(form),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });
    }
    
    private getFormHeaders(form: FormData): any {
        return {
            ...form.getHeaders(),
            'Accept': 'application/json',
        };
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