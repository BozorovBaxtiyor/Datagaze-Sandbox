// cape.upsert.task.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import { TaskListQueryDto } from '../dto/tasks.list.query.dto';

@Injectable()
export class CapeUpsertTaskRepository {
    constructor(@InjectKnex() private readonly knex: Knex) {}

    async upsertTask(taskData: any): Promise<any> {
        const existing = await this.knex('capeTasks').where('sha256', taskData.sha256).first();
    
        if (existing) {
            const [result] = await this.knex('capeTasks').where('sha256', taskData.sha256).update(taskData).returning('*');
            return result;
        }
    
        const [result] = await this.knex('capeTasks').insert(taskData).returning('*');
        return result;
    }    
}