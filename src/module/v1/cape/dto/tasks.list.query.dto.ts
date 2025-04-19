// tasks.list.dto.ts
import { IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum TaskStatus {
    All = 'all',
    Pending = 'pending',
    Running = 'running',
    Processing = 'processing',
    Analyzing = 'analyzing',
    Reported = 'reported',
    FailedAnalysis = 'failedAnalysis',
    Completed = 'completed',
}

export enum TaskCategory {
    All = 'all',
    File = 'file',
    URL = 'url',
}

export enum IncidentType {
    All = 'all',
    Malware = 'malware',
    Ransomware = 'ransomware',
    Trojan = 'trojan',
    Virus = 'virus',
    Worm = 'worm',
    Spyware = 'spyware',
    Cryptominer = 'cryptominer',
    Unknown = 'unknown',
}

export class TaskListQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(10)
    @Max(100)
    limit?: number = 10;

    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus | 'all' = 'all';

    @IsOptional()
    @IsEnum(TaskCategory)
    category?: TaskCategory | 'all' = 'all';

    @IsOptional()
    @IsEnum(IncidentType)
    incidentType?: IncidentType | 'all' = 'all';
}
