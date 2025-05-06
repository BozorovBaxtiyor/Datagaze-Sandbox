// // // cape.create.yara.repository.ts
// // import { Injectable, Logger } from '@nestjs/common';
// // import { InjectKnex, Knex } from 'nestjs-knex';

// // @Injectable()
// // export class CapeCreateYaraRepository {
// //     private readonly logger = new Logger(CapeCreateYaraRepository.name);
    
// //     constructor(@InjectKnex() private readonly knex: Knex) {}

// //     async createSignature(signature: any): Promise<any> {
// //         try {
            
// //             const realSignature = {
// //                 ...signature,
// //                 uploadedAt: new Date().toISOString(),
// //                 status: signature.status || 'active'
// //             };

// //             this.logger.debug('Prepared signature object:', realSignature);

// //             await this.knex.raw('SELECT 1');

// //             const tableExists = await this.knex.schema.hasTable('signatureUploads');

// //             if (!tableExists) {
// //                 throw new Error('Table signatureUploads does not exist');
// //             }

// //             // Get the query without executing it
// //             const query = this.knex('signatureUploads')
// //                 .insert(realSignature)
// //                 .timeout(20000, { cancel: true })
// //                 .returning('*')
// //                 .toString();
            

// //             // Execute the insert with returning
// //             const result = await this.knex('signatureUploads')
// //                 .insert(realSignature)
// //                 .returning('*');

// //             return result[0];
// //         } catch (error: any) {
// //             this.logger.error('Failed to create signature:', {
// //                 error: error.message,
// //                 stack: error.stack,
// //                 sqlMessage: error.sqlMessage,
// //                 code: error.code,
// //                 detail: error.detail,
// //                 hint: error.hint
// //             });
// //             throw error;
// //         }
// //     }
// // }


// // cape.create.yara.repository.ts
// import { Injectable, Logger } from '@nestjs/common';
// import { InjectKnex, Knex } from 'nestjs-knex';
// import * as fs from 'fs';

// @Injectable()
// export class CapeCreateYaraRepository {
//     private readonly logger = new Logger(CapeCreateYaraRepository.name);
    
//     constructor(@InjectKnex() private readonly knex: Knex) {}

//     async createSignature(signature: any): Promise<any> {
//         try {
//             // await this.knex('signatureUploads')
//             //     .insert({
//             //         ...signature,
//             //         uploadedAt: new Date().toISOString(),
//             //         status: signature.status || 'active'
//             //     });
//             // const realSignature = {
//             //     ...signature,
//             //     uploadedAt: new Date().toISOString(),
//             //     status: signature.status || 'active'
//             // };

//             await fs.promises.writeFile('main.sql', this.knex('signatureUploads')
//                 .insert({
//                     ...signature,
//                     uploadedAt: new Date().toISOString(),
//                     status: signature.status || 'active'
//                 }));
//             this.logger.debug(`Signature created successfully: ${signature.name}`);
//         } catch (error: any) {
//             this.logger.error(`Failed to create signature: ${error.message}`);
//             throw error;
//         }
//     }
// }