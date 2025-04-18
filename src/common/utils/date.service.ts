// date.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class DateService {
    private timezone = 'Asia/Tashkent';

    getCurrentDate(): string {
        return new Date().toLocaleString('en-US', {
            timeZone: this.timezone,
        });
    }

    getCurrentISOString(): string {
        const date = new Date();
        date.setHours(date.getHours() + 5);
        return date.toISOString();
    }

    // formatUnixTimestamp(unixTimestamp: number): Date {
    //     const date = new Date(unixTimestamp * 1000);
    //     return new Date(date.toLocaleString('en-US', {
    //         timeZone: this.timezone
    //     }));
    // }

    // formatUnixTimestampToString(unixTimestamp: number): string {
    //     return this.formatUnixTimestamp(unixTimestamp)
    //         .toLocaleString('en-US', {
    //             timeZone: this.timezone,
    //             year: 'numeric',
    //             month: '2-digit',
    //             day: '2-digit',
    //             hour: '2-digit',
    //             minute: '2-digit',
    //             second: '2-digit',
    //             hour12: false
    //         });
    // }
}