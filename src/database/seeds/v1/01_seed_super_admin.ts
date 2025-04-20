// seed_super_admin.ts
import { Knex } from 'knex';
import * as bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
    await knex('users').del();

    let hashedPassword: string;
    try {
        hashedPassword = await bcrypt.hash('superadmin', 10);
    } catch (err: unknown) {
        const error = err as Error;
        throw new Error(`Failed to hash password: ${error.message}`);
    }

    await knex('users').insert([
        {
            username: 'superadmin',
            password: hashedPassword,
            role: 'superadmin',
            roleId: 1,
            created_at: new Date(),
            updated_at: new Date(),
        },
    ]);
}
