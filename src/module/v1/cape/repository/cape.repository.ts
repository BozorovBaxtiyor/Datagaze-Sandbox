import { Injectable } from "@nestjs/common";
import { Knex } from "knex";
import { InjectKnex } from "nestjs-knex";

@Injectable()
export class CapeRepository {
    constructor(@InjectKnex() private readonly knex: Knex){}

    async deleteTaskByTaskId(taskId: string): Promise<void> { 
        await this.knex('capeTasks')
            .where('taskId', taskId)
            .del()
    }
}