// cape.api.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';

@Injectable()
export class CapeApiService {
    private readonly headers = { Accept: 'application/json' };
    private readonly baseUrl = process.env.CAPE_URL;
    private readonly logger = new Logger(CapeApiService.name);

    async getTask(taskId: string): Promise<any> {
        return axios.get(`${this.baseUrl}/tasks/view/${taskId}/`, { headers: this.headers });
    }

    async uploadFile(form: FormData): Promise<any> {
        const url = `${this.baseUrl}/tasks/create/file/`;

        this.logger.log(`[CAPE-API] Uploading file to: ${url}`);
        this.logger.log(
            `[CAPE-API] Request headers: ${JSON.stringify({
                ...form.getHeaders(),
                ...this.headers,
            })}`,
        );

        try {
            const response = await axios.post(url, form, {
                headers: {
                    ...form.getHeaders(),
                    ...this.headers,
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            });

            this.logger.log(
                `[CAPE-API] Upload successful. Response: ${JSON.stringify({
                    status: response.status,
                    statusText: response.statusText,
                    data: response.data,
                })}`,
            );

            return response;
        } catch (error: any) {
            this.logger.error(`[CAPE-API] Upload failed: ${error.message}`);
            this.logger.error(
                `[CAPE-API] Error details: ${JSON.stringify({
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                })}`,
            );
            throw error;
        }
    }

    async sendSignatureToCape(form: FormData): Promise<any> {
        return axios.post(`${this.baseUrl}/yara/upload/`, form, {
            headers: form.getHeaders(),
        });
    }

    async getReport(taskId: string, format: string): Promise<any> {
        return axios.get(`${this.baseUrl}/tasks/get/report/${taskId}/${format}`, {
            headers: this.headers,
        });
    }

    async getScreenshot(realTaskId: string): Promise<any> {
        return axios.get(`${this.baseUrl}/tasks/get/screenshot/${realTaskId}/`, {
            responseType: 'arraybuffer',
        });
    }

    async getMachineLists(): Promise<any> {
        return axios.get(`${this.baseUrl}/machines/list/`, { headers: this.headers });
    }

    async getAllSignatures(): Promise<any> {
        return axios.get(`${this.baseUrl}/yara/all/`, { headers: this.headers });
    }

    async getReportBySha256(sha256: string): Promise<any> {
        return axios.get(`${this.baseUrl}/files/view/sha256/${sha256}`, { headers: this.headers });
    }
}
