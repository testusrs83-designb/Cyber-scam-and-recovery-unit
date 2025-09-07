import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private retryAttempts = 5;
  private retryDelay = 5000; // 5 seconds

  constructor() {
    // Pass connection options via env (DATABASE_URL) and client options
    super({ log: ['query', 'error', 'warn', 'info'] })
  }

  async onModuleInit() {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        await this.$connect();
        this.logger.log('Successfully connected to database');
        return;
      } catch (error) {
        this.logger.error(`Failed to connect to database (attempt ${attempt}/${this.retryAttempts}): ${error.message}`);
        if (attempt === this.retryAttempts) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}

export default PrismaService
