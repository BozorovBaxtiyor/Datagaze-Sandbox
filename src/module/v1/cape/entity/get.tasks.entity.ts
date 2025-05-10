// get.tasks.entity.ts
import { ApiProperty } from '@nestjs/swagger';

export class GetTasksEntity {
    @ApiProperty({ description: 'Unique identifier of the task', example: '61f8b1e3a7dc4231a8e9b123' })
    id: string;

    @ApiProperty({ description: 'Name of the submitted file', example: 'malware_sample.exe' })
    filename: string;

    @ApiProperty({ description: 'Category of the analysis', example: 'file' })
    category: string;

    @ApiProperty({ description: 'SHA256 hash of the submitted file', example: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' })
    sha256: string;

    @ApiProperty({ description: 'File size in megabytes', example: '2.34' })
    fileSizeMB: string;

    @ApiProperty({ description: 'Time when the analysis started', example: '2023-01-15T14:30:22Z' })
    startedAt: string;

    @ApiProperty({ description: 'Time when the analysis completed', example: '2023-01-15T14:35:47Z' })
    completedAt: string;

    @ApiProperty({ 
        description: 'Current status of the task', 
        example: 'completed', 
        enum: ['pending', 'running', 'completed', 'failed'] 
    })
    status: string;

    @ApiProperty({ 
        description: 'Type of security incident identified', 
        example: 'malware', 
        enum: ['malware', 'ransomware', 'clean', 'suspicious']
    })
    incidentType: string;
}