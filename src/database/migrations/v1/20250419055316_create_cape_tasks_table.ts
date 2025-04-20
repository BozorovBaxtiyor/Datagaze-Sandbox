// create_cape_tasks_table.ts
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('capeTasks', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('target').notNullable();
        table.enum('category', ['file', 'url']).notNullable();
        
        table.string('sha256').unique();
        table.string('md5');
        table.integer('fileSize');

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
        ]).nullable();
        
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('startedAt').nullable();
        table.timestamp('completedAt').nullable();

        // table.jsonb('tags').defaultTo('[]');
        // table.jsonb('errors').defaultTo('[]');
        // table.jsonb('sampleInfo').defaultTo('{}');

        table.boolean('timedout').defaultTo(false);

        // 🔽 Unused or not yet mapped columns moved to bottom
        table.string('fileType');
        // table.timestamp('analysisStartedAt').nullable();
        // table.timestamp('analysisFinishedAt').nullable();

        table.index(['status', 'createdAt']);
        table.index('sha256');
        table.index('incidentType');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists('capeTasks');
}
