// cape.signature.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
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
            this.validateYaraRule(signature.rule);

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

    private validateYaraRule(rule: string): void {
        if (!rule || typeof rule !== 'string') {
            throw new BadRequestException('YARA rule must be a non-empty string');
        }

        const trimmedRule = rule.trim();
        
        if (!trimmedRule.startsWith('rule')) {
            throw new BadRequestException('YARA rule must start with "rule" keyword');
        }

        const ruleNameMatch = trimmedRule.match(/rule\s+([a-zA-Z0-9_]+)\s*{/);
        if (!ruleNameMatch) {
            throw new BadRequestException('YARA rule must have a valid name followed by {');
        }

        const openBraces = (trimmedRule.match(/{/g) || []).length;
        const closeBraces = (trimmedRule.match(/}/g) || []).length;
        if (openBraces !== closeBraces) {
            throw new BadRequestException('YARA rule has unbalanced braces');
        }

        const requiredSections = ['strings:', 'condition:'];
        for (const section of requiredSections) {
            if (!trimmedRule.includes(section)) {
                throw new BadRequestException(`YARA rule must contain ${section} section`);
            }
        }

        const stringDefinitions = trimmedRule.match(/\$[a-zA-Z0-9_]*\s*=/g);
        if (!stringDefinitions) {
            throw new BadRequestException('YARA rule must contain at least one string definition');
        }
    }
}