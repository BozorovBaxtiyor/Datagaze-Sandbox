// tasks.list.dto.ts
import { IsOptional, IsInt, Min, Max, IsEnum, IsDateString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { TaskStatus, TaskCategory, IncidentType } from '../enum/cape.enum';

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

    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'all') return 'all';
        try {
            const date = new Date(value);
            if (isNaN(date.getTime())) return undefined;
            return date.toISOString();
        } catch {
            return undefined;
        }
    })
    startedAt?: string = 'all';

    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'all') return 'all';
        try {
            const date = new Date(value);
            if (isNaN(date.getTime())) return undefined;
            date.setHours(23, 59, 59, 999);
            return date.toISOString();
        } catch {
            return undefined;
        }
    })
    completedAt?: string = 'all';
}
