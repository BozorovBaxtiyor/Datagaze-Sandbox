// signature.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import FormData from 'form-data';
import { extractFilename } from 'src/common/utils/file.util';
import { AuthRepository } from '../../auth/auth.repository';
import { CapeApiService } from '../../cape/service/cape.api.service';
import { CreateYaraRepository } from '../repository/create.yara.repository';
import { GetSignaturesRepository } from '../repository/get.signatures.repository';
import { GetSignaturesQueryDto } from '../dto/get.signatures.query.dto';
import { UploadSignatureDto } from '../dto/upload.signature.dto';

@Injectable()
export class SignatureService {
    private readonly logger = new Logger(SignatureService.name);

    constructor(
        private readonly authRepository: AuthRepository,
        private readonly capeApiService: CapeApiService,
        private readonly createYaraRepository: CreateYaraRepository, 
        private readonly getSignaturesRepository: GetSignaturesRepository,
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

    async uploadSignature(signature: UploadSignatureDto, userId: string): Promise<any> {
        return this.uploadSignatureHelper(signature, userId);
    }

    async getSignatures(query: GetSignaturesQueryDto, userId: string): Promise<any> {
        const signatures = await this.fetchSignaturesFromDatabase(query, userId);
        return this.enrichSignaturesWithUsernames(signatures);
    }

    private async uploadSignatureHelper(signature: UploadSignatureDto, userId: string): Promise<any> {
        try {
            const form = this.createSignatureForm(signature);
            const response = await this.capeApiService.sendSignatureToCape(form);
            await this.storeSignatureRecord(signature, userId);
            
            return response.data;
        } catch (error: any) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new Error('Signature upload failed');
        }
    }

    private async fetchSignaturesFromDatabase(query: GetSignaturesQueryDto, userId: string): Promise<any[]> {
        const { data } = await this.getSignaturesRepository.getSignaturesByUserId(query, userId);
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
}