// ./src/database/seeds/v1/seed_super_admin.ts
import { Knex } from 'knex';
import * as bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
    // Delete existing entries
    await knex('users').del();

    // Generate hashed password with proper error handling
    let hashedPassword: string;
    try {
        hashedPassword = await bcrypt.hash('superadmin', 10);
    } catch (err: unknown) {
        const error = err as Error;
        console.error('Error hashing password:', error.message);
        throw new Error(`Failed to hash password: ${error.message}`);
    }

    // Insert seed entries
    await knex('users').insert([
        {
            username: 'superadmin',
            email: 'superadmin@example.com',
            password: hashedPassword,
            fullName: 'Joe Doe',
            role: 'superadmin',
            roleId: 1,
            created_at: new Date(),
            updated_at: new Date(),
        },
    ]);
}
