// common-swagger.ts
import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

// Common success responses
export const ApiOkResponse = (description: string, type?: any) =>
    ApiResponse({
        status: 200,
        description,
        type: type || undefined,
    });

export const ApiCreatedResponse = (description: string, type?: any) =>
    ApiResponse({
        status: 201,
        description,
        type: type || undefined,
    });

// Common error responses
export const ApiUnauthorizedResponse = () =>
    ApiResponse({
        status: 401,
        description: 'Unauthorized',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'error' },
                message: { type: 'string', example: 'Unauthorized access' },
            },
        },
    });

export const ApiForbiddenResponse = () =>
    ApiResponse({
        status: 403,
        description: 'Forbidden',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'error' },
                message: { type: 'string', example: 'Unauthorized user or action' },
            },
        },
    });

export const ApiNotFoundResponse = (entity: string, exampleId?: string) =>
    ApiResponse({
        status: 404,
        description: `${entity} Not Found`,
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 404 },
                message: {
                    type: 'string',
                    example: `${entity} with ID ${exampleId || 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'} not found`,
                },
                error: { type: 'string', example: 'Not Found' },
            },
        },
    });

export const ApiConflictResponse = (message: string) =>
    ApiResponse({
        status: 409,
        description: 'Conflict',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'error' },
                message: { type: 'string', example: message },
            },
        },
    });

export const ApiInternalServerErrorResponse = (message: string) =>
    ApiResponse({
        status: 500,
        description: 'Internal Server Error',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 500 },
                message: { type: 'string', example: message },
                error: { type: 'string', example: 'Internal Server Error' },
            },
        },
    });

// Common combined decorators
export const ApiAuth = () =>
    applyDecorators(
        ApiBearerAuth('JWT'),
        ApiOkResponse('Success'),
        ApiCreatedResponse('Created'),
        ApiUnauthorizedResponse(),
        ApiForbiddenResponse(),
        ApiNotFoundResponse('Not Found'),
        ApiConflictResponse('Conflict'),
        ApiInternalServerErrorResponse('Internal Server Error'),
    );

// Common CRUD operation decorators
export const ApiGetAll = (entity: string, type: any) =>
    applyDecorators(
        ApiOperation({ summary: `Get all ${entity}s` }),
        ApiOkResponse(`List of ${entity}s`, [type]),
        ApiInternalServerErrorResponse(`Failed to fetch ${entity}s`),
    );

export const ApiGetOne = (entity: string, type: any) =>
    applyDecorators(
        ApiOperation({ summary: `Get ${entity} by ID` }),
        ApiOkResponse(`${entity} details`, type),
        ApiNotFoundResponse(entity),
        ApiInternalServerErrorResponse(`Failed to fetch ${entity} details`),
    );

export const ApiCreate = (entity: string, type: any) =>
    applyDecorators(
        ApiOperation({ summary: `Create ${entity}` }),
        ApiCreatedResponse(`${entity} created successfully`, type),
        ApiInternalServerErrorResponse(`Failed to create ${entity}`),
    );

export const ApiUpdate = (entity: string, type: any) =>
    applyDecorators(
        ApiOperation({ summary: `Update ${entity}` }),
        ApiOkResponse(`${entity} updated successfully`, type),
        ApiNotFoundResponse(entity),
        ApiInternalServerErrorResponse(`Failed to update ${entity}`),
    );

export const ApiDelete = (entity: string) =>
    applyDecorators(
        ApiOperation({ summary: `Delete ${entity}` }),
        ApiOkResponse(`${entity} deleted successfully`),
        ApiNotFoundResponse(entity),
        ApiInternalServerErrorResponse(`Failed to delete ${entity}`),
    );