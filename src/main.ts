// main.ts
import { NestFactory } from '@nestjs/core';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logger.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'debug', 'log', 'verbose'],
    });

    app.useGlobalInterceptors(new LoggingInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    app.enableVersioning({
        type: VersioningType.URI,
        prefix: 'api/',
        defaultVersion: '1',
    });

    const webConfig = new DocumentBuilder()
        .setTitle('Datagaze Sandbox API')
        .setDescription(
            "Datagaze Sandbox",
        )
        .setVersion('1.0')
        .addTag('Datagaze Sandbox Web')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                in: 'header',
            },
            'JWT',
        )
        .build();

    const webDocument = SwaggerModule.createDocument(app, webConfig);
    SwaggerModule.setup('api', app, webDocument);

 

    app.enableCors({
        origin: '*',
        methods: '*',
        allowedHeaders: '*',
        credentials: true,
    });

    const PORT = process.env.PORT;
    await app.listen(PORT, '0.0.0.0', () => {
        console.log(`Datagaze SandBox server is running on port => ${PORT}`);
    });
}

bootstrap().catch((error) => {
    console.error('Failed to start the application:', error);
    process.exit(1);
});