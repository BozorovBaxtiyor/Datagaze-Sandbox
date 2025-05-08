// signature.controller.ts
import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { CustomRequest } from 'src/common/types/types';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ApiAuth } from 'src/common/swagger/common-swagger';
import { JwtHttpAuthGuard } from 'src/common/guards/auth/http-auth.guard';
import { HttpRoleGuard } from 'src/common/guards/role/http-role.guard';
import { SignatureService } from './service/signature.service';
import { UploadSignatureDto } from './dto/upload.signature.dto';
import { GetSignaturesQueryDto } from './dto/get.signatures.query.dto';

@UseGuards(JwtHttpAuthGuard, HttpRoleGuard)
@ApiAuth()
@Controller({ path: 'signature', version: '1' })
export class SignatureController {
    constructor(private readonly signatureService: SignatureService) {}
    
    @Get('signatures/from-cape-server/and/store/in/db')
    async getSignature(@Req() req: CustomRequest): Promise<any> {
        return this.signatureService.getSignaturesFromCape(req.user.userId);
    }

    @ApiOperation({ summary: 'Get signatures', description: 'Retrieves signatures based on query parameters' })
    @ApiResponse({ status: 200, description: 'Signatures retrieved successfully' })
    @Get('tasks/signatures')
    async getSignatures(@Query() query: GetSignaturesQueryDto, @Req() req: CustomRequest): Promise<any> {
        return this.signatureService.getSignatures(query, req.user.userId);
    }

    @ApiOperation({ summary: 'Upload signature', description: 'Upload a new signature to the system' })
    @ApiBody({ 
        type: UploadSignatureDto, 
        description: 'User credentials',
        examples: {
            loginExample: {
                value: {
                    name: 'filename.yar',
                    type: 'YAR',
                    rule: 'rule',
                },
            }
        } 
    })
    @ApiResponse({ status: 201, description: 'Signature uploaded successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Post('tasks/upload/signature')
    async uploadSignature(@Body() signature: UploadSignatureDto, @Req() req: CustomRequest): Promise<any> {
        return this.signatureService.uploadSignature(signature, req.user.userId);
    }
}