// tasks.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';

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
export class CapeTasksRepository {
    constructor(@InjectKnex() private readonly knex: Knex) {}

    async saveTask(taskData: any): Promise<SimplifiedCapeTask> {
        const mappedData = {
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

        try {
            let result;
            if (mappedData.sha256) {
                const existing = await this.knex('capeTasks')
                    .where('sha256', mappedData.sha256)
                    .first();

                if (existing) {
                    [result] = await this.knex('capeTasks')
                        .where('sha256', mappedData.sha256)
                        .update(mappedData)
                        .returning('*');
                }
            }

            if (!result) {
                [result] = await this.knex('capeTasks')
                    .insert(mappedData)
                    .returning('*');
            }

            return this.formatResponse(result);
        } catch (error) {
            console.error('Error saving task:', error);
            throw new Error(`Failed to save task: ${error.message}`);
        }
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
        
        if (this.isUrl(path)) {
            return path; // Return full URL for URL category
        }
        
        const parts = path.split('/');
        return parts[parts.length - 1];
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
        return Number((bytes / (1024 * 1024)).toFixed(2)); // Convert bytes to MB
    }

    private formatJsonField(value: any): string {
        if (!value) return '[]';
        if (Array.isArray(value)) return JSON.stringify(value);
        if (typeof value === 'string') {
            // Handle comma-separated string
            if (value.includes(',')) {
                return JSON.stringify(value.split(',').map(item => item.trim()));
            }
            // Handle single string value
            return JSON.stringify([value]);
        }
        if (typeof value === 'object') return JSON.stringify(value);
        return JSON.stringify([]);
    }

    private parseJsonFields(data: any): any {
        return {
            ...data,
            tags: this.safeJsonParse(data.tags, []),
            errors: this.safeJsonParse(data.errors, []),
            sampleInfo: this.safeJsonParse(data.sampleInfo, {})
        };
    }

    private safeJsonParse(value: string, defaultValue: any): any {
        try {
            return JSON.parse(value);
        } catch {
            return defaultValue;
        }
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