// signature.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import FormData from 'form-data';
import { extractFilename } from 'src/common/utils/file.util';
import { CommonEntity } from 'src/common/libs/common.entity';
import { AuthRepository } from '../../auth/auth.repository';
import { CapeApiService } from '../../cape/service/cape.api.service';
import { CreateYaraRepository } from '../repository/create.yara.repository';
import { GetSignatureRepository } from '../repository/get.signature.repository';
import { GetSignaturesRepository } from '../repository/get.signatures.repository';
import { UpdateSignatureRepository } from '../repository/update.signature.repository';
import { ActivateSignatureRepository } from '../repository/activate.signature.repository';
import { DeactivateSignatureRepository } from '../repository/deactivate.signature.repository';
import { GetSignaturesQueryDto } from '../dto/get.signatures.query.dto';
import { UploadSignatureDto } from '../dto/upload.signature.dto';

@Injectable()
export class SignatureService {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly capeApiService: CapeApiService,
        private readonly createYaraRepository: CreateYaraRepository, 
        private readonly getSignatureRepository: GetSignatureRepository,
        private readonly getSignaturesRepository: GetSignaturesRepository,
        private readonly activateSignatureRepository: ActivateSignatureRepository,
        private readonly deactivateSignatureRepository: DeactivateSignatureRepository,
        private readonly updateSignatureRepository: UpdateSignatureRepository,
    ) {}

    async getSignaturesFromCape(userId: string): Promise<void> {
        const signatureFiles = await this.fetchSignatureFilesFromCape();
        if (!signatureFiles || signatureFiles.length === 0) return;
        
        await this.processAndStoreSignatureFiles(signatureFiles, userId);
    }
    
    private async fetchSignatureFilesFromCape(): Promise<any[]> {
        const response = await this.capeApiService.getAllSignatures();
        if (!response.data || !response.data.files) {
            return [];
        }
        
        return response.data.files;
    }

    private async processAndStoreSignatureFiles(files: any[], userId: string): Promise<void> {
        for (const file of files) {
            await this.processAndStoreSignatureFile(file, userId);
        }
    }

    private async processAndStoreSignatureFile(file: any, userId: string): Promise<void> {
        const { name, content } = file;
        const baseName = extractFilename(name);
        await this.storeSignatureInDatabase(baseName, content, userId);
    }
    
    private async storeSignatureInDatabase(name: string, content: string, userId: string): Promise<void> {
        await this.createYaraRepository.createSignature({
            name,
            rule: content,
            uploadedBy: "aa00510b-02ab-4c8b-a25d-e9bf4947e3d8",
            category: 'yar',
        });
    }

    async uploadSignature(signature: UploadSignatureDto, userId: string): Promise<CommonEntity> {
        return this.uploadSignatureHelper(signature, userId);
    }

    private async uploadSignatureHelper(signature: UploadSignatureDto, userId: string): Promise<CommonEntity> {
        try {
            await this.storeSignatureRecord(signature, userId);
            return { status: 'success', message: 'Signature uploaded successfully' };
        } catch (error: any) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new Error('Signature upload failed');
        }
    }

    async getSignatures(query: GetSignaturesQueryDto): Promise<any> {
        const signatures = await this.fetchSignaturesFromDatabase(query);
        return this.enrichSignaturesWithUsernames(signatures);
    }

    private createSignatureForm(signature: UploadSignatureDto): FormData {
        const form = new FormData();
        form.append('name', signature.name);
        form.append('rule', signature.rule);
        return form;
    }

    private async storeSignatureRecord(signature: UploadSignatureDto, userId: string): Promise<void> {
        await this.createYaraRepository.createSignature({
            name: signature.name,
            rule: signature.rule,
            uploadedBy: userId,
            category: signature.type,
        });
    }

    private async fetchSignaturesFromDatabase(query: GetSignaturesQueryDto): Promise<any[]> {
        const { data } = await this.getSignaturesRepository.getSignaturesByUserId(query);
        return data;
    }

    private async enrichSignaturesWithUsernames(signatures: any[]): Promise<any[]> {
        const signaturePromises = signatures.map(signature => this.enrichSignatureWithUsername(signature));
        return Promise.all(signaturePromises);
    }

    private async enrichSignatureWithUsername(signature: any): Promise<any> {
        const username = await this.authRepository.getUsernameById(signature.uploadedBy);
        
        return {
            id: signature.id,
            name: signature.name,
            rule: signature.rule,
            type: signature.category, 
            status: signature.status,
            createdAt: signature.uploadedAt,
            uploadedBy: username, 
            lastModifiedAt: signature.lastModifiedAt || signature.uploadedAt,
        };
    }

    async getSignatureById(id: string): Promise<any> {
        return this.getSignatureRepository.getSignatureById(id);
    }

    async activateSignature(id: string): Promise<CommonEntity> {
        const signature = await this.getSignatureRepository.getSignatureById(id);
        if (!signature) {
            throw new NotFoundException(`Signature with ID ${id} not found`);
        }

        const form = this.createSignatureForm(signature);
        await this.capeApiService.sendSignatureToCape(form);
        
        await this.activateSignatureRepository.activateSignature(id);
        return { status: 'success', message: 'Signature activated successfully' };
    }

    async deactivateSignature(id: string): Promise<CommonEntity> {
        await this.deactivateSignatureRepository.deactivateSignature(id);
        return { status: 'success', message: 'Signature deactivated successfully' };
    }

    async updateSignature(id: string, signature: UploadSignatureDto): Promise<CommonEntity> {
        const existingSignature = await this.getSignatureRepository.getSignatureById(id);
        if (!existingSignature) {
            throw new NotFoundException(`Signature with ID ${id} not found`);
        }

        await this.updateSignatureRepository.updateSignature(id, signature);
        return { status: 'success', message: 'Signature updated successfully' };
    }
}