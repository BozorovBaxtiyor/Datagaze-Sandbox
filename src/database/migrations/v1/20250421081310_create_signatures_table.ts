// create_signatures_table.ts
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('signatureUploads', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        
        table.string('name').notNullable();
        table.text('rule').notNullable();
        table.enum('status', ['active', 'inactive']).defaultTo('active');
        table.timestamp('uploadedAt').defaultTo(knex.fn.now());
        table.timestamp('lastModifiedAt').nullable();
        
        table.string('category').nullable().defaultTo('custom');
        
        table.uuid('uploadedBy')
            .notNullable()
            .references('id')
            .inTable('users')
            .onDelete('CASCADE');

        table.index(['uploadedBy', 'uploadedAt']);
        table.index('name');
        table.index('status');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists('signatureUploads');
}