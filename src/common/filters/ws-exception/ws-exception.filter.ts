// ws-exception.filter.ts
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch(WsException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
    catch(exception: WsException, host: ArgumentsHost) {
        const client = host.switchToWs().getClient<Socket>();
        const error = exception.getError();

        client.emit('error', {
            status: 'error',
            message: typeof error === 'object' ? error : error,
            timestamp: new Date().toISOString(),
            details: typeof error === 'object' ? error : undefined,
        });
        
        client.disconnect(true);
    }
}