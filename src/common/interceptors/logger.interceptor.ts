import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);
    intercept<T>(context: ExecutionContext, next: CallHandler<T>): Observable<T> {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const url = request.url;
        const now = Date.now();

        // Foydalanuvchi ma'lumotini olish (agar mavjud bo‘lsa)
        const user = request.user
            ? request.user.role || request.user.email || request.user.id || 'unknown user'
            : 'guest';
        

        this.logger.log(`[REQUEST] ${method} ${url} | User: ${user}`);

        return next.handle().pipe(
            tap(() => {
                const ms = Date.now() - now;
                this.logger.log(
                    `[RESPONSE] ${method} ${url} | User: ${user} | ${ms}ms`,
                );
            }),
        );
    }
}
