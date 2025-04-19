// main.ts
import { NestFactory } from '@nestjs/core';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableVersioning({
        type: VersioningType.URI,
        prefix: 'api/',
        defaultVersion: '1',
    });

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

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