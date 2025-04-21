// create_cape_tasks_table.ts
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('capeTasks', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('taskId').notNullable().unique();
        table.string('target').notNullable();
        table.enum('category', ['file', 'url']).notNullable();
        
        table.string('sha256').nullable();
        table.string('md5').nullable();
        table.integer('fileSize').nullable();

        table.string('machine').nullable();
        table.string('platform').defaultTo('windows');
        table.string('package').nullable();
        table.integer('timeout').nullable().defaultTo(200);
        table.boolean('memory').nullable().defaultTo(false);
        
        table.enum('status', [
            'pending',
            'running',
            'processing',
            'analyzing',
            'reported',
            'failedAnalysis',
            'completed'
        ]).defaultTo('pending');
        
        table.enum('incidentType', [
            'malware',
            'ransomware',
            'trojan',
            'virus',
            'worm',
            'spyware',
            'cryptominer',
            'unknown'
        ]).defaultTo('unknown');
        
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('startedAt').nullable();
        table.timestamp('completedAt').nullable();

        table.boolean('timedout').defaultTo(false);

        table.string('fileType').nullable();
        table.string('filePath').nullable();

        table.uuid('createdBy').notNullable().references('id').inTable('users').onDelete('CASCADE');

        table.index(['status', 'createdAt']);
        table.index('sha256');
        table.index('incidentType');
        table.index('createdBy');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists('capeTasks');
}