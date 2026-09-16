import { Controller, Get, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('__test')
export class TestController {
  constructor(private readonly config: ConfigService) {}

  @Get('error')
  error(): never {
    if (this.config.get<string>('DEPLOYMENT_ENVIRONMENT') !== 'staging') {
      throw new NotFoundException();
    }

    throw new Error('FND-011 backend staging test');
  }
}
