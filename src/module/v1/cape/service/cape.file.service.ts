// cape.file.service.ts
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as FormData from 'form-data';

@Injectable()
export class CapeFileService {

    async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            await fs.promises.access(dirPath);
        } catch {
            try {
                await fs.promises.mkdir(dirPath, { recursive: true });
            } catch (error: unknown) {
                if (error instanceof Error) {
                    throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
                }
                throw new Error(`Failed to create directory ${dirPath}: Unknown error occurred`);
            }
        }
    }

    async writeFileToDisk(filePath: string, buffer: Buffer): Promise<void> {
        await fs.promises.writeFile(filePath, buffer);
    }

    async listScreenshotImages(shotsDir: string, realTaskId: string): Promise<string[]> {
        try {
            await fs.promises.access(shotsDir);                   
            const files = await fs.promises.readdir(shotsDir);    
            return files.filter(f => /\.(jpg|jpeg|png)$/i.test(f)).map(f => `/images/${realTaskId}/shots/${f}`);
        } catch {
            return [];                                            
        }
    }

    appendFileToForm(form: FormData, filePath: string): void {
        form.append('file', fs.createReadStream(filePath));
    }
}