// // cape.create.yara.repository.ts
// import { Injectable, Logger } from '@nestjs/common';
// import { InjectKnex, Knex } from 'nestjs-knex';

// @Injectable()
// export class CapeCreateYaraRepository {
//     private readonly logger = new Logger(CapeCreateYaraRepository.name);
    
//     constructor(@InjectKnex() private readonly knex: Knex) {}

//     async createSignature(signature: any): Promise<any> {
//         try {
//             await this.knex('signatureUploads')
//                 .insert({
//                     ...signature,
//                     uploadedAt: new Date().toISOString(),
//                     status: signature.status || 'active'
//                 });

//             this.logger.debug(`Signature created successfully: ${signature.name}`);
//         } catch (error: any) {
//             this.logger.error(`Failed to create signature: ${error.message}`);
//             throw error;
//         }
//     }
// }

import { Injectable, Logger } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CapeCreateYaraRepository {
    private readonly logger = new Logger(CapeCreateYaraRepository.name);
    private readonly sqlFilePath = path.join(process.cwd(), 'signature_inserts.sql');
    
    constructor(@InjectKnex() private readonly knex: Knex) {}

    async createSignature(signature: any): Promise<void> {
        try {
            // Create insert query without executing it
            const query = this.knex('signatureUploads')
                .insert({
                    ...signature,
                    uploadedAt: new Date().toISOString(),
                    status: signature.status || 'active'
                })
                .toString();

            // Add semicolon for SQL statement termination
            const sqlStatement = query + ';\n\n';

            // Write to file
            fs.appendFileSync(this.sqlFilePath, sqlStatement);

            this.logger.debug(`SQL for signature "${signature.name}" written to ${this.sqlFilePath}`);
            this.logger.debug(`Generated SQL: ${query}`);

        } catch (error: any) {
            this.logger.error(`Failed to generate SQL for signature: ${error.message}`);
            throw error;
        }
    }
}