// tasks.list.dto.ts
import { IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
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
}
