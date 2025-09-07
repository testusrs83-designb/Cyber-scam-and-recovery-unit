import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Config')
@Controller('config')
export class ConfigController {
  @Get()
  get() {
    return {
      name: process.env.npm_package_name || 'backend',
      version: process.env.npm_package_version || '0.0.1',
      apiPrefix: process.env.API_PREFIX || '/api',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
