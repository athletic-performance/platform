import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

import { REQUEST_ID_HEADER } from '../correlation/correlation.constants';
import { getRequestId } from '../correlation/request-context';
import { StructuredLoggerService } from '../logging/structured-logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: StructuredLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = getRequestId() ?? response.getHeader(REQUEST_ID_HEADER)?.toString() ?? null;

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.error('request_failed', exception instanceof Error ? exception.stack : undefined, {
      requestId,
      method: request.method,
      path: request.originalUrl.split('?')[0] ?? request.path,
      statusCode: status,
    });

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        response.status(status).json({
          statusCode: status,
          message: exceptionResponse,
          requestId,
          path: request.originalUrl.split('?')[0] ?? request.path,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        response.status(status).json({
          ...exceptionResponse,
          statusCode: status,
          requestId,
          path: request.originalUrl.split('?')[0] ?? request.path,
          timestamp: new Date().toISOString(),
        });
        return;
      }
    }

    response.status(status).json({
      statusCode: status,
      message: 'Внутренняя ошибка сервера',
      requestId,
      path: request.originalUrl.split('?')[0] ?? request.path,
      timestamp: new Date().toISOString(),
    });
  }
}
