import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('version')
export class VersionController {
  constructor(private readonly config: ConfigService) {}

  @Get()
  getVersion(): {
    service: 'api';
    version: string;
    commitSha: string;
  } {
    return {
      service: 'api',
      version: this.config.getOrThrow<string>('APP_VERSION'),
      commitSha: this.config.getOrThrow<string>('COMMIT_SHA'),
    };
  }
}
