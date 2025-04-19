// cape.service.ts
import * as FormData from 'form-data';
import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CapeTasksRepository } from '../repository/cape.tasks.repository';
import { TaskListQueryDto } from '../dto/tasks.list.query.dto';

interface SimplifiedCapeTask {
    id: string;
    filename: string;
    category: string;
    sha256: string;
    fileSizeMB: string;
    startedAt: string;
    completedAt: string;
    status: string;
    incidentType: string;
}

@Injectable()
export class CapeService {
    private readonly baseUrl = process.env.CAPE_URL;

    constructor(private readonly capeTasksRepository: CapeTasksRepository) {}

    async getTasks(query: TaskListQueryDto): Promise<any> {
        const resp = await axios.get(`${this.baseUrl}/tasks/list/`, { headers: { Accept: 'application/json' } });

        const validTasks = resp.data.data.filter(t => t.sample?.sha256);

        await Promise.all(validTasks.map(t => 
            this.capeTasksRepository.upsertTask(this.mapTaskData(t))
        ));
    
        const { data } = await this.capeTasksRepository.findAndCount(query);

        return data.map(r => this.formatResponse(r));
    }  

    async getTask(taskId: string): Promise<any> {
        const response = await axios.get(`${this.baseUrl}/tasks/view/${taskId}`, {
            headers: { 'Accept': 'application/json' }
        });

        return response.data;
    }

    private mapTaskData(taskData: any) {
        return {
            target: taskData.target || '',
            category: taskData.category || 'file',
            sha256: taskData.sample?.sha256 || null,
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
            tags: this.formatJsonField(taskData.tags),
            errors: this.formatJsonField(taskData.errors),
            sampleInfo: this.formatJsonField(taskData.sample)
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
            return value.includes(',') 
                ? JSON.stringify(value.split(',').map(item => item.trim())) 
                : JSON.stringify([value]);
        }
        if (typeof value === 'object') return JSON.stringify(value);
        return JSON.stringify([]);
    }

    private mapStatus(capeStatus: string): string {
        const statusMap: { [key: string]: string } = {
            pending: 'pending',
            running: 'running',
            reported: 'completed',
            failed_analysis: 'failedAnalysis',
            completed: 'completed'
        };
        return statusMap[capeStatus] || 'pending';
    }
}