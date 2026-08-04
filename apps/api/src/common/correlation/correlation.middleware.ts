import { randomUUID } from 'node:crypto';

import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { REQUEST_ID_HEADER } from './correlation.constants';
import { requestContext } from './request-context';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.header(REQUEST_ID_HEADER);
    const requestId =
      incoming && incoming.trim().length > 0 ? incoming.trim().slice(0, 128) : randomUUID();

    res.setHeader(REQUEST_ID_HEADER, requestId);
    requestContext.run({ requestId }, () => next());
  }
}
