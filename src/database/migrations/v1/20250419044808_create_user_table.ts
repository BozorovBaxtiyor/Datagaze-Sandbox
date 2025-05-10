// create_user_table.ts
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('users', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('profilePicture').nullable();
        table.string('fullName').nullable();
        table.string('email').nullable().unique();
        table.string('username').notNullable().unique();
        table.string('password').notNullable();
        table.integer('roleId').nullable().defaultTo(2);
        table.string('role').nullable().defaultTo('admin');
        table.string('lastLogin').nullable();
        table.string('status').nullable().defaultTo('active');
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists('users');
}
