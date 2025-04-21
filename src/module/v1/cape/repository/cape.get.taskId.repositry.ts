// cape.get.taskId.repositry.ts
import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';

@Injectable()
export class CapeGetTaskIdRepository {
    constructor(@InjectKnex() private readonly knex: Knex) {}

    async getTaskIdByUserId(userId: string): Promise<string[]> {
        const taskIds = await this.knex('capeTasks').select('taskId').where('createdBy', userId); 
        return taskIds.map(task => task.taskId); 
    }
    
}