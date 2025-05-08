import * as fs from 'fs';
import { knex } from 'knex';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

interface YaraSignature {
    name: string;
    rule: string;
    uploadedBy: string;
    category: string;
    uploadedAt: string;
    status: 'active' | 'inactive' | 'pending';
}

const db = knex({
    client: 'postgresql',
    connection: {
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    },
    pool: {
        min: 2,
        max: 10,
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 100
    }
});

async function importSignatures(filePath: string): Promise<void> {
    try {
        console.log('Reading signatures file...');
        const content = await fs.promises.readFile(filePath, 'utf8');
        
        console.log('Parsing signatures...');
        const signatures = content
            .split('}\n\n{')
            .map(block => {
                // Fix the JSON blocks that were split
                const fixedBlock = block
                    .replace(/^\n+|\n+$/g, '')
                    .replace(/^(?!{)/, '{')
                    .replace(/(?!})$/, '}');
                
                try {
                    return JSON.parse(fixedBlock);
                } catch (e) {
                    console.error('Failed to parse block:', fixedBlock);
                    return null;
                }
            })
            .filter(Boolean);

        console.log(`Found ${signatures.length} signatures to import`);

        // Test database connection before transaction
        await db.raw('SELECT 1');
        console.log('Database connection successful');

        await db.transaction(async (trx) => {
            for (const sig of signatures) {
                await trx('signatureUploads')
                    .insert({
                        name: sig.name,
                        rule: sig.rule,
                        uploadedBy: sig.uploadedBy,
                        category: sig.category,
                        uploadedAt: sig.uploadedAt,
                        status: sig.status,
                        lastModifiedAt: new Date().toISOString()
                    })
                    .timeout(5000); // 5 second timeout per insert
                
                console.log(`✓ Imported signature: ${sig.name}`);
            }
        });

        console.log(`\n✅ Successfully imported ${signatures.length} signatures`);
    } catch (error) {
        console.error('❌ Failed to import signatures:', error);
        throw error;
    } finally {
        await db.destroy();
    }
}

const filePath = path.join(__dirname, 'signatures.txt');
console.log(`Importing signatures from ${filePath}`);

importSignatures(filePath)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });