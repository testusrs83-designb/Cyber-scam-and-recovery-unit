import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';
import { ConfigController } from './config/config.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AppController, HealthController, ConfigController],
  providers: [AppService],
})
export class AppModule {}
