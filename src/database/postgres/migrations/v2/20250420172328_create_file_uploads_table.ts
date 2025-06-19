// // create_file_uploads_table.ts
// import type { Knex } from 'knex';

// export async function up(knex: Knex): Promise<void> {
//     return knex.schema.createTable('capeFileUploads', (table) => {
//         table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        
//         table.uuid('taskId')
//             .notNullable()
//             .references('id')
//             .inTable('capeTasks')
//             .onDelete('CASCADE');
            
//         table.uuid('uploadedBy')
//             .notNullable()
//             .references('id')
//             .inTable('users')
//             .onDelete('CASCADE');
            
//         table.string('originalFilename').notNullable();
//         table.string('sha256').notNullable();
//         table.string('filePath').notNullable();
//         table.string('fileType').notNullable();
//         table.integer('fileSize').notNullable();
        
//         table.timestamp('uploadedAt').defaultTo(knex.fn.now());

//         table.index(['uploadedBy', 'uploadedAt']);
//         table.index('sha256');
//         table.index('taskId');
//     });
// }

// export async function down(knex: Knex): Promise<void> {
//     return knex.schema.dropTableIfExists('capeFileUploads');
// }