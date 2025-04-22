// logger.interceptor.ts
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const { method, url, body, params, query } = req;
        const userAgent = req.get('user-agent') || '';
        const timestamp = new Date().toISOString();
        const handler = context.getHandler().name;

        this.logger.log(
            `\n🔹 Incoming Request ${'-'.repeat(50)}
            📆 Timestamp: ${timestamp}
            🎯 Endpoint: ${handler}
            📍 ${method} ${url}
            📦 Body: ${JSON.stringify(body, null, 2)}
            🔑 Params: ${JSON.stringify(params, null, 2)}
            ❓ Query: ${JSON.stringify(query, null, 2)}
            🌐 User-Agent: ${userAgent}
            ${'-'.repeat(70)}`
        );

        return next.handle();
    }
}
