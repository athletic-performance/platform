import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { getRequestId } from '../correlation/request-context';
import { StructuredLoggerService } from './structured-logger.service';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: StructuredLoggerService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startedAt = Date.now();

    res.on('finish', () => {
      this.logger.log('http_request', {
        requestId: getRequestId() ?? null,
        method: req.method,
        path: req.originalUrl.split('?')[0] ?? req.path,
        statusCode: res.statusCode,
        duration: Date.now() - startedAt,
      });
    });

    next();
  }
}
