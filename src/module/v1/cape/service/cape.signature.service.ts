// cape.signature.service.ts
import { Injectable } from '@nestjs/common';
import FormData from 'form-data';
import { CapeCreateYaraRepository } from '../repository/cape.create.yara.repository';
import { CapeGetSignaturesRepository } from '../repository/cape.get.signatures.repository';
import { CapeGetUsernameRepository } from '../repository/cape.get.username.repository';
import { CapeApiService } from './cape.api.service';
import { GetSignaturesQueryDto } from '../dto/get.signatures.query.dto';
import { UploadSignatureDto } from '../dto/upload.signature.dto';

@Injectable()
export class CapeSignatureService {
    constructor(
        private readonly capeCreateYaraRepository: CapeCreateYaraRepository,
        private readonly capeGetSignaturesRepository: CapeGetSignaturesRepository,
        private readonly capeGetUsernameRepository: CapeGetUsernameRepository,
        private readonly capeApiService: CapeApiService,
    ) {}

    async getSignatures(query: GetSignaturesQueryDto, userId: string): Promise<any> {
        const signatures = await this.fetchSignaturesFromDatabase(query, userId);
        return this.enrichSignaturesWithUsernames(signatures);
    }

    async uploadSignature(signature: UploadSignatureDto, userId: string): Promise<any> {
        try {
            const form = this.createSignatureForm(signature);
            const response = await this.capeApiService.sendSignatureToCape(form);
            await this.storeSignatureRecord(signature, userId);
            
            return response.data;
        } catch (error: any) {
            throw new Error('Signature upload failed');
        }
    }

    private async fetchSignaturesFromDatabase(query: GetSignaturesQueryDto, userId: string): Promise<any[]> {
        const { data } = await this.capeGetSignaturesRepository.getSignaturesByUserId(query, userId);
        return data;
    }

    private async enrichSignaturesWithUsernames(signatures: any[]): Promise<any[]> {
        const signaturePromises = signatures.map(signature => this.enrichSignatureWithUsername(signature));
        return Promise.all(signaturePromises);
    }

    private async enrichSignatureWithUsername(signature: any): Promise<any> {
        const username = await this.capeGetUsernameRepository.getUsernameById(signature.uploadedBy);
        
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
        await this.capeCreateYaraRepository.createSignature({
            name: signature.name,
            rule: signature.rule,
            uploadedBy: userId,
            category: signature.type,
        });
    }
}