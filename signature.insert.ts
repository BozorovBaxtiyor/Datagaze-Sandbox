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
        host: 'db-postgresql-fra1-20011-do-user-16958659-0.c.db.ondigitalocean.com',
        port: 25060,
        database: 'datagaze_sandbox',
        user: 'doadmin',
        password: 'AVNS_Fq4FdQEYfifqZ9Xh-n3',
        ssl: {
            rejectUnauthorized: false,
        }
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
        // Handle the case where the JSON objects are simply concatenated
        const jsonPattern = /(\{[\s\S]*?\})\s*(?=\{|$)/g;
        let match;
        const signatures: YaraSignature[] = [];
        
        while ((match = jsonPattern.exec(content)) !== null) {
            try {
                const jsonObj = JSON.parse(match[1]);
                signatures.push(jsonObj);
            } catch (e) {
                console.error('Failed to parse JSON block:', match[1].substring(0, 100) + '...');
            }
        }

        console.log(`Found ${signatures.length} signatures to import`);

        if (signatures.length === 0) {
            console.error('No valid signatures found in the file. Please check the format.');
            return;
        }

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