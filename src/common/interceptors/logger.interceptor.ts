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
            `
            \t|${'-'.repeat(90)}
            \t|🔹 Incoming Request 
            \t|📆 Timestamp: ${timestamp} 
            \t|🎯 Endpoint: ${handler}    
            \t|📍 ${method} ${url}        
            \t|📦 Body: ${JSON.stringify(body, null, 4)} 
            \t|🔑 Params: ${JSON.stringify(params, null, 4)} 
            \t|❓ Query: ${JSON.stringify(query, null, 4)} 
            \t|🌐 User-Agent: ${userAgent} 
            \t|${'-'.repeat(90)}
            `
        );

        return next.handle();
    }
}
