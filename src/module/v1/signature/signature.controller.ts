// signature.controller.ts
import { Controller, Get, Post, Body, Put, Query, Param, UseGuards, Req } from '@nestjs/common';
import { CustomRequest } from 'src/common/types/types';
import { ApiBody } from '@nestjs/swagger';
import { ApiAuth, ApiGetAll, ApiGetOne } from 'src/common/swagger/common-swagger';
import { UserRole } from 'src/common/enums/roles.enum';
import { Role } from 'src/common/decorators/role.decorator';
import { JwtHttpAuthGuard } from 'src/common/guards/auth/http-auth.guard';
import { HttpRoleGuard } from 'src/common/guards/role/http-role.guard';
import { CommonEntity } from 'src/common/libs/common.entity';
import { SignatureService } from './service/signature.service';
import { UploadSignatureDto } from './dto/upload.signature.dto';
import { GetSignaturesQueryDto } from './dto/get.signatures.query.dto';
import { SignatureEntity } from './entity/signature.entity';

@UseGuards(JwtHttpAuthGuard, HttpRoleGuard)
@ApiAuth()
@Controller({ path: 'signature', version: '1' })
export class SignatureController {
    constructor(private readonly signatureService: SignatureService) {}
    
    // @Get('signatures/from-cape-server/and/store/in/db')
    // async getSignature(@Req() req: CustomRequest): Promise<any> {
    //     return this.signatureService.getSignaturesFromCape(req.user.userId);
    // }
    
    @Get('all')
    @ApiGetAll('Signatures', SignatureEntity)
    async getSignatures(@Query() query: GetSignaturesQueryDto, @Req() req: CustomRequest): Promise<any> {
        return this.signatureService.getSignatures(query);
    }

    @Get('signature/:signatureId')
    @ApiGetOne('Signature', SignatureEntity)
    async getSignatureById(@Param('signatureId') id: string): Promise<any> {
        return this.signatureService.getSignatureById(id);
    }

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
    @Post('tasks/upload/signature')
    async uploadSignature(@Body() signature: UploadSignatureDto, @Req() req: CustomRequest): Promise<CommonEntity> {
        return this.signatureService.uploadSignature(signature, req.user.userId);
    }

    @Put('activate')
    @Role(UserRole.SUPERADMIN)
    async activateSignature(@Query('id') id: string): Promise<any> {
        return this.signatureService.activateSignature(id);
    }

    @Put('deactivate')
    @Role(UserRole.SUPERADMIN)
    async deactivateSignature(@Query('id') id: string): Promise<any> {
        return this.signatureService.deactivateSignature(id);
    }

    @Put('update/:signatureId')
    @Role(UserRole.ADMIN)
    async updateSignature(@Param('signatureId') id: string, @Body() signature: UploadSignatureDto): Promise<any> {
        return this.signatureService.updateSignature(id, signature);
    }
}