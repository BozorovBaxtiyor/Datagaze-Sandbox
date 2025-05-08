// create.yara.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CreateYaraRepository {
    private readonly logger = new Logger(CreateYaraRepository.name);
    private readonly outputFile = path.join('signatures.txt');

    constructor(@InjectKnex() private readonly knex: Knex) {
        if (!fs.existsSync(this.outputFile)) {
            fs.writeFileSync(this.outputFile, '', 'utf8');
        }
    }

    async createSignature(signature: any): Promise<void> {
        const realSignature = {
            ...signature,
            status: 'pending',
            uploadedAt: new Date().toISOString(),
        };

        // await this.knex('signatureUploads').insert(realSignature);

        // const json = JSON.stringify(realSignature, null, 4);
        // await fs.promises.appendFile(this.outputFile, json + '\n\n', 'utf8');

        this.logger.debug(`Signature appended: ${signature.name}`);
    }
}
