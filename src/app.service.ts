import { Injectable } from '@nestjs/common';

export type HealthStatus = { status: 'ok'; uptime: number };

@Injectable()
export class AppService {
  getHealth(): HealthStatus {
    return { status: 'ok', uptime: Math.round(process.uptime()) };
  }
}
