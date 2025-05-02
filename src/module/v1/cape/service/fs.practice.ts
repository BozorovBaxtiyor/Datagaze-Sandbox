import * as fs from 'fs';

class FileService {
    async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            const result = await fs.promises.access(dirPath);
            console.log('result:', result);
        } catch(error: unknown) {
            console.log('error:', error);
            // try {
            //     await fs.promises.mkdir(dirPath, { recursive: true });
            // } catch (error: unknown) {
            //     if (error instanceof Error) {
            //         throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
            //     }
            //     throw new Error(`Failed to create directory ${dirPath}: Unknown error occurred`);
            // }
        }
    }
}

const fileService = new FileService();
const dirPath = __dirname + '/sampleDir';

console.log('Directory path:', dirPath);
fileService.ensureDirectoryExists(dirPath)
    .then(() => {
        console.log('Directory exists or was created successfully');
    })
    .catch((error: Error) => {
        console.error('Error:', error.message);
    });