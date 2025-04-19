// cape.service.ts
import * as FormData from 'form-data';
import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CapeTasksRepository } from '../repository/cape.tasks.repository';

@Injectable()
export class CapeService {
    private readonly baseUrl = process.env.CAPE_URL;

    constructor(
        private readonly capeTasksRepository: CapeTasksRepository
    ) {}

    async getListOfTasks(): Promise<any> {
        const response = await axios.get(`${this.baseUrl}/tasks/list/`, {
            headers: {
                'Accept': 'application/json',
            }
        });

        const tasks = [];
        for (const task of response.data.data) {
            tasks.push(await this.capeTasksRepository.saveTask(task));
        }

        return tasks;
    }

    async createFile(): Promise<any> {
        const capeUrl = `${this.baseUrl}/tasks/create/file/`;
        const filePath = '/Users/user/Coding/datagaze sandbox/src/file/597c463e74b0697d465f30bf59e37d1fa3c769da6a1bf019279f204c7f50b81b.zip';

        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));
        form.append('package', 'default');
        form.append('timeout', '200');
        form.append('machine', 'win10'); 
        form.append('platform', 'windows');
        form.append('options', 'isolated=password');

        const response = await axios.post(capeUrl, form, {
            headers: {
                ...form.getHeaders(),
                'Accept': 'application/json',
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });

        return response.data;
    }

    async createUrl(): Promise<any> {
        const capeUrl = `${this.baseUrl}/tasks/create/url/`;
        const url = 'https://uztown.uz/'; 

        const form = new FormData();
        form.append('url', url);
        form.append('package', 'firefox');
        form.append('timeout', '200');
        // form.append('machine', 'win10'); 
        form.append('platform', 'windows');

        const response = await axios.post(capeUrl, form, {
            headers: {
                ...form.getHeaders(),
                'Accept': 'application/json',
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });

        return response.data;
    }

    async getListOfMachines(): Promise<any> {
        const response = await axios.get(`${this.baseUrl}/machines/list/`, {
            headers: {
                'Accept': 'application/json',
            }
        });
        return response.data;
    }
}